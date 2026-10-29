import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { AwardFields } from '../../../api/contracts/commands'
import type { AwardDto } from '../../../api/contracts/dtos'
import {
  createAward, getAdminAwards, removeAwardImage, setAwardImage, updateAward,
} from '../../../api/services/adminService'
import { ApiImage } from '../../../components/ui/ApiImage'
import { Button } from '../../../components/ui/Button'
import { Field, TextArea, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, FilePicker, OrderButtons, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'awards'] as const
const MAX_BYTES = 15 * 1024 * 1024

/**
 * Awards and recognition: listed on the Awards page. "Featured" ones also show on About and Experience. Each can
 * have a certificate or photo.
 */
export default function AdminAwardsPage() {
  const [params, setParams] = useSearchParams()
  const awards = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminAwards(signal)),
  })
  const list = useAdminList<AwardDto>('awards', key)
  const items = awards.data ?? []

  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((a) => a.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website" title="Awards"
                 sub="Listed on the Awards page in this order. Featured awards also show on the About and Experience pages.">
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New award</Button>}
      </AdminHead>

      {(isNew || editing) && (
        <AwardEditor key={editing?.id ?? 'new'} award={editing} onDone={close}
                     onCreated={(id) => setParams({ edit: id }, { replace: true })} />
      )}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={awards.isLoading} error={awards.error} isEmpty={items.length === 0}
                  emptyText="No awards yet. Add the first one." onRetry={() => awards.refetch()} />

      <ul className={styles.rows}>
        {items.map((a, index) => (
          <li key={a.id} className={`${styles.row} ${a.isPublished ? '' : styles.rowDraft}`}>
            <ApiImage src={a.image?.thumbnailUrl ?? a.image?.url} alt={a.image?.altText ?? a.title}
                      className={styles.rowThumb} />
            <div className={styles.rowText}>
              <strong title={a.title}>{a.title}</strong>
              <div className={styles.rowMeta}>
                <PublishedChip isPublished={a.isPublished} />
                {a.isFeatured && <span className={`${styles.chip} ${styles.chipNew}`}>Featured</span>}
                <span>{a.year}</span>
                <span>{a.awardedBy}</span>
              </div>
            </div>
            <div className={styles.rowActions}>
              <OrderButtons index={index} count={items.length} onMove={list.move} name={a.title} />
              <Button variant="secondary" small busy={list.busyId === a.id} onClick={() => list.togglePublished(a)}>
                {a.isPublished ? 'Hide' : 'Publish'}
              </Button>
              <Button variant="secondary" small onClick={() => setParams({ edit: a.id })}>Edit</Button>
              <ConfirmDelete question={`Delete "${a.title}"?`} onConfirm={() => list.deleteItem(a)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function AwardEditor({ award, onDone, onCreated }: {
  award?: AwardDto
  onDone: () => void
  onCreated: (id: string) => void
}) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<AwardFields>(() => award
    ? { title: award.title, awardedBy: award.awardedBy, year: award.year, description: award.description,
        url: award.url ?? '', isFeatured: award.isFeatured }
    : { title: '', awardedBy: '', year: new Date().getFullYear(), description: '', url: '', isFeatured: true })
  const [imageAlt, setImageAlt] = useState(award?.image?.altText ?? '')
  const [publishNow, setPublishNow] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const set = <K extends keyof AwardFields>(k: K, v: AwardFields[K]) => setFields((f) => ({ ...f, [k]: v }))
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
    const body: AwardFields = { ...fields, url: fields.url?.trim() || null }

    // 1. The words
    const saved = award
      ? await updateAward(award.id, { ...body, imageAlt: award.image ? imageAlt : null })
      : await createAward({ ...body, isPublished: publishNow })
    if (!saved.ok) {
      setBusy(false)
      setError(saved.error)
      return
    }

    // 2. A new picture, if one was chosen
    if (file) {
      const uploaded = await setAwardImage(saved.value.id, file, imageAlt.trim() || fields.title)
      if (!uploaded.ok) {
        setBusy(false)
        setError(uploaded.error)
        refresh()
        if (!award) onCreated(saved.value.id)   // keep it open to try the picture again
        return
      }
    }

    setBusy(false)
    refresh()
    onDone()
  }

  const onRemoveImage = async () => {
    if (!award) return
    const result = await removeAwardImage(award.id)
    if (!result.ok) setError(result.error)
    else refresh()
  }

  const fieldProblems = !!error && Object.keys(error.fieldErrors).length > 0

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}><h2>{award ? 'Edit award' : 'New award'}</h2></div>

      <div className={styles.grid3}>
        <Field className={styles.span2} label="Award" value={fields.title} maxLength={150}
               onChange={(e) => set('title', e.target.value)} error={err('title')} placeholder="Best Paper Award" />
        <Field label="Year" type="number" min={1950} max={2100} value={fields.year}
               onChange={(e) => set('year', Number(e.target.value))} error={err('year')} />
      </div>
      <Field label="Awarded by" value={fields.awardedBy} maxLength={200} onChange={(e) => set('awardedBy', e.target.value)}
             error={err('awardedBy')} placeholder="ICCVDM 2025, or National Examinations Council (NECO)"
             hint="Who gave it, or the event." />
      <TextArea label="What it was for" rows={4} value={fields.description} maxLength={1000}
                onChange={(e) => set('description', e.target.value)} error={err('description')} />
      <Field label="Read more link" optional type="url" value={fields.url ?? ''} maxLength={500}
             onChange={(e) => set('url', e.target.value)} error={err('url')} placeholder="https://…"
             hint="An announcement, the paper, or a news story." />

      <div className={styles.grid2} style={{ alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Certificate or photo <span className={styles.muted} style={{ fontWeight: 400 }}>(optional)</span></span>
          {award?.image && !file && (
            <>
              <ApiImage src={award.image.url} alt={award.image.altText} className={styles.preview} />
              <div><ConfirmDelete label="Remove picture" question="Remove the picture?" onConfirm={onRemoveImage} /></div>
            </>
          )}
          <FilePicker file={file} onChange={setFile} accept="image/*" maxBytes={MAX_BYTES}
                      label={award?.image ? 'Replace the picture' : 'Choose a picture'}
                      hint="JPEG, PNG or WebP up to 15 MB." />
        </div>
        {(file || award?.image) && (
          <Field label="Picture description" value={imageAlt} maxLength={300} onChange={(e) => setImageAlt(e.target.value)}
                 error={err('altText') ?? err('imageAlt')} hint="For screen readers: what the picture shows." />
        )}
      </div>

      <Toggle label="Featured" checked={fields.isFeatured} onChange={(v) => set('isFeatured', v)}
              hint="Also show it as a highlight on the About and Experience pages." />
      {!award && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}

      {error && <StatusBanner message={fieldProblems ? 'Please check the fields marked in red.' : error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{award ? 'Save changes' : 'Add award'}</Button>
      </div>
    </form>
  )
}
