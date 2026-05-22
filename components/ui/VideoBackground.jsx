"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./VideoBackground.module.css";

export default function VideoBackground({ src, opacity = 0.75 }) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => setLoaded(true);
    video.addEventListener("canplaythrough", handleLoaded);
    return () => video.removeEventListener("canplaythrough", handleLoaded);
  }, []);

  return (
    <div className={styles.wrapper}>
      <video
        ref={videoRef}
        className={`${styles.video} ${loaded ? styles.visible : ""}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div
        className={styles.overlay}
        style={{ background: `rgba(0,0,0,${opacity})` }}
      />
      <div className={styles.glow} />
    </div>
  );
}
