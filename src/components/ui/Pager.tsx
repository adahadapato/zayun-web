import { Button } from './Button'

/** "‹ Previous · Page 2 of 5 · Next ›" under a long list. Hidden when there's one page. */
export function Pager({ page, totalPages, onChange }: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pages"
         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 24 }}>
      <Button variant="secondary" small disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Previous</Button>
      <span style={{ color: 'var(--z-text-muted)', fontSize: '0.9rem' }} aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" small disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next ›</Button>
    </nav>
  )
}
