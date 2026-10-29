import { ApiError } from '../../api/apiError'
import styles from './ContentStatus.module.css'

/**
 * What a section of the public site shows while its content loads from the API, or when it couldn't be loaded.
 * Renders nothing once the content is there.
 */
export function ContentStatus({ isLoading, error, isEmpty = false, emptyText = 'Nothing to show yet.', onRetry,
                                placeholders = 2, height = 220 }: {
  isLoading: boolean
  error: Error | null
  isEmpty?: boolean
  emptyText?: string
  onRetry: () => void
  placeholders?: number
  /** Height of each grey placeholder, in pixels. */
  height?: number
}) {
  if (isLoading) {
    return (
      <div className={styles.placeholders} aria-busy="true" aria-label="Loading">
        {Array.from({ length: placeholders }, (_, i) => (
          <div key={i} className={styles.placeholder} style={{ height }} />
        ))}
      </div>
    )
  }

  if (error) {
    const message = error instanceof ApiError ? error.displayMessage : 'Something went wrong. Please try again.'
    return (
      <div className={styles.problem} role="alert">
        <p>{message}</p>
        <button type="button" onClick={onRetry}>Try again</button>
      </div>
    )
  }

  if (isEmpty) return <p className={styles.empty}>{emptyText}</p>

  return null
}
