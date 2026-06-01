"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import styles from "./SoftPaywall.module.css"

export default function SoftPaywall({ reason, onClose }) {
  const router = useRouter()

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <Image
            src="/images/kaizen-icon.png"
            alt="The Kaizen"
            width={40}
            height={40}
            className={styles.prism}
          />
        </div>
        <h2 className={styles.title}>Upgrade to continue</h2>
        <p className={styles.reason}>{reason || "You've reached your plan limit."}</p>
        <div className={styles.actions}>
          <button
            className={styles.upgradeBtn}
            onClick={() => router.push("/pricing")}
          >
            View Plans
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
