"use client";

import styles from "./LoadingScreen.module.css";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function LoadingScreen({ fadeOut }) {
  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ""}`}>
      <AnimatedBackground variant="default" />

      <div className={styles.prismWrap}>
        <div className={styles.logoImageWrap}>
          <img
            src="/images/kaizen-icon.png"
            alt="The Kaizen"
            className={styles.logoImage}
            width={80}
            height={80}
          />
        </div>
        <div className={styles.ring}></div>
        <div className={styles.ring2}></div>
      </div>

      <div className={styles.text}>THE KAIZEN</div>

      <div className={styles.bar}>
        <div className={styles.barFill}></div>
      </div>
    </div>
  );
}
