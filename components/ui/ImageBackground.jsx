"use client"

import Image from "next/image"
import styles from "./ImageBackground.module.css"

export default function ImageBackground({ src, opacity = 0.8 }) {
  return (
    <div className={styles.root}>
      <Image
        src={src}
        alt=""
        fill
        priority
        className={styles.img}
        style={{ opacity }}
        sizes="100vw"
        quality={85}
      />
      <div className={styles.redGlow} />
      <div className={styles.scanLines} />
      <div className={styles.vignette} />
    </div>
  )
}
