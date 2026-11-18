import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { QualificationFields } from '../../../api/contracts/commands'
import type { QualificationDto } from '../../../api/contracts/dtos'
import { createQualification, getAdminEducation, updateQualification } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'education'] as const

/**
 * Education: the qualifications under "Education" on the Experience page and in the CVs. The order comes from the
 * year (in progress first, then newest), so there's nothing to drag.
 */
export default function AdminEducationPage() {
  const [params, setParams] = useSearchParams()
  const education = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminEducation(signal)),
  })
  const list = useAdminList<QualificationDto>('education', key)
  const items = education.data ?? []

  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((q) => q.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website" title="Education"
                 sub="Shown under Education on the Experience page, in progress first, then newest. Also used by the CVs.">
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New qualification</Button>}
      </AdminHead>

      {(isNew || editing) && (
        <QualificationEditor key={editing?.id ?? 'new'} qualification={editing} onDone={close} />
      )}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={education.isLoading} error={education.error} isEmpty={items.length === 0}
                  emptyText="No qualifications yet. Add the first one." onRetry={() => education.refetch()} />

      <ul className={styles.rows}>
        {items.map((q) => {
          const name = `${q.degree}, ${q.subject}`
          return (
            <li key={q.id} className={`${styles.row} ${q.isPublished ? '' : styles.rowDraft}`}>
              <div className={styles.rowText}>
                <strong title={name}>{name}</strong>
                <div className={styles.rowMeta}>
                  <PublishedChip isPublished={q.isPublished} />
                  <span>{q.institution}</span>
                  <span>{q.year ?? 'In progress'}</span>
                  {q.note && <span>{q.note}</span>}
                </div>
              </div>
              <div className={styles.rowActions}>
                <Button variant="secondary" small busy={list.busyId === q.id} onClick={() => list.togglePublished(q)}>
                  {q.isPublished ? 'Hide' : 'Publish'}
                </Button>
                <Button variant="secondary" small onClick={() => setParams({ edit: q.id })}>Edit</Button>
                <ConfirmDelete question={`Delete "${name}"?`} onConfirm={() => list.deleteItem(q)} />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/** The form's own state: the year as text while typing. */
interface Form {
  degree: string
  subject: string
  institution: string
  location: string
  isInProgress: boolean
  year: string
  note: string
}

const toForm = (q?: QualificationDto): Form => q
  ? { degree: q.degree, subject: q.subject, institution: q.institution, location: q.location ?? '',
      isInProgress: q.isInProgress, year: q.year ? String(q.year) : '', note: q.note ?? '' }
  : { degree: '', subject: '', institution: '', location: '', isInProgress: false, year: '', note: '' }

const toFields = (f: Form): QualificationFields => ({
  degree: f.degree.trim(),
  subject: f.subject.trim(),
  institution: f.institution.trim(),
  location: f.location.trim() || null,
  year: f.isInProgress ? null : (Number(f.year) || 0),
  note: f.note.trim() || null,
})

function QualificationEditor({ qualification, onDone }: { qualification?: QualificationDto; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Form>(() => toForm(qualification))
  const [publishNow, setPublishNow] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const err = (name: string) => error?.fieldError(name)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const fields = toFields(form)
    const saved = qualification
      ? await updateQualification(qualification.id, fields)
      : await createQualification({ ...fields, isPublished: publishNow })
    setBusy(false)
    if (!saved.ok) {
      setError(saved.error)
      return
    }
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
    onDone()
  }

  const fieldProblems = !!error && Object.keys(error.fieldErrors).length > 0

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}><h2>{qualification ? 'Edit qualification' : 'New qualification'}</h2></div>

      <div className={styles.grid2}>
        <Field label="Degree or award" value={form.degree} maxLength={100}
               onChange={(e) => set('degree', e.target.value)} error={err('degree')} placeholder="M.Tech" />
        <Field label="Subject" value={form.subject} maxLength={150}
               onChange={(e) => set('subject', e.target.value)} error={err('subject')} placeholder="Computer Science" />
      </div>

      <div className={styles.grid2}>
        <Field label="Institution" value={form.institution} maxLength={150}
               onChange={(e) => set('institution', e.target.value)} error={err('institution')}
               placeholder="University of Uyo" />
        <Field label="Place" optional value={form.location} maxLength={100}
               onChange={(e) => set('location', e.target.value)} error={err('location')} placeholder="Uyo, Nigeria" />
      </div>

      <Toggle label="In progress" checked={form.isInProgress} onChange={(v) => set('isInProgress', v)}
              hint='Shown as "In progress", with no year.' />

      <div className={styles.grid2}>
        {!form.isInProgress && (
          <Field label="Year completed" type="number" inputMode="numeric" min={1950} max={2100} value={form.year}
                 onChange={(e) => set('year', e.target.value)} error={err('year')} />
        )}
        <Field label="Grade or note" optional value={form.note} maxLength={200}
               onChange={(e) => set('note', e.target.value)} error={err('note')}
               placeholder="Distinction, CGPA 4.48/5.00" />
      </div>

      {!qualification && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}

      {error && <StatusBanner message={fieldProblems ? 'Please check the fields marked in red.' : error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{qualification ? 'Save changes' : 'Add qualification'}</Button>
      </div>
    </form>
  )
}
