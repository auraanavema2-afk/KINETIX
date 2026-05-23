"use client"

import styles from "./AnimatedBackground.module.css"

export default function AnimatedBackground({ variant = "default" }) {
  return (
    <div className={`${styles.wrapper} ${styles[variant] || ""}`}>
      <div className={styles.gradientBase}></div>
      <div className={styles.grid}></div>
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.orb3}></div>
      <div className={styles.scanLines}></div>
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }}
          ></div>
        ))}
      </div>
      <div className={styles.topLine}></div>
    </div>
  )
}
