import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import styles from './Admin.module.css'

/** The top of every admin page: a small label, the title, a line about it, and optional buttons on the right. */
export function AdminHead({ eyebrow, title, sub, back, children }: {
  eyebrow?: string
  title: string
  sub?: ReactNode
  /** A "‹ Back to …" link above the title. */
  back?: { to: string; label: string }
  children?: ReactNode
}) {
  useEffect(() => {
    document.title = `${title} · Zayun admin`
  }, [title])

  return (
    <>
      {back && <Link to={back.to} className={styles.back}>‹ {back.label}</Link>}
      <div className={styles.head}>
        <div>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {sub && <p className={styles.sub}>{sub}</p>}
        </div>
        {children && <div className={styles.headActions}>{children}</div>}
      </div>
    </>
  )
}

/** A number on the Overview, linking to where it's dealt with. */
export function StatTile({ label, value, to, accent, note }: {
  label: string
  value: number | string | undefined
  to?: string
  accent?: boolean
  note?: string
}) {
  const body = (
    <>
      <span className={styles.statLabel}>{label}</span>
      <strong className={`${styles.statValue} ${accent ? styles.statAccent : ''}`}>{value ?? '…'}</strong>
      {note && <span className={styles.statNote}>{note}</span>}
    </>
  )
  return to
    ? <Link to={to} className={`${styles.stat} ${styles.statLink}`}>{body}</Link>
    : <div className={styles.stat}>{body}</div>
}

/** "On the website" (green) or "Draft" (grey). */
export function PublishedChip({ isPublished }: { isPublished: boolean }) {
  return isPublished
    ? <span className={`${styles.chip} ${styles.chipLive}`}>On the website</span>
    : <span className={`${styles.chip} ${styles.chipDraft}`}>Draft</span>
}

/** ↑ ↓ buttons that move an item one place in its list. */
export function OrderButtons({ index, count, onMove, name, disabled }: {
  index: number
  count: number
  onMove: (from: number, to: number) => void
  /** What the item is called, for screen readers ("Move Phloem up"). */
  name: string
  disabled?: boolean
}) {
  return (
    <div className={styles.order}>
      <button type="button" className={styles.iconButton} disabled={disabled || index === 0}
              onClick={() => onMove(index, index - 1)} aria-label={`Move ${name} up`} title="Move up">▲</button>
      <button type="button" className={styles.iconButton} disabled={disabled || index === count - 1}
              onClick={() => onMove(index, index + 1)} aria-label={`Move ${name} down`} title="Move down">▼</button>
    </div>
  )
}

/** "Delete" that asks "Delete this? Yes / No" in place before doing it (no browser pop-up). */
export function ConfirmDelete({ onConfirm, label = 'Delete', question = 'Delete this?', busy }: {
  onConfirm: () => void
  label?: string
  question?: string
  busy?: boolean
}) {
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return <Button variant="plain" small onClick={() => setAsking(true)} busy={busy} busyText="Deleting…">{label}</Button>
  }

  return (
    <span className={styles.confirm} role="group" aria-label={question}>
      {question}
      <Button variant="danger" small autoFocus onClick={() => { setAsking(false); onConfirm() }}>Yes, delete</Button>
      <Button variant="plain" small onClick={() => setAsking(false)}>No</Button>
    </span>
  )
}

/**
 * Pick a file by clicking (or dropping it on the box), with a preview for pictures.
 * `accept` limits the kinds of file, e.g. "image/*" or ".pdf,.docx".
 */
export function FilePicker({ file, onChange, accept, label, hint, maxBytes }: {
  file: File | null
  onChange: (file: File | null) => void
  accept: string
  label: string
  hint?: string
  /** Largest file allowed; bigger files are refused here with a message. */
  maxBytes?: number
}) {
  const id = useId()
  const [problem, setProblem] = useState<string | null>(null)
  const preview = useMemo(() => (file?.type.startsWith('image/') ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pick = (picked: File | null | undefined) => {
    if (!picked) return
    if (maxBytes && picked.size > maxBytes) {
      setProblem(`This file is too big. The maximum is ${Math.round(maxBytes / 1024 / 1024)} MB.`)
      onChange(null)
      return
    }
    setProblem(null)
    onChange(picked)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <label htmlFor={id} className={styles.drop}
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}>
        <input id={id} type="file" accept={accept} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
             aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
        <span>{file ? <><strong>{file.name}</strong> · click to choose another</> : <><strong>{label}</strong> or drop it here</>}</span>
        {hint && <small>{hint}</small>}
      </label>
      {preview && <img src={preview} alt="Preview of the chosen picture" className={styles.preview} />}
      {problem && <p role="alert" style={{ margin: 0, color: 'var(--z-danger)', fontSize: '0.85rem' }}>{problem}</p>}
    </div>
  )
}
