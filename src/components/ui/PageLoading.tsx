import styles from './PageLoading.module.css'

/** A quiet spinner while a page (or a kept sign-in) loads. */
export function PageLoading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}…</span>
    </div>
  )
}
