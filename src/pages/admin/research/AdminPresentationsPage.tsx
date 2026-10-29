import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { PresentationFields } from '../../../api/contracts/commands'
import type { PresentationDto } from '../../../api/contracts/dtos'
import type { PresentationType } from '../../../api/contracts/enums'
import {
  createPresentation, getAdminPresentations, removePresentationImage, setPresentationImage, updatePresentation,
} from '../../../api/services/adminService'
import { ApiImage } from '../../../components/ui/ApiImage'
import { Button } from '../../../components/ui/Button'
import { Field, Select, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { labelOf, presentationTypes } from '../../../components/ui/labels'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, FilePicker, OrderButtons, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'presentations'] as const
const MAX_BYTES = 15 * 1024 * 1024

/** Posters and talks on the Research page, each with an optional picture. */
export default function AdminPresentationsPage() {
  const [params, setParams] = useSearchParams()
  const presentations = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminPresentations(signal)),
  })
  const list = useAdminList<PresentationDto>('presentations', key)
  const items = presentations.data ?? []

  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((p) => p.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website · Research" title="Presentations"
                 sub="Posters, talks and conferences on the Research page, in this order.">
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New presentation</Button>}
      </AdminHead>

      {(isNew || editing) && (
        <PresentationEditor key={editing?.id ?? 'new'} presentation={editing} onDone={close}
                            onCreated={(id) => setParams({ edit: id }, { replace: true })} />
      )}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={presentations.isLoading} error={presentations.error} isEmpty={items.length === 0}
                  emptyText="No presentations yet." onRetry={() => presentations.refetch()} />

      <ul className={styles.rows}>
        {items.map((p, index) => (
          <li key={p.id} className={`${styles.row} ${p.isPublished ? '' : styles.rowDraft}`}>
            <ApiImage src={p.image?.thumbnailUrl ?? p.image?.url} alt={p.image?.altText ?? p.title}
                      className={styles.rowThumb} />
            <div className={styles.rowText}>
              <strong title={p.title}>{p.title}</strong>
              <div className={styles.rowMeta}>
                <PublishedChip isPublished={p.isPublished} />
                <span>{labelOf(presentationTypes, p.type)}</span>
                <span>{p.year}</span>
                <span>{p.eventName}</span>
              </div>
            </div>
            <div className={styles.rowActions}>
              <OrderButtons index={index} count={items.length} onMove={list.move} name={p.title} />
              <Button variant="secondary" small busy={list.busyId === p.id} onClick={() => list.togglePublished(p)}>
                {p.isPublished ? 'Hide' : 'Publish'}
              </Button>
              <Button variant="secondary" small onClick={() => setParams({ edit: p.id })}>Edit</Button>
              <ConfirmDelete question="Delete this presentation?" onConfirm={() => list.deleteItem(p)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function PresentationEditor({ presentation, onDone, onCreated }: {
  presentation?: PresentationDto
  onDone: () => void
  onCreated: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<PresentationFields>(() => presentation
    ? { title: presentation.title, eventName: presentation.eventName, year: presentation.year, type: presentation.type }
    : { title: '', eventName: '', year: new Date().getFullYear(), type: 'Poster' })
  const [imageAlt, setImageAlt] = useState(presentation?.image?.altText ?? '')
  const [publishNow, setPublishNow] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const set = <K extends keyof PresentationFields>(k: K, v: PresentationFields[K]) =>
    setFields((f) => ({ ...f, [k]: v }))
  const err = (name: string) => error?.fieldError(name)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    // 1. The words
    const saved = presentation
      ? await updatePresentation(presentation.id, { ...fields, imageAlt: presentation.image ? imageAlt : null })
      : await createPresentation({ ...fields, isPublished: publishNow })
    if (!saved.ok) {
      setBusy(false)
      setError(saved.error)
      return
    }

    // 2. A new picture, if one was chosen
    if (file) {
      const uploaded = await setPresentationImage(saved.value.id, file, imageAlt.trim() || fields.title)
      if (!uploaded.ok) {
        setBusy(false)
        setError(uploaded.error)
        refresh()
        if (!presentation) onCreated(saved.value.id)   // keep it open to try the picture again
        return
      }
    }

    setBusy(false)
    refresh()
    onDone()
  }

  const onRemoveImage = async () => {
    if (!presentation) return
    const result = await removePresentationImage(presentation.id)
    if (!result.ok) setError(result.error)
    else refresh()
  }

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}><h2>{presentation ? 'Edit presentation' : 'New presentation'}</h2></div>

      <Field label="Title" value={fields.title} maxLength={300} onChange={(e) => set('title', e.target.value)}
             error={err('title')} />
      <div className={styles.grid3}>
        <Field label="Event" value={fields.eventName} maxLength={300} onChange={(e) => set('eventName', e.target.value)}
               error={err('eventName')} placeholder="Brunel Bioinformatics Symposium" />
        <Field label="Year" type="number" min={1950} max={2100} value={fields.year}
               onChange={(e) => set('year', Number(e.target.value))} error={err('year')} />
        <Select label="Type" value={fields.type} options={presentationTypes}
                onChange={(e) => set('type', e.target.value as PresentationType)} />
      </div>

      <div className={styles.grid2} style={{ alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Picture</span>
          {presentation?.image && !file && (
            <>
              <ApiImage src={presentation.image.url} alt={presentation.image.altText} className={styles.preview} />
              <div><ConfirmDelete label="Remove picture" question="Remove the picture?" onConfirm={onRemoveImage} /></div>
            </>
          )}
          <FilePicker file={file} onChange={setFile} accept="image/*" maxBytes={MAX_BYTES}
                      label={presentation?.image ? 'Replace the picture' : 'Choose a picture'}
                      hint="Poster or photo, up to 15 MB." />
        </div>
        {(file || presentation?.image) && (
          <Field label="Picture description" value={imageAlt} maxLength={300} onChange={(e) => setImageAlt(e.target.value)}
                 error={err('altText') ?? err('imageAlt')} hint="For screen readers: what the picture shows." />
        )}
      </div>

      {!presentation && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}

      {error && <StatusBanner message={error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{presentation ? 'Save changes' : 'Add presentation'}</Button>
      </div>
    </form>
  )
}
