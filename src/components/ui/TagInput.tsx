import { useId, useState, type KeyboardEvent } from 'react'
import styles from './TagInput.module.css'

/**
 * A list of short words (project tags, skills): type one and press Enter or comma to add it, × to take it away.
 * Pasting "React, TypeScript, Vite" adds all three.
 */
export function TagInput({ label, value, onChange, placeholder = 'Type and press Enter', hint, error, max = 30 }: {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  hint?: string
  error?: string
  /** Most items allowed. */
  max?: number
}) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const add = (text: string) => {
    const words = text.split(',').map((w) => w.trim()).filter(Boolean)
    if (words.length === 0) return
    const next = [...value]
    for (const word of words) {
      if (next.length >= max) break
      if (!next.some((v) => v.toLowerCase() === word.toLowerCase())) next.push(word)
    }
    onChange(next)
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

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
               onBlur={() => add(draft)} placeholder={value.length >= max ? '' : placeholder}
               disabled={value.length >= max} aria-describedby={hint ? `${id}-hint` : undefined} />
      </div>
      {hint && !error && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
