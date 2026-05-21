"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

export default function LoadingScreen({ fadeOut }) {
  return (
    <div className={`${styles.container}${fadeOut ? ` ${styles.fadeOut}` : ""}`}>
      <div className={styles.prism}>
        <svg viewBox="0 0 44 44" width="44" height="44">
          <defs>
            <filter id="loadingGlow">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <polygon
            points="22,4 40,38 4,38"
            fill="none"
            stroke="#00d4ff"
            strokeWidth="1.5"
            filter="url(#loadingGlow)"
          />
          <circle cx="22" cy="4" r="1.5" fill="#00d4ff" />
        </svg>
      </div>

      <div className={styles.logoText}>KINETIX</div>

      <div className={styles.loadingBar}>
        <div className={styles.loadingFill} />
      </div>
    </div>
  );
}
