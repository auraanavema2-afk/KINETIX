"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./SoulSetup.module.css";

const QUESTIONS = [
  { id: 1, question: "What is your name and what do you do?", placeholder: "e.g. I am Vema, a student and solo builder..." },
  { id: 2, question: "What is your biggest goal in the next 6 months?", placeholder: "e.g. Launch Kinetix and get 100 paying users..." },
  { id: 3, question: "What is your biggest obstacle right now?", placeholder: "e.g. Limited time between studies and building..." },
  { id: 4, question: "What do you want Kinetix to help you with most?", placeholder: "e.g. Coding, writing, thinking through decisions..." },
  { id: 5, question: "What do you want to build or create this week?", placeholder: "e.g. The authentication system for my app..." },
];

export default function SoulSetupPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [animating, setAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleUpdateAnswer(index, value) {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  }

  async function handleComplete() {
    setSaving(true);
    const soulData = {
      name: answers[0],
      bigGoal: answers[1],
      bigObstacle: answers[2],
      helpNeeded: answers[3],
      weeklyIntent: answers[4],
      createdAt: new Date().toISOString(),
    };
    if (user && db) {
      await updateDoc(doc(db, "users", user.uid), {
        soul: soulData,
        hasCompletedSoulSetup: true,
      });
    }
    setIsComplete(true);
    setSaving(false);
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
    }, 250);
  }

  if (isComplete) {
    return (
      <div className={styles.completionWrapper}>
        <div className={styles.completionScreen}>
          <div className={styles.completionPrism}>
            <svg viewBox="0 0 44 44" width="56" height="56">
              <defs>
                <filter id="completionGlow">
                  <feGaussianBlur stdDeviation="2" />
                </filter>
              </defs>
              <polygon
                points="22,4 40,38 4,38"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="1.5"
                filter="url(#completionGlow)"
              />
              <circle cx="22" cy="4" r="1.5" fill="#00d4ff" />
            </svg>
          </div>
          <div className={styles.completionTitle}>Kinet 4 is ready for you</div>
          <div className={styles.completionSubtitle}>
            Your AI now knows who you are. Every conversation starts with context.
          </div>
          <div className={styles.completionName}>{answers[0]}</div>
          <button className={styles.openButton} onClick={() => router.push("/chat")}>
            Open Kinetix →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.progress}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div className={styles.connector}>
                <div
                  className={styles.connectorFill}
                  style={{ width: i <= currentQuestion ? "100%" : "0%" }}
                />
              </div>
            )}
            <div
              className={`${styles.dot} ${
                i === currentQuestion
                  ? styles.dotActive
                  : i < currentQuestion
                  ? styles.dotComplete
                  : styles.dotFuture
              }`}
            />
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.stepLabel}>Step {currentQuestion + 1} of 5</div>
        <div className={`${styles.questionText}${animating ? ` ${styles.animating}` : ""}`}>
          {QUESTIONS[currentQuestion].question}
        </div>
        <textarea
          className={`${styles.textarea}${animating ? ` ${styles.animating}` : ""}`}
          value={answers[currentQuestion]}
          onChange={(e) => handleUpdateAnswer(currentQuestion, e.target.value)}
          placeholder={QUESTIONS[currentQuestion].placeholder}
          rows={3}
          autoFocus
        />
        <div className={styles.buttonRow}>
          <button
            className={styles.nextButton}
            onClick={handleNext}
            disabled={!answers[currentQuestion].trim() || saving}
          >
            {currentQuestion === 4 ? "Complete →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
