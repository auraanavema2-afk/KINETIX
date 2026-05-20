import styles from "./OrDivider.module.css";

export default function OrDivider() {
  return (
    <div className={styles.divider}>
      <span className={styles.line}></span>
      <span className={styles.text}>OR</span>
      <span className={styles.line}></span>
    </div>
  );
}
