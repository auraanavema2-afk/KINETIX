"use client";

import Image from "next/image";
import styles from "./LoadingScreen.module.css";
import ImageBackground from "@/components/ui/ImageBackground";

export default function LoadingScreen({ fadeOut }) {
  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ""}`}>
      <ImageBackground src="/images/backgrounds/loading-bg.jpg" opacity={0.88} />

      <div className={styles.prismWrap}>
        <div className={styles.logoImageWrap}>
          <Image
            src="/images/kaizen-icon.png"
            alt="The Kaizen"
            className={styles.logoImage}
            width={80}
            height={80}
            priority
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
