"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import styles from "./SoulSetup.module.css";
import ImageBackground from "@/components/ui/ImageBackground";

const QUESTIONS = [
  { id: 1, question: "What is your name and what do you do?", placeholder: "e.g. I am Vema, a student and solo builder..." },
  { id: 2, question: "What is your biggest goal in the next 6 months?", placeholder: "e.g. Launch The Kaizen and get 100 paying users..." },
  { id: 3, question: "What is your biggest obstacle right now?", placeholder: "e.g. Limited time between studies and building..." },
  { id: 4, question: "What do you want The Kaizen to help you with most?", placeholder: "e.g. Coding, writing, thinking through decisions..." },
  { id: 5, question: "What do you want to build or create this week?", placeholder: "e.g. The authentication system for my app..." },
];

export default function SoulSetupPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [animating, setAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/auth")
      return
    }
    if (userDoc && userDoc.hasCompletedSoulSetup) {
      router.push("/pulse")
    }
  }, [user, userDoc, loading, router])

  function handleUpdateAnswer(index, value) {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  }

  const handleComplete = async () => {
    if (!user || saving) return
    setSaving(true)
    try {
      const soulData = {
        name: answers[0],
        bigGoal: answers[1],
        bigObstacle: answers[2],
        helpNeeded: answers[3],
        weeklyIntent: answers[4],
        createdAt: new Date().toISOString(),
      }
      await updateDoc(doc(db, "users", user.uid), {
        soul: soulData,
        hasCompletedSoulSetup: true,
        updatedAt: serverTimestamp(),
      })
      setIsComplete(true)
    } catch (err) {
      console.error("Soul setup save error:", err)
      alert("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function handleNext() {
    if (!answers[currentQuestion].trim()) return;
    setAnimating(true);
    setTimeout(() => {
      if (currentQuestion === 4) {
        handleComplete();
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setAnimating(false);
      }
    }, 220);
  }

  function handleBack() {
    if (currentQuestion === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentQuestion((prev) => prev - 1);
      setAnimating(false);
    }, 220);
  }

  if (isComplete) {
    return (
      <>
        <ImageBackground src="/images/backgrounds/soul-bg.jpg" opacity={0.78} />
        <div className={styles.completionWrap}>
          <div className={styles.completionCard}>
            <div className={styles.completionPrismWrap}>
              <Image
                src="/images/kaizen-icon.png"
                alt="The Kaizen"
                width={80}
                height={80}
                className={styles.completionLogo}
              />
              <div className={styles.completionRing}></div>
            </div>
            <div className={styles.completionTitle}>Kaizen 4 is ready for you</div>
            <div className={styles.completionName}>{answers[0]}</div>
            <div className={styles.completionSub}>
              Your AI now knows who you are. Every conversation makes it smarter. Continuous improvement, every day.
            </div>
            <button
              className={styles.openBtn}
              onClick={() => router.push("/pulse")}
              disabled={saving}
            >
              Open The Kaizen →
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ImageBackground src="/images/backgrounds/soul-bg.jpg" opacity={0.78} />
      <div className={styles.page}>
        <div className={styles.topBar}>
          <div className={styles.logo}>THE KAIZEN</div>
          <div className={styles.step}>{currentQuestion + 1} / 5</div>
        </div>

        <div className={styles.progress}>
          {QUESTIONS.map((_, i) => (
            <div key={i} className={styles.progressItem}>
              {i > 0 && (
                <div className={styles.line}>
                  <div
                    className={styles.lineFill}
                    style={{ width: i <= currentQuestion ? "100%" : "0%" }}
                  />
                </div>
              )}
              <div
                className={`${styles.dot} ${
                  i === currentQuestion
                    ? styles.dotActive
                    : i < currentQuestion
                    ? styles.dotDone
                    : styles.dotFuture
                }`}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.stepLabel}>Step {currentQuestion + 1} of 5</div>
          <div className={`${styles.question} ${animating ? styles.exit : styles.enter}`}>
            {QUESTIONS[currentQuestion].question}
          </div>
          <textarea
            className={`${styles.textarea} ${animating ? styles.exit : ""}`}
            value={answers[currentQuestion]}
            onChange={(e) => handleUpdateAnswer(currentQuestion, e.target.value)}
            placeholder={QUESTIONS[currentQuestion].placeholder}
            rows={3}
            autoFocus
          />
          <div className={styles.btnRow}>
            {currentQuestion > 0 && (
              <button className={styles.backBtn} onClick={handleBack}>
                ← Back
              </button>
            )}
            <button
              className={styles.nextBtn}
              onClick={handleNext}
              disabled={!answers[currentQuestion].trim() || saving}
            >
              {currentQuestion === 4 ? "Complete →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
