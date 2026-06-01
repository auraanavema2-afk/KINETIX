import Image from "next/image";
import ParticleBackground from "@/components/auth/ParticleBackground";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import styles from "./AuthCard.module.css";

export default function AuthCard({ children }) {
  return (
    <div className={styles.page}>
      <AnimatedBackground variant="auth" />
      <ParticleBackground />
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoImgContainer}>
            <Image
              src="/images/kaizen-logo.png"
              alt="The Kaizen"
              className={styles.logoImg}
              width={200}
              height={120}
              priority
            />
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
