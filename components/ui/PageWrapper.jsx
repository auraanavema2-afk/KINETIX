"use client"

import styles from "./PageWrapper.module.css"

export default function PageWrapper({
  children,
  loading = false,
  error = null,
  onRetry = null,
  maxWidth = "900px",
  padding = "32px 36px",
}) {
  if (loading) {
    return (
      <div className={styles.wrapper} style={{ maxWidth, padding }}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonSub}></div>
        </div>
        <div className={styles.skeletonGrid}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeletonCard}></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrapper} style={{ maxWidth, padding }}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠</div>
          <h2 className={styles.errorTitle}>Something went wrong</h2>
          <p className={styles.errorText}>{error}</p>
          {onRetry && (
            <button className={styles.retryBtn} onClick={onRetry}>
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={styles.wrapper}
      style={{ maxWidth, padding }}
    >
      {children}
    </div>
  )
}
