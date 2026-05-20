import styles from "./SubmitButton.module.css";

export default function SubmitButton({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={styles.button}
    >
      {loading ? (
        <>
          <div className={styles.spinner} />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
