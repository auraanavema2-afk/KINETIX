import styles from "./loading.module.css"

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <div className={styles.fill}></div>
      </div>
    </div>
  )
}
