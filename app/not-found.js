"use client"

import Link from "next/link"
import Image from "next/image"
import styles from "./not-found.module.css"

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <Image
          src="/images/kaizen-icon.png"
          alt="The Kaizen"
          width={64}
          height={64}
          className={styles.logo}
        />
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.text}>
          The page you are looking for does not exist
          or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.homeBtn}>
            Go home →
          </Link>
          <Link href="/pulse" className={styles.pulseBtn}>
            Open Pulse →
          </Link>
        </div>
      </div>
    </div>
  )
}
