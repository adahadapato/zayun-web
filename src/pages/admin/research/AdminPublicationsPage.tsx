import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { PublicationFields } from '../../../api/contracts/commands'
import type { PublicationDto, PublicationLinkDto } from '../../../api/contracts/dtos'
import type { PublicationType } from '../../../api/contracts/enums'
import { createPublication, getAdminPublications, updatePublication } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Select, TextArea, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { labelOf, publicationTypes } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, OrderButtons, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'publications'] as const
const MAX_LINKS = 6

const empty = (): PublicationFields => ({
  title: '', authors: '', venue: '', year: new Date().getFullYear(), type: 'ConferencePaper', award: '', links: [],
})

/** Publications on the Research page: add, edit (with "read it here" links), show / hide, order, delete. */
export default function AdminPublicationsPage() {
  const [params, setParams] = useSearchParams()
  const publications = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminPublications(signal)),
  })
  const list = useAdminList<PublicationDto>('publications', key)
  const items = publications.data ?? []

  // Which item is open: ?edit={id}, or ?new=1 (kept in the address so Back closes it)
  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((p) => p.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website · Research" title="Publications"
                 sub="Papers and articles listed on the Research page, in this order.">
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New publication</Button>}
      </AdminHead>

      {(isNew || editing) && <PublicationEditor key={editing?.id ?? 'new'} publication={editing} onDone={close} />}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={publications.isLoading} error={publications.error} isEmpty={items.length === 0}
                  emptyText="No publications yet." onRetry={() => publications.refetch()} />

      <ul className={styles.rows}>
        {items.map((p, index) => (
          <li key={p.id} className={`${styles.row} ${p.isPublished ? '' : styles.rowDraft}`}
              style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
            <div className={styles.rowText}>
              <strong title={p.title}>{p.title}</strong>
              <div className={styles.rowMeta}>
                <PublishedChip isPublished={p.isPublished} />
                <span>{labelOf(publicationTypes, p.type)}</span>
                <span>{p.year}</span>
                <span>{p.venue}</span>
                {p.award && <span>🏆 {p.award}</span>}
              </div>
            </div>
            <div className={styles.rowActions}>
              <OrderButtons index={index} count={items.length} onMove={list.move} name={p.title} />
              <Button variant="secondary" small busy={list.busyId === p.id} onClick={() => list.togglePublished(p)}>
                {p.isPublished ? 'Hide' : 'Publish'}
              </Button>
              <Button variant="secondary" small onClick={() => setParams({ edit: p.id })}>Edit</Button>
              <ConfirmDelete question="Delete this publication?" onConfirm={() => list.deleteItem(p)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function PublicationEditor({ publication, onDone }: { publication?: PublicationDto; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<PublicationFields>(() => publication
    ? { ...publication, award: publication.award ?? '' }
    : empty())
  const [publishNow, setPublishNow] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const set = <K extends keyof PublicationFields>(k: K, v: PublicationFields[K]) => setFields((f) => ({ ...f, [k]: v }))
  const setLink = (index: number, link: Partial<PublicationLinkDto>) =>
    set('links', fields.links.map((l, i) => {
      if (i === index) return { ...l, ...link }
      // Only one link is the main one
      return link.isPrimary ? { ...l, isPrimary: false } : l
    }))
  const err = (name: string) => error?.fieldError(name)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const body: PublicationFields = {
      ...fields,
      award: fields.award?.trim() || null,
      links: fields.links.filter((l) => l.label.trim() || l.url.trim()),
    }
    const result = publication
      ? await updatePublication(publication.id, body)
      : await createPublication({ ...body, isPublished: publishNow })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
    onDone()
  }

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}><h2>{publication ? 'Edit publication' : 'New publication'}</h2></div>

      <TextArea label="Title" rows={2} value={fields.title} maxLength={300} onChange={(e) => set('title', e.target.value)}
                error={err('title')} />
      <Field label="Authors" value={fields.authors} maxLength={600} onChange={(e) => set('authors', e.target.value)}
             error={err('authors')} placeholder="E. Adahada, …" />
      <Field label="Where it was published" value={fields.venue} maxLength={500}
             onChange={(e) => set('venue', e.target.value)} error={err('venue')}
             placeholder="IEEE International Conference on …" />
      <div className={styles.grid3}>
        <Field label="Year" type="number" min={1950} max={2100} value={fields.year}
               onChange={(e) => set('year', Number(e.target.value))} error={err('year')} />
        <Select label="Type" value={fields.type} options={publicationTypes}
                onChange={(e) => set('type', e.target.value as PublicationType)} />
        <Field label="Award" optional value={fields.award ?? ''} maxLength={100}
               onChange={(e) => set('award', e.target.value)} error={err('award')} placeholder="Best Paper Award" />
      </div>

      <fieldset style={{ display: 'grid', gap: 12, margin: 0, padding: 0, border: 0 }}>
        <legend style={{ marginBottom: 10, fontWeight: 600, fontSize: '0.88rem' }}>Links ({fields.links.length} of {MAX_LINKS})</legend>
        {fields.links.map((link, i) => (
          <div key={i} className={styles.grid3} style={{ alignItems: 'end' }}>
            <Field label="Label" value={link.label} maxLength={60} placeholder="View on IEEE Xplore"
                   onChange={(e) => setLink(i, { label: e.target.value })} error={err(`links[${i}].label`)} />
            <Field label="Address" type="url" value={link.url} maxLength={500} placeholder="https://…"
                   onChange={(e) => setLink(i, { url: e.target.value })} error={err(`links[${i}].url`)} />
            <div className={styles.actions} style={{ minHeight: 46 }}>
              <label className={styles.checkbox}>
                <input type="radio" name="primary-link" checked={link.isPrimary}
                       onChange={() => setLink(i, { isPrimary: true })} /> Main link
              </label>
              <Button variant="plain" small onClick={() => set('links', fields.links.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        {fields.links.length < MAX_LINKS && (
          <div>
            <Button variant="secondary" small onClick={() =>
              set('links', [...fields.links, { label: '', url: '', isPrimary: fields.links.length === 0 }])}>
              + Add a link
            </Button>
          </div>
        )}
      </fieldset>

      {!publication && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}

      {error && <StatusBanner message={Object.keys(error.fieldErrors).length ? 'Please check the fields marked in red.'
        : error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{publication ? 'Save changes' : 'Add publication'}</Button>
      </div>
    </form>
  )
}
