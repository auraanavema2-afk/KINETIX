import { useState } from "react";
import styles from "./FloatingInput.module.css";

export default function FloatingInput({ label, type = "text", value, onChange, id }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        id={id}
        type={type === "password" && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`${styles.input}${value.length > 0 ? ` ${styles.filled}` : ""}`}
      />
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {type === "password" && (
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}
