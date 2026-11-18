import type { CareerRoleKind } from '../../api/contracts/enums'

/** Month names, January first. */
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December'] as const

/** How each kind of role is named on the website and in the admin area, in the order they're shown. */
export const ROLE_KINDS: { value: CareerRoleKind; label: string }[] = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Research', label: 'Research' },
  { value: 'Teaching', label: 'Teaching and mentoring' },
  { value: 'Other', label: 'Other experience' },
]

/** "Teaching and mentoring" for "Teaching". */
export const roleKindLabel = (kind: CareerRoleKind) => ROLE_KINDS.find((k) => k.value === kind)?.label ?? kind

const point = (year: number, month: number | null) => (month ? `${MONTHS[month - 1].slice(0, 3)} ${year}` : `${year}`)

/**
 * A role's dates as the website shows them: "2006 – 2024", "Mar 2025 – Present", or just "2025" when it started and
 * ended in the same year (and month, when months are given).
 */
export function roleDates(r: { startYear: number; startMonth: number | null; endYear: number | null;
                                endMonth: number | null }): string {
  const start = point(r.startYear, r.startMonth)
  if (r.endYear === null) return `${start} – Present`
  const end = point(r.endYear, r.endMonth)
  return start === end ? start : `${start} – ${end}`
}
