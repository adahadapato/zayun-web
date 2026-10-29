import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError, unwrap } from '../../../api/apiError'
import type { CoreExpertiseDto, SkillGroupDto, SkillsPageDto } from '../../../api/contracts/dtos'
import {
  createCoreExpertise, createSkillGroup, getAdminSkills, renameCoreExpertise, updateSkillGroup,
} from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete, OrderButtons } from '../AdminParts'
import { TextGroupList } from '../TextGroups'
import { useAdminList } from '../useAdminList'

const key = ['admin', 'skills'] as const

/** The Skills page: the skill groups (with their skills) and the "core expertise" list. */
export default function AdminSkillsPage() {
  const skills = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getAdminSkills(signal)),
  })
  const groups = useAdminList<SkillGroupDto, SkillsPageDto>('skills/groups', key, {
    get: (d) => d.groups,
    set: (d, groups) => ({ ...d, groups }),
  })

  return (
    <>
      <AdminHead eyebrow="Website" title="Skills"
                 sub="Skill groups and core expertise on the Skills page, in this order." />

      <section className={styles.panel} aria-labelledby="groups">
        <div className={styles.panelHead}><h2 id="groups">Skill groups</h2></div>
        <TextGroupList items={skills.data?.groups ?? []} isLoading={skills.isLoading} error={skills.error}
                       onRetry={() => skills.refetch()} list={groups} queryKey={key}
                       words={{ noun: 'skill group', maxSkills: 40, maxDescription: 2000 }}
                       create={createSkillGroup} update={updateSkillGroup} />
      </section>

      {skills.data && <CoreExpertise items={skills.data.coreExpertise} />}
    </>
  )
}

/** Short names ("Machine learning", "Clean Architecture") shown as chips: add, rename, show / hide, order. */
function CoreExpertise({ items }: { items: CoreExpertiseDto[] }) {
  const queryClient = useQueryClient()
  const list = useAdminList<CoreExpertiseDto, SkillsPageDto>('skills/expertise', key, {
    get: (d) => d.coreExpertise,
    set: (d, coreExpertise) => ({ ...d, coreExpertise }),
  })
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key })
    list.touched()
  }

  const onAdd = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    const result = await createCoreExpertise(name.trim(), true)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setName('')
    refresh()
  }

  const onRename = async (event: FormEvent) => {
    event.preventDefault()
    if (!renaming) return
    setError(null)
    const result = await renameCoreExpertise(renaming.id, renaming.name.trim())
    if (!result.ok) {
      setError(result.error)
      return
    }
    setRenaming(null)
    refresh()
  }

  return (
    <section className={styles.panel} aria-labelledby="core">
      <div className={styles.panelHead}>
        <div>
          <h2 id="core">Core expertise</h2>
          <p>Short names shown as chips at the top of the Skills page.</p>
        </div>
      </div>

      <form className={styles.actions} onSubmit={onAdd} style={{ alignItems: 'end' }} noValidate>
        <Field label="Add" value={name} maxLength={100} onChange={(e) => setName(e.target.value)}
               placeholder="e.g. Machine learning" style={{ minWidth: 260 }} />
        <Button type="submit" busy={busy} busyText="Adding…" disabled={!name.trim()}>Add</Button>
      </form>

      <StatusBanner message={(error ?? list.error)?.displayMessage} isError />
      <ListStatus isLoading={false} error={null} isEmpty={items.length === 0} emptyText="Nothing here yet."
                  onRetry={() => undefined} />

      <ul className={styles.rows}>
        {items.map((item, index) => (
          <li key={item.id} className={`${styles.row} ${item.isPublished ? '' : styles.rowDraft}`}
              style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', padding: '10px 14px' }}>
            {renaming?.id === item.id ? (
              <form className={styles.actions} onSubmit={onRename} noValidate>
                <Field label={`New name for ${item.name}`} value={renaming.name} maxLength={100} autoFocus
                       onChange={(e) => setRenaming({ id: item.id, name: e.target.value })} />
                <Button type="submit" small>Save</Button>
                <Button variant="plain" small onClick={() => setRenaming(null)}>Cancel</Button>
              </form>
            ) : (
              <div className={styles.rowText}>
                <strong>{item.name}</strong>
                {!item.isPublished && <span className={styles.muted} style={{ fontSize: '0.8rem' }}>Hidden</span>}
              </div>
            )}
            <div className={styles.rowActions}>
              <OrderButtons index={index} count={items.length} onMove={list.move} name={item.name} />
              <Button variant="secondary" small busy={list.busyId === item.id} onClick={() => list.togglePublished(item)}>
                {item.isPublished ? 'Hide' : 'Show'}
              </Button>
              <Button variant="secondary" small onClick={() => setRenaming({ id: item.id, name: item.name })}>Rename</Button>
              <ConfirmDelete question={`Delete "${item.name}"?`} onConfirm={() => list.deleteItem(item)} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
