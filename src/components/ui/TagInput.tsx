import { useId, useState, type KeyboardEvent } from 'react'
import type { TagCheckStatus } from '../../api/contracts/enums'
import { cleanTag, tagKey } from './tagKey'
import styles from './TagInput.module.css'

/** What a tag check says about a typed name (see the admin's AdminTagInput). */
export interface TagCheckResult {
  status: TagCheckStatus
  /** The name to use: the existing tag's, or the usual spelling of a new one. */
  name: string
  message: string
}

/** A note under the box about the last name added. */
type Note = { text: string; tone: 'info' | 'warn' } | null

/**
 * A list of short names (project tags, skills): type one and press Enter or comma to add it, × to take it away.
 * Pasting "React, TypeScript, Vite" adds all three. Names that are the same apart from case, spaces or dots
 * ("rest api" / "REST-API") are only added once.
 *
 * With `check`, each name is checked first (the admin's shared tag list and AI): "restful apis" is added as
 * "REST API", "pytroch" as "PyTorch", and a name that doesn't look like a skill asks "Add anyway?".
 * With `suggestions`, existing tags are offered as you type.
 */
export function TagInput({ label, value, onChange, placeholder = 'Type and press Enter', hint, error, max = 30,
                           check, suggestions }: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  hint?: string
  error?: string
  /** Most items allowed. */
  max?: number
  /** Checks a typed name before it's added; null = couldn't check (it's added as typed). */
  check?: (name: string) => Promise<TagCheckResult | null>
  /** Names offered while typing. */
  suggestions?: readonly string[]
}) {
  const id = useId()
  const listId = `${id}-suggestions`
  const [draft, setDraft] = useState('')
  const [checking, setChecking] = useState(false)
  const [note, setNote] = useState<Note>(null)
  const [doubt, setDoubt] = useState<{ name: string; message: string; rest: string[] } | null>(null)

  const has = (list: string[], name: string) => list.some((v) => tagKey(v) === tagKey(name))

  /** Adds the names one by one (checking each), stopping to ask when one is doubtful. */
  const addAll = async (names: string[], start: string[] = value) => {
    let next = [...start]
    const notes: string[] = []

    for (let i = 0; i < names.length; i++) {
      const typed = cleanTag(names[i])
      if (!typed || next.length >= max) continue

      let name = typed
      if (check) {
        setChecking(true)
        const result = await check(typed)
        setChecking(false)
        if (result?.status === 'Doubtful') {
          onChange(next)
          setDoubt({ name: typed, message: result.message, rest: names.slice(i + 1) })
          return
        }
        if (result) {
          name = result.name
          if (tagKey(name) !== tagKey(typed) || name !== typed) notes.push(`"${typed}" → ${name}: ${result.message}`)
          else if (result.status === 'New') notes.push(`${name}: ${result.message}`)
        }
      }

      if (has(next, name)) notes.push(`${name} is already in the list.`)
      else next = [...next, name]
    }

    onChange(next)
    setNote(notes.length ? { text: notes.join(' '), tone: 'info' } : null)
  }

  const submitDraft = () => {
    const names = draft.split(',').map((w) => w.trim()).filter(Boolean)
    if (names.length === 0) return
    setDraft('')
    void addAll(names)
  }

  const answerDoubt = (add: boolean) => {
    if (!doubt) return
    const rest = doubt.rest
    const start = add && !has(value, doubt.name) && value.length < max ? [...value, doubt.name] : value
    setDoubt(null)
    if (add) setNote({ text: `${doubt.name} added.`, tone: 'info' })
    if (rest.length) void addAll(rest, start)
    else onChange(start)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      submitDraft()
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const offered = suggestions?.filter((s) => !has(value, s))

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        <span>{label}</span>
        <span className={styles.count}>{value.length} / {max}</span>
      </label>
      <div className={`${styles.box} ${error ? styles.invalid : ''}`}>
        {value.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== tag))} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown}
               onBlur={() => { if (!doubt) submitDraft() }}
               placeholder={value.length >= max ? '' : checking ? 'Checking…' : placeholder}
               disabled={value.length >= max || !!doubt} list={offered?.length ? listId : undefined}
               aria-describedby={`${id}-help`} aria-busy={checking || undefined} />
        {checking && <span className={styles.checking} aria-hidden="true" />}
      </div>
      {offered && offered.length > 0 && (
        <datalist id={listId}>{offered.map((s) => <option key={s} value={s} />)}</datalist>
      )}

      <div id={`${id}-help`} aria-live="polite">
        {doubt ? (
          <div className={styles.doubt} role="alert">
            <span><strong>"{doubt.name}"</strong>: {doubt.message} Add it anyway?</span>
            <span className={styles.doubtActions}>
              <button type="button" onClick={() => answerDoubt(true)}>Add anyway</button>
              <button type="button" onClick={() => answerDoubt(false)}>Leave it out</button>
            </span>
          </div>
        ) : note ? (
          <p className={styles.note}>{note.text}</p>
        ) : hint && !error ? (
          <p className={styles.hint}>{hint}</p>
        ) : null}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
