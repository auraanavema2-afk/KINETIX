import Image from "next/image";
import Link from "next/link";
import ImageBackground from "@/components/ui/ImageBackground";
import styles from "./AuthCard.module.css";

export default function AuthCard({ children }) {
  return (
    <div className={styles.page}>
      <ImageBackground src="/images/backgrounds/auth-bg.jpg" opacity={0.72} />
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logoImgContainer}>
            <Image
              src="/images/kaizen-logo.png"
              alt="The Kaizen"
              className={styles.logoImg}
              width={200}
              height={120}
              priority
            />
          </Link>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
