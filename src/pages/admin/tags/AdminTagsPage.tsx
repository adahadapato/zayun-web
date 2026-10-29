import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { TagCheckDto, TagDto } from '../../../api/contracts/dtos'
import { checkTag, createTag, getTags, mergeTag, remove, renameTag } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Select } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import { tagKey } from '../../../components/ui/tagKey'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete } from '../AdminParts'
import { tagsKey } from './tagsKey'

/** "2 projects · 1 skill group", or "Not used". */
const usageText = (t: TagDto) => {
  const parts = [
    t.projects && `${t.projects} ${t.projects === 1 ? 'project' : 'projects'}`,
    t.experienceAreas && `${t.experienceAreas} experience ${t.experienceAreas === 1 ? 'area' : 'areas'}`,
    t.skillGroups && `${t.skillGroups} skill ${t.skillGroups === 1 ? 'group' : 'groups'}`,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Not used'
}

/**
 * The shared tag list used by project tags, experience skills and skill-group skills. Rename a tag everywhere, merge
 * two that mean the same thing, or delete one nothing uses. The search is kept in the address (?q=…).
 */
export default function AdminTagsPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tags = useQuery({
    queryKey: tagsKey,
    queryFn: async ({ signal }) => unwrap(await getTags(signal)),
  })
  const all = tags.data ?? []
  const shown = q ? all.filter((t) => tagKey(t.name).includes(tagKey(q)) || t.aliases.some((a) => a.includes(tagKey(q)))) : all
  const [error, setError] = useState<ApiError | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  /** A rename or merge changes projects, experience and skills too. */
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: tagsKey })
    for (const area of ['projects', 'experience', 'skills']) void queryClient.invalidateQueries({ queryKey: ['admin', area] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
  }

  const onDelete = async (tag: TagDto) => {
    setError(null)
    const result = await remove('tags', tag.id)
    if (!result.ok) setError(result.error)
    else refresh()
  }

  return (
    <>
      <AdminHead eyebrow="Website" title="Tags"
                 sub="One list for project tags, experience skills and skill-group skills, so the same thing is always written the same way. New tags are also added when you save an item." />

      <NewTag onAdded={refresh} />

      <div className={styles.actions} style={{ margin: '4px 0 16px' }}>
        <Field label="Search" value={q} placeholder="e.g. react"
               onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
               style={{ minWidth: 280 }} />
        {tags.data && <span className={styles.muted}>{shown.length} of {all.length} tags</span>}
      </div>

      <StatusBanner message={error?.displayMessage} isError />
      <ListStatus isLoading={tags.isLoading} error={tags.error} isEmpty={shown.length === 0}
                  emptyText={q ? 'No tags match.' : 'No tags yet.'} onRetry={() => tags.refetch()} />

      <ul className={styles.rows}>
        {shown.map((tag) => (
          <li key={tag.id}>
            {openId === tag.id
              ? <TagEditor tag={tag} others={all.filter((t) => t.id !== tag.id)}
                           onDone={() => { setOpenId(null); refresh() }} onCancel={() => setOpenId(null)} />
              : (
                <div className={styles.row} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', padding: '12px 16px' }}>
                  <div className={styles.rowText}>
                    <strong>{tag.name}</strong>
                    <div className={styles.rowMeta}>
                      <span className={`${styles.chip} ${tag.usedBy ? styles.chipLive : styles.chipDraft}`}>
                        {tag.usedBy ? `Used ${tag.usedBy}×` : 'Not used'}
                      </span>
                      {tag.usedBy > 0 && <span>{usageText(tag)}</span>}
                      {tag.aliases.length > 0 && (
                        <span title="Other spellings that find this tag">also: {tag.aliases.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <Button variant="secondary" small onClick={() => setOpenId(tag.id)}>Rename or merge</Button>
                    {tag.usedBy === 0 && <ConfirmDelete question={`Delete "${tag.name}"?`} onConfirm={() => onDelete(tag)} />}
                  </div>
                </div>
              )}
          </li>
        ))}
      </ul>
    </>
  )
}

/** Add a tag: checked first (built-in rules, then AI), so duplicates and misspellings are caught. */
function NewTag({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('')
  const [checked, setChecked] = useState<TagCheckDto | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onCheck = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    const result = await checkTag(name)
    setBusy(false)
    if (!result.ok) setError(result.error)
    else setChecked(result.value)
  }

  const onAdd = async (tagName: string) => {
    setBusy(true)
    setError(null)
    const result = await createTag(tagName)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setName('')
    setChecked(null)
    onAdded()
  }

  return (
    <section className={styles.panel} aria-labelledby="new-tag">
      <div className={styles.panelHead}><h2 id="new-tag">Add a tag</h2></div>
      <form className={styles.actions} onSubmit={onCheck} style={{ alignItems: 'end' }} noValidate>
        <Field label="Tag" value={name} maxLength={60} placeholder="e.g. PyTorch"
               onChange={(e) => { setName(e.target.value); setChecked(null) }} style={{ minWidth: 280 }}
               error={error?.fieldError('name')} />
        <Button type="submit" busy={busy && !checked} busyText="Checking…" disabled={!name.trim()}>Check</Button>
      </form>

      {checked && (
        <div className={styles.actions}>
          <span className={`${styles.chip} ${checked.status === 'Existing' ? styles.chipLive
            : checked.status === 'New' ? styles.chipNew : styles.chipWait}`}>
            {checked.status === 'Existing' ? 'Already a tag' : checked.status === 'New' ? 'New tag' : 'Doubtful'}
          </span>
          <span>{checked.message}{checked.checkedByAi && <span className={styles.muted}> (checked by AI)</span>}</span>
          {checked.status === 'New' && (
            <Button small busy={busy} busyText="Adding…" onClick={() => onAdd(checked.name)}>Add "{checked.name}"</Button>
          )}
          {checked.status === 'Doubtful' && (
            <Button small variant="secondary" busy={busy} busyText="Adding…" onClick={() => onAdd(checked.name)}>
              Add anyway
            </Button>
          )}
        </div>
      )}

      {error && !error.fieldError('name') && <StatusBanner message={error.displayMessage} isError />}
    </section>
  )
}

/** Rename a tag everywhere, or merge it into another tag. */
function TagEditor({ tag, others, onDone, onCancel }: {
  tag: TagDto
  others: TagDto[]
  onDone: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(tag.name)
  const [into, setInto] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onRename = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await renameTag(tag.id, name)
    setBusy(false)
    if (!result.ok) setError(result.error)
    else onDone()
  }

  const onMerge = async () => {
    if (!into) return
    setBusy(true)
    setError(null)
    const result = await mergeTag(tag.id, into)
    setBusy(false)
    if (!result.ok) setError(result.error)
    else onDone()
  }

  const target = others.find((t) => t.id === into)

  return (
    <div className={`${styles.panel} ${styles.editing}`} style={{ marginBottom: 0 }}>
      <div className={styles.panelHead}>
        <div>
          <h2>{tag.name}</h2>
          <p>{usageText(tag)}</p>
        </div>
      </div>

      <form className={styles.actions} onSubmit={onRename} style={{ alignItems: 'end' }} noValidate>
        <Field label="Rename to" value={name} maxLength={60} onChange={(e) => setName(e.target.value)}
               style={{ minWidth: 260 }} error={error?.fieldError('name')}
               hint="Changes it everywhere it's used; the old name still finds it." />
        <Button type="submit" busy={busy} busyText="Saving…" disabled={!name.trim() || name.trim() === tag.name}>
          Rename
        </Button>
      </form>

      <div className={styles.actions} style={{ alignItems: 'end' }}>
        <Select label="Or merge into" value={into} onChange={(e) => setInto(e.target.value)} style={{ minWidth: 260 }}
                options={[{ value: '', label: 'Choose a tag…' }, ...others.map((t) => ({ value: t.id, label: t.name }))]}
                hint="For two tags that mean the same thing." />
        <Button variant="secondary" busy={busy} busyText="Merging…" disabled={!into} onClick={onMerge}>
          Merge{target ? ` into "${target.name}"` : ''}
        </Button>
      </div>

      {error && !error.fieldError('name') && <StatusBanner message={error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onCancel}>Close</Button>
      </div>
    </div>
  )
}
