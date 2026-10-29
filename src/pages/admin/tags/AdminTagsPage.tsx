import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ApiError, unwrap } from '../../../api/apiError'
import type { TagCheckDto, TagDto } from '../../../api/contracts/dtos'
import type { TagFilter, TagSort } from '../../../api/contracts/enums'
import { checkTag, createTag, getTags, mergeTag, remove, renameTag } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Select } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { Pager } from '../../../components/ui/Pager'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { AdminHead, ConfirmDelete } from '../AdminParts'
import tableStyles from './AdminTags.module.css'
import { tagsKey } from './tagsKey'

const PAGE_SIZE = 50

const FILTERS: { value: TagFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Used', label: 'Used' },
  { value: 'Unused', label: 'Not used' },
]

/** "2 projects · 1 skill group". */
const usageText = (t: TagDto) => [
  t.projects && `${t.projects} ${t.projects === 1 ? 'project' : 'projects'}`,
  t.experienceAreas && `${t.experienceAreas} experience`,
  t.skillGroups && `${t.skillGroups} skill ${t.skillGroups === 1 ? 'group' : 'groups'}`,
].filter(Boolean).join(' · ')

/**
 * The shared tag list, built for thousands of tags: searched, filtered, sorted and paged by the API, 50 per page, in
 * a compact table. Search, filter, sort and page live in the address (?q=react&filter=Used&sort=Usage&page=2).
 */
