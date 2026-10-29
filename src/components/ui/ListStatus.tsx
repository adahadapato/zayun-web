import { ApiError } from '../../api/apiError'
import { Button } from './Button'
import styles from './ListStatus.module.css'
import { StatusBanner } from './StatusBanner'

/** The message for any error a query threw. */
const errorText = (error: unknown) =>
  error instanceof ApiError ? error.displayMessage : 'Something went wrong. Please try again.'

/**
 * What a list shows when it has no items to show: grey placeholder rows while loading, the API's message with
 * "Try again" when loading failed, or a friendly "nothing here" note. Renders nothing when there ARE items.
 */
export function ListStatus({ isLoading, error, isEmpty, emptyText, onRetry, placeholders = 4 }: {
  isLoading: boolean
  error: Error | null
  isEmpty: boolean
  emptyText: string
  onRetry: () => void
  /** How many grey rows to show while loading. */
  placeholders?: number
}) {
  if (isLoading) {
    return (
      <div className={styles.placeholders} aria-busy="true" aria-label="Loading">
        {Array.from({ length: placeholders }, (_, i) => <div key={i} className={styles.placeholder} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.problem}>
        <StatusBanner message={errorText(error)} isError />
        <Button variant="secondary" small onClick={onRetry}>Try again</Button>
      </div>
    )
  }

  if (isEmpty) return <p className={styles.empty}>{emptyText}</p>

  return null
}
