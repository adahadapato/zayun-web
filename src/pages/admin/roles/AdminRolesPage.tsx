import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { CareerRoleFields } from '../../../api/contracts/commands'
import type { CareerRoleDto } from '../../../api/contracts/dtos'
import type { CareerRoleKind } from '../../../api/contracts/enums'
import { createCareerRole, getAdminCareerRoles, updateCareerRole } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { MONTHS, ROLE_KINDS, roleDates, roleKindLabel } from '../../../components/ui/careerDates'
import { Field, Select, TextArea, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, PublishedChip } from '../AdminParts'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'career-roles'] as const
const MAX_HIGHLIGHTS = 6
const HIGHLIGHT_MAX = 300

const MONTH_OPTIONS = [{ value: '', label: 'No month' }, ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))]

/**
 * Roles (jobs, research, teaching, other experience): shown on the Experience page under "Roles", grouped by kind,
 * and used by the CVs. The order comes from the dates (current first, then newest), so there's nothing to drag.
 */
export default function AdminRolesPage() {
  const [params, setParams] = useSearchParams()
  const roles = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminCareerRoles(signal)),
  })
  const list = useAdminList<CareerRoleDto>('career-roles', key)
  const items = roles.data ?? []

  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((r) => r.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      <AdminHead eyebrow="Website" title="Roles"
                 sub="Shown on the Experience page, grouped by kind, current roles first, then newest. Also used by the CVs.">
        {!isNew && <Button onClick={() => setParams({ new: '1' })}>New role</Button>}
      </AdminHead>

      {(isNew || editing) && (
        <RoleEditor key={editing?.id ?? 'new'} role={editing} onDone={close} />
      )}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={roles.isLoading} error={roles.error} isEmpty={items.length === 0}
                  emptyText="No roles yet. Add the first one." onRetry={() => roles.refetch()} />

      <ul className={styles.rows}>
        {items.map((r) => (
          <li key={r.id} className={`${styles.row} ${r.isPublished ? '' : styles.rowDraft}`}>
            <div className={styles.rowText}>
              <strong title={r.title}>{r.title}</strong>
              <div className={styles.rowMeta}>
                <PublishedChip isPublished={r.isPublished} />
                <span>{roleKindLabel(r.kind)}</span>
                <span>{r.organisation}</span>
                <span>{roleDates(r)}</span>
              </div>
            </div>
            <div className={styles.rowActions}>
              <Button variant="secondary" small busy={list.busyId === r.id} onClick={() => list.togglePublished(r)}>
                {r.isPublished ? 'Hide' : 'Publish'}
              </Button>
              <Button variant="secondary" small onClick={() => setParams({ edit: r.id })}>Edit</Button>
              <ConfirmDelete question={`Delete "${r.title}"?`} onConfirm={() => list.deleteItem(r)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

/** The form's own state: numbers as text while typing, highlights as one per line. */
interface Form {
  kind: CareerRoleKind
  title: string
  organisation: string
  location: string
  startYear: string
  startMonth: string
  isCurrent: boolean
  endYear: string
  endMonth: string
  summary: string
  highlights: string
}

const toForm = (r?: CareerRoleDto): Form => r
  ? {
      kind: r.kind, title: r.title, organisation: r.organisation, location: r.location ?? '',
      startYear: String(r.startYear), startMonth: r.startMonth ? String(r.startMonth) : '',
      isCurrent: r.isCurrent, endYear: r.endYear ? String(r.endYear) : '', endMonth: r.endMonth ? String(r.endMonth) : '',
      summary: r.summary ?? '', highlights: r.highlights.join('\n'),
    }
  : {
      kind: 'Professional', title: '', organisation: '', location: '', startYear: '', startMonth: '',
      isCurrent: false, endYear: '', endMonth: '', summary: '', highlights: '',
    }

/** One highlight per non-empty line. */
const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)

const toFields = (f: Form): CareerRoleFields => ({
  kind: f.kind,
  title: f.title.trim(),
  organisation: f.organisation.trim(),
  location: f.location.trim() || null,
  startYear: Number(f.startYear) || 0,
  startMonth: f.startMonth ? Number(f.startMonth) : null,
  endYear: f.isCurrent ? null : (Number(f.endYear) || 0),
  endMonth: f.isCurrent || !f.endMonth ? null : Number(f.endMonth),
  summary: f.summary.trim() || null,
  highlights: lines(f.highlights),
})

function RoleEditor({ role, onDone }: { role?: CareerRoleDto; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Form>(() => toForm(role))
  const [publishNow, setPublishNow] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const err = (name: string) => error?.fieldError(name)

  const highlights = lines(form.highlights)
  const longest = highlights.reduce((max, h) => Math.max(max, h.length), 0)
  const highlightProblem = highlights.length > MAX_HIGHLIGHTS
    ? `${highlights.length} highlights: please keep it to ${MAX_HIGHLIGHTS}.`
    : longest > HIGHLIGHT_MAX ? `One highlight is ${longest} characters: please keep each under ${HIGHLIGHT_MAX}.` : undefined

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const fields = toFields(form)
    const saved = role ? await updateCareerRole(role.id, fields) : await createCareerRole({ ...fields, isPublished: publishNow })
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
      <div className={styles.panelHead}><h2>{role ? 'Edit role' : 'New role'}</h2></div>

      <div className={styles.grid3}>
        <Field className={styles.span2} label="Job title" value={form.title} maxLength={150}
               onChange={(e) => set('title', e.target.value)} error={err('title')}
               placeholder="Graduate Teaching Assistant" />
        <Select label="Kind" value={form.kind} options={ROLE_KINDS}
                onChange={(e) => set('kind', e.target.value as CareerRoleKind)} error={err('kind')}
                hint="Decides its group on the Experience page." />
      </div>

      <div className={styles.grid2}>
        <Field label="Organisation" value={form.organisation} maxLength={150}
               onChange={(e) => set('organisation', e.target.value)} error={err('organisation')}
               placeholder="Brunel University London" />
        <Field label="Place" optional value={form.location} maxLength={100}
               onChange={(e) => set('location', e.target.value)} error={err('location')}
               placeholder="London, United Kingdom, or Remote" />
      </div>

      <div className={styles.grid2}>
        <Field label="Start year" type="number" inputMode="numeric" min={1950} max={2100} value={form.startYear}
               onChange={(e) => set('startYear', e.target.value)} error={err('startYear')} />
        <Select label="Start month" optional value={form.startMonth} options={MONTH_OPTIONS}
                onChange={(e) => set('startMonth', e.target.value)} error={err('startMonth')}
                hint="Leave as No month to show only the year." />
      </div>

      <Toggle label="Current role" checked={form.isCurrent} onChange={(v) => set('isCurrent', v)}
              hint='Shown as "– Present", with no end date.' />

      {!form.isCurrent && (
        <div className={styles.grid2}>
          <Field label="End year" type="number" inputMode="numeric" min={1950} max={2100} value={form.endYear}
                 onChange={(e) => set('endYear', e.target.value)} error={err('endYear')} />
          <Select label="End month" optional value={form.endMonth} options={MONTH_OPTIONS}
                  onChange={(e) => set('endMonth', e.target.value)} error={err('endMonth')} />
        </div>
      )}

      <Field label="Summary" optional value={form.summary} maxLength={500}
             onChange={(e) => set('summary', e.target.value)} error={err('summary')}
             hint='One line about the role, e.g. "Doctoral-level research in medical AI (degree not awarded)."' />

      <TextArea label="Highlights" optional rows={6} value={form.highlights}
                onChange={(e) => set('highlights', e.target.value)} error={err('highlights') ?? highlightProblem}
                hint={`One per line, up to ${MAX_HIGHLIGHTS} (${highlights.length} now). Each becomes a bullet point.`} />

      {!role && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}

      {error && <StatusBanner message={fieldProblems ? 'Please check the fields marked in red.' : error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{role ? 'Save changes' : 'Add role'}</Button>
      </div>
    </form>
  )
}
