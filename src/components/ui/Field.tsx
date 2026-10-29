import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes,
  type TextareaHTMLAttributes } from 'react'
import styles from './Field.module.css'

/** What every field shares: a label, an optional "(optional)", a help line and an error. */
interface FieldFrame {
  /** The label above the box. */
  label: string
  /** Shows "(optional)" after the label. */
  optional?: boolean
  /** A short help line under the box. */
  hint?: ReactNode
  /** The problem with this field (from the API's field errors or a local check). */
  error?: string
  className?: string
}

/** Label, box and messages around any control, with the ids linked for screen readers. */
function Frame({ id, label, optional, hint, error, className, counter, children }: FieldFrame & {
  id: string
  counter?: string
  children: ReactNode
}) {
  return (
    <div className={[styles.field, error && styles.invalid, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        <span>{label} {optional && <span className={styles.optional}>(optional)</span>}</span>
        {counter && <span className={styles.counter}>{counter}</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  )
}

const describedBy = (id: string, hint?: ReactNode, error?: string) =>
  [hint && !error && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

type FieldProps = FieldFrame & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'>

/** A labelled text field. A password field gets the eye button to show / hide what was typed. */
export function Field({ label, optional, hint, error, className, type = 'text', ...input }: FieldProps) {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <Frame id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <div className={styles.box}>
        <input id={id} className={styles.input} type={isPassword && showPassword ? 'text' : type}
               aria-invalid={!!error || undefined} aria-describedby={describedBy(id, hint, error)} {...input} />
        {isPassword && (
          <button type="button" className={styles.toggle} onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 aria-hidden="true">
              <path d="M2 12c3-5.5 6.5-7.5 10-7.5s7 2 10 7.5c-3 5.5-6.5 7.5-10 7.5S5 17.5 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="M4 4l16 16" />}
            </svg>
          </button>
        )}
      </div>
    </Frame>
  )
}

type TextAreaProps = FieldFrame & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'>

/** A labelled multi-line field, with a "120 / 4000" counter when it has a maximum length. */
export function TextArea({ label, optional, hint, error, className, rows = 5, ...area }: TextAreaProps) {
  const id = useId()
  const length = typeof area.value === 'string' ? area.value.length : 0
  const counter = area.maxLength ? `${length.toLocaleString()} / ${area.maxLength.toLocaleString()}` : undefined

  return (
    <Frame id={id} label={label} optional={optional} hint={hint} error={error} className={className} counter={counter}>
      <textarea id={id} rows={rows} className={`${styles.input} ${styles.area}`} aria-invalid={!!error || undefined}
                aria-describedby={describedBy(id, hint, error)} {...area} />
    </Frame>
  )
}

type SelectProps = FieldFrame & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> & {
  options: readonly { value: string; label: string }[]
}

/** A labelled drop-down list. */
export function Select({ label, optional, hint, error, className, options, ...select }: SelectProps) {
  const id = useId()
  return (
    <Frame id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <select id={id} className={`${styles.input} ${styles.select}`} aria-invalid={!!error || undefined}
              aria-describedby={describedBy(id, hint, error)} {...select}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Frame>
  )
}

/** A labelled on / off switch (e.g. "Show on the website"). */
export function Toggle({ label, checked, onChange, hint, disabled }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className={styles.toggleRow}>
      <label htmlFor={id} className={styles.switch}>
        <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled}
               onChange={(e) => onChange(e.target.checked)} aria-describedby={hint ? `${id}-hint` : undefined} />
        <span className={styles.track} aria-hidden="true"><span className={styles.thumb} /></span>
        <span>{label}</span>
      </label>
      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  )
}
