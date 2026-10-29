/**
 * Experience areas and skill groups have the same shape (title, description, a list of skills), so they share this
 * list and editor. The page says which API area it edits and what to call things.
 */
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import type { ApiError, ApiResult } from '../../api/apiError'
import type { CreateTextGroupCommand, TextGroupFields } from '../../api/contracts/commands'
import type { ExperienceAreaDto } from '../../api/contracts/dtos'
import { Button } from '../../components/ui/Button'
import { Field, TextArea, Toggle } from '../../components/ui/Field'
import { ListStatus } from '../../components/ui/ListStatus'
import { StatusBanner } from '../../components/ui/StatusBanner'
import styles from './Admin.module.css'
import { ConfirmDelete, OrderButtons, PublishedChip } from './AdminParts'
import { AdminTagInput } from './AdminTagInput'
import type { AdminListActions } from './useAdminList'

export interface TextGroupWords {
  /** "experience area", "skill group". */
  noun: string
  /** Most skills per item (the API's limit). */
  maxSkills: number
  /** Longest description. */
  maxDescription: number
}

export function TextGroupList({ items, isLoading, error, onRetry, list, words, queryKey, create, update }: {
  items: ExperienceAreaDto[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  list: AdminListActions<ExperienceAreaDto>
  words: TextGroupWords
  queryKey: QueryKey
  create: (command: CreateTextGroupCommand) => Promise<ApiResult<ExperienceAreaDto>>
  update: (id: string, fields: TextGroupFields) => Promise<ApiResult<ExperienceAreaDto>>
}) {
  const [params, setParams] = useSearchParams()
  const editId = params.get('edit')
  const isNew = params.get('new') === '1'
  const editing = editId ? items.find((i) => i.id === editId) : undefined
  const close = () => setParams({}, { replace: true })

  return (
    <>
      {(isNew || editing) ? (
        <TextGroupEditor key={editing?.id ?? 'new'} item={editing} words={words} queryKey={queryKey}
                         create={create} update={update} onDone={close} />
      ) : (
        <div className={styles.actions} style={{ marginBottom: 16 }}>
          <Button onClick={() => setParams({ new: '1' })}>New {words.noun}</Button>
        </div>
      )}

      <StatusBanner message={list.error?.displayMessage} isError />
      <ListStatus isLoading={isLoading} error={error} isEmpty={items.length === 0}
                  emptyText={`No ${words.noun}s yet.`} onRetry={onRetry} />

      <ul className={styles.rows}>
        {items.map((item, index) => (
          <li key={item.id} className={`${styles.row} ${item.isPublished ? '' : styles.rowDraft}`}
              style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
            <div className={styles.rowText}>
              <strong>{item.title}</strong>
              <div className={styles.rowMeta}>
                <PublishedChip isPublished={item.isPublished} />
                <span>{item.skills.length} {item.skills.length === 1 ? 'skill' : 'skills'}</span>
              </div>
              {item.skills.length > 0 && (
                <div className={styles.tags}>
                  {item.skills.slice(0, 8).map((s) => <span key={s} className={styles.tag}>{s}</span>)}
                  {item.skills.length > 8 && <span className={styles.tag}>+{item.skills.length - 8}</span>}
                </div>
              )}
            </div>
            <div className={styles.rowActions}>
              <OrderButtons index={index} count={items.length} onMove={list.move} name={item.title} />
              <Button variant="secondary" small busy={list.busyId === item.id}
                      onClick={() => list.togglePublished(item)}>
                {item.isPublished ? 'Hide' : 'Publish'}
              </Button>
              <Button variant="secondary" small onClick={() => setParams({ edit: item.id })}>Edit</Button>
              <ConfirmDelete question={`Delete "${item.title}"?`} onConfirm={() => list.deleteItem(item)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function TextGroupEditor({ item, words, queryKey, create, update, onDone }: {
  item?: ExperienceAreaDto
  words: TextGroupWords
  queryKey: QueryKey
  create: (command: CreateTextGroupCommand) => Promise<ApiResult<ExperienceAreaDto>>
  update: (id: string, fields: TextGroupFields) => Promise<ApiResult<ExperienceAreaDto>>
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [fields, setFields] = useState<TextGroupFields>(item
    ? { title: item.title, description: item.description, skills: item.skills }
    : { title: '', description: '', skills: [] })
  const [publishNow, setPublishNow] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const err = (name: string) => error?.fieldError(name)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = item ? await update(item.id, fields) : await create({ ...fields, isPublished: publishNow })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    void queryClient.invalidateQueries({ queryKey })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] })
    void queryClient.invalidateQueries({ queryKey: ['content'] })
    onDone()
  }

  return (
    <form className={`${styles.panel} ${styles.editing} ${styles.form}`} onSubmit={onSubmit} noValidate>
      <div className={styles.panelHead}>
        <h2>{item ? `Edit ${words.noun}` : `New ${words.noun}`}</h2>
      </div>
      <Field label="Title" value={fields.title} maxLength={150} error={err('title')}
             onChange={(e) => setFields({ ...fields, title: e.target.value })} />
      <TextArea label="Description" value={fields.description} maxLength={words.maxDescription} error={err('description')}
                onChange={(e) => setFields({ ...fields, description: e.target.value })} />
      <AdminTagInput label="Skills" value={fields.skills} max={words.maxSkills} error={err('skills')}
                onChange={(skills) => setFields({ ...fields, skills })} hint="Press Enter after each, or paste a list with commas." />
      {!item && <Toggle label="Put it on the website now" checked={publishNow} onChange={setPublishNow} />}
      {error && <StatusBanner message={Object.keys(error.fieldErrors).length ? 'Please check the fields marked in red.'
        : error.displayMessage} isError />}
      <div className={styles.actionsEnd}>
        <Button variant="plain" onClick={onDone}>Cancel</Button>
        <Button type="submit" busy={busy} busyText="Saving…">{item ? 'Save changes' : `Add ${words.noun}`}</Button>
      </div>
    </form>
  )
}
