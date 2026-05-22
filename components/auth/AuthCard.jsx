import ParticleBackground from "@/components/auth/ParticleBackground";
import VideoBackground from "@/components/ui/VideoBackground";
import styles from "./AuthCard.module.css";

export default function AuthCard({ children }) {
  return (
    <div className={styles.page}>
      <VideoBackground src="/videos/auth-bg.mp4" opacity={0.7} />
      <ParticleBackground />
      <div className={styles.card}>
        <div className={styles.logo}>KINETIX</div>
        <div className={styles.tagline}>Your Second Brain. Built for Builders.</div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