export default function AdminTagsPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const filter = (params.get('filter') ?? 'All') as TagFilter
  const sort = (params.get('sort') ?? 'Name') as TagSort
  const page = Math.max(1, Number(params.get('page')) || 1)

  // The search box updates the address a moment after typing stops
  const [typed, setTyped] = useState(q)
  useEffect(() => {
    const timer = setTimeout(() => { if (typed.trim() !== q) go({ q: typed.trim(), page: '1' }) }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed])

  const tags = useQuery({
    queryKey: [...tagsKey, { q, filter, sort, page }],
    queryFn: async ({ signal }) => unwrap(await getTags({
      search: q || undefined, filter, sort, page, pageSize: PAGE_SIZE,
    }, signal)),
    placeholderData: keepPreviousData,
  })
  const data = tags.data
  const items = data?.tags.items ?? []
  const [error, setError] = useState<ApiError | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  function go(next: Record<string, string>) {
    const merged: Record<string, string> = { q, filter, sort, page: String(page), ...next }
    const clean = Object.fromEntries(Object.entries(merged).filter(([k, v]) =>
      v && !(k === 'filter' && v === 'All') && !(k === 'sort' && v === 'Name') && !(k === 'page' && v === '1')))
    setParams(clean, { replace: true })
    setOpenId(null)
  }

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

  const counts: Record<TagFilter, number | undefined> = { All: data?.total, Used: data?.used, Unused: data?.unused }
  const from = data && data.tags.totalCount > 0 ? (data.tags.page - 1) * data.tags.pageSize + 1 : 0
  const to = data ? Math.min(data.tags.page * data.tags.pageSize, data.tags.totalCount) : 0

  return (
    <>
      <AdminHead eyebrow="Website" title="Tags"
                 sub="One list for project tags, experience skills and skill-group skills, so the same thing is always written the same way. New tags are also added when you save an item." />

      <NewTag onAdded={refresh} />

      <div className={tableStyles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Show" style={{ margin: 0 }}>
          {FILTERS.map((f) => (
            <button key={f.value} type="button" role="tab" aria-selected={filter === f.value}
                    className={`${styles.tab} ${filter === f.value ? styles.tabOn : ''}`}
                    onClick={() => go({ filter: f.value, page: '1' })}>
              {f.label} {counts[f.value] !== undefined && <small>{counts[f.value]!.toLocaleString()}</small>}
            </button>
          ))}
        </div>
        <div className={tableStyles.toolbarRight}>
          <input className={tableStyles.search} type="search" value={typed} placeholder="Search tags…"
                 aria-label="Search tags" onChange={(e) => setTyped(e.target.value)} />
          <select className={tableStyles.sort} value={sort} aria-label="Sort"
                  onChange={(e) => go({ sort: e.target.value, page: '1' })}>
            <option value="Name">A to Z</option>
            <option value="Usage">Most used</option>
          </select>
        </div>
      </div>

      <StatusBanner message={error?.displayMessage} isError />
      <ListStatus isLoading={tags.isLoading} error={tags.error} isEmpty={!!data && items.length === 0}
                  emptyText={q ? `No tags match "${q}".` : 'No tags here.'} onRetry={() => tags.refetch()} placeholders={3} />

      {items.length > 0 && (
        <div className={tableStyles.tableWrap} aria-busy={tags.isFetching || undefined}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th scope="col">Tag</th>
                <th scope="col" className={tableStyles.num}>Used</th>
                <th scope="col" className={tableStyles.where}>Where</th>
                <th scope="col"><span className={tableStyles.hidden}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((tag) => openId === tag.id ? (
                <tr key={tag.id} className={tableStyles.editRow}>
                  <td colSpan={4}>
                    <TagEditor tag={tag} onDone={() => { setOpenId(null); refresh() }} onCancel={() => setOpenId(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={tag.id}>
                  <th scope="row">
                    <span className={tableStyles.name}>{tag.name}</span>
                    {tag.aliases.length > 0 && (
                      <span className={tableStyles.aliases} title={`Also found by: ${tag.aliases.join(', ')}`}>
                        +{tag.aliases.length} {tag.aliases.length === 1 ? 'alias' : 'aliases'}
                      </span>
                    )}
                  </th>
                  <td className={tableStyles.num}>
                    {tag.usedBy > 0 ? tag.usedBy : <span className={tableStyles.zero}>0</span>}
                  </td>
                  <td className={tableStyles.where}>{usageText(tag) || <span className={tableStyles.zero}>Not used</span>}</td>
                  <td className={tableStyles.actions}>
                    <Button variant="plain" small onClick={() => setOpenId(tag.id)}>Edit</Button>
                    {tag.usedBy === 0 && <ConfirmDelete question={`Delete "${tag.name}"?`} onConfirm={() => onDelete(tag)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.tags.totalCount > 0 && (
        <p className={tableStyles.range}>
          {from.toLocaleString()}–{to.toLocaleString()} of {data.tags.totalCount.toLocaleString()}
        </p>
      )}
      {data && <Pager page={page} totalPages={data.tags.totalPages} onChange={(p) => go({ page: String(p) })} />}
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
    <form className={tableStyles.newTag} onSubmit={onCheck} noValidate>
      <label htmlFor="new-tag-name" className={tableStyles.newLabel}>Add a tag</label>
      <input id="new-tag-name" className={tableStyles.search} value={name} maxLength={60} placeholder="e.g. PyTorch"
             onChange={(e) => { setName(e.target.value); setChecked(null) }} />
      <Button type="submit" small busy={busy && !checked} busyText="Checking…" disabled={!name.trim()}>Check</Button>

      {checked && (
        <span className={tableStyles.checked}>
          <span className={`${styles.chip} ${checked.status === 'Existing' ? styles.chipLive
            : checked.status === 'New' ? styles.chipNew : styles.chipWait}`}>
            {checked.status === 'Existing' ? 'Already a tag' : checked.status === 'New' ? 'New tag' : 'Doubtful'}
          </span>
          <span>{checked.message}{checked.checkedByAi && <span className={styles.muted}> (AI)</span>}</span>
          {checked.status === 'New' && (
            <Button small busy={busy} busyText="Adding…" onClick={() => onAdd(checked.name)}>Add "{checked.name}"</Button>
          )}
          {checked.status === 'Doubtful' && (
            <Button small variant="secondary" busy={busy} busyText="Adding…" onClick={() => onAdd(checked.name)}>
              Add anyway
            </Button>
          )}
        </span>
      )}
      {error && <span className={tableStyles.checked}><StatusBanner message={error.displayMessage} isError /></span>}
    </form>
  )
}

/** Rename a tag everywhere, or merge it into another tag (found by searching, never a list of every tag). */
function TagEditor({ tag, onDone, onCancel }: { tag: TagDto; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState(tag.name)
  const [find, setFind] = useState('')
  const [into, setInto] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  // Tags to merge into: the first 20 matches of what's typed
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(find.trim()), 250)
    return () => clearTimeout(timer)
  }, [find])
  const matches = useQuery({
    queryKey: [...tagsKey, 'merge', search],
    queryFn: async ({ signal }) => unwrap(await getTags({ search, sort: 'Usage', pageSize: 20 }, signal)),
    enabled: search.length > 0,
  })
  const options = (matches.data?.tags.items ?? []).filter((t) => t.id !== tag.id)

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

  const target = options.find((t) => t.id === into)

  return (
    <div className={tableStyles.editor}>
      <div className={tableStyles.editorHead}>
        <strong>{tag.name}</strong>
        <span className={styles.muted}>{usageText(tag) || 'Not used'}</span>
        {tag.aliases.length > 0 && <span className={styles.muted}>Also found by: {tag.aliases.join(', ')}</span>}
      </div>

      <form className={styles.actions} onSubmit={onRename} style={{ alignItems: 'end' }} noValidate>
        <Field label="Rename to" value={name} maxLength={60} onChange={(e) => setName(e.target.value)}
               style={{ minWidth: 240 }} error={error?.fieldError('name')}
               hint="Changes it everywhere; the old name still finds it." />
        <Button type="submit" small busy={busy} busyText="Saving…" disabled={!name.trim() || name.trim() === tag.name}>
          Rename
        </Button>
      </form>

      <div className={styles.actions} style={{ alignItems: 'end' }}>
        <Field label="Or merge into" value={find} placeholder="Search for the tag to keep…"
               onChange={(e) => { setFind(e.target.value); setInto('') }} style={{ minWidth: 240 }} />
        {options.length > 0 && (
          <Select label="Tag to keep" value={into} onChange={(e) => setInto(e.target.value)} style={{ minWidth: 220 }}
                  options={[{ value: '', label: `${options.length} found…` },
                            ...options.map((t) => ({ value: t.id, label: `${t.name} (${t.usedBy})` }))]} />
        )}
        {search && matches.data && options.length === 0 && <span className={styles.muted}>No other tag matches.</span>}
        <Button variant="secondary" small busy={busy} busyText="Merging…" disabled={!into} onClick={onMerge}>
          Merge{target ? ` into "${target.name}"` : ''}
        </Button>
      </div>

      {error && !error.fieldError('name') && <StatusBanner message={error.displayMessage} isError />}

      <div className={styles.actionsEnd}>
        <Button variant="plain" small onClick={onCancel}>Close</Button>
      </div>
    </div>
  )
}
