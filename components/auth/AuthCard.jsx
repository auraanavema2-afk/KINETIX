import ParticleBackground from "@/components/auth/ParticleBackground";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import styles from "./AuthCard.module.css";

export default function AuthCard({ children }) {
  return (
    <div className={styles.page}>
      <AnimatedBackground variant="auth" />
      <ParticleBackground />
      <div className={styles.card}>
        <div className={styles.logo}>THE KAIZEN</div>
        <div className={styles.tagline}>Your Second Brain. Built for Builders.</div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
