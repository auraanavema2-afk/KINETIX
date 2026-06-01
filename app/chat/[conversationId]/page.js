"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import {
  addMessage,
  getMessages,
  updateConversationTitle,
  addSoulMemory,
} from "@/lib/firestore";
import { authenticatedFetch } from "@/lib/apiClient";
import Image from "next/image";
import styles from "./Chat.module.css";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userDoc } = useAuth();
  const conversationId = params.conversationId;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [titleGenerated, setTitleGenerated] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const msgs = await getMessages(conversationId);
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          imageUrls: m.imageUrls || [],
        }))
      );
      setTitleGenerated(true);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;
    if (conversationId === "new") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingHistory(false);
      inputRef.current?.focus();
      return;
    }
    loadHistory();
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const generateTitle = async (firstMessage) => {
    try {
      const res = await authenticatedFetch("/api/soul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "title",
          content: firstMessage,
          conversationId,
        }),
      });
      const data = await res.json();
      if (data.result) {
        await updateConversationTitle(conversationId, data.result);
      }
    } catch (err) {
      console.error("Title generation failed:", err);
    }
  };

  const extractMemory = async (fullConversation) => {
    if (!user || fullConversation.length < 4) return;
    try {
      const excerpt = fullConversation
        .slice(-6)
        .map((m) => `${m.role}: ${m.content.substring(0, 200)}`)
        .join("\n");
      const res = await authenticatedFetch("/api/soul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "memory", content: excerpt }),
      });
      const data = await res.json();
      if (data.result) {
        await addSoulMemory(user.uid, data.result);
      }
    } catch (err) {
      console.error("Memory extraction failed:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      imageUrls: [],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);
    setLoading(true);

    if (user) {
      await addMessage(conversationId, "user", userMessage.content);
    }

    if (!titleGenerated && updatedMessages.length === 1) {
      setTitleGenerated(true);
      generateTitle(userMessage.content);
    }

    const assistantMessageId = Date.now().toString() + "-assistant";
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        imageUrls: [],
        streaming: true,
      },
    ]);
    setLoading(false);

    abortControllerRef.current = new AbortController();

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await authenticatedFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId,
          userId: user?.uid,
          soulData: userDoc?.soul || null,
          soulMemory: userDoc?.soulMemory || [],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: fullResponse, streaming: true }
              : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: fullResponse, streaming: false }
            : m
        )
      );

      if (user) {
        await addMessage(conversationId, "assistant", fullResponse);
      }

      const finalMessages = [
        ...updatedMessages,
        { role: "assistant", content: fullResponse },
      ];
      if (finalMessages.length % 6 === 0) {
        extractMemory(finalMessages);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, streaming: false } : m
          )
        );
      } else if (err.message === "Not authenticated") {
        router.push("/auth");
      } else {
        setConnectionError(true);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: "Connection error. Please check your internet and try again.", streaming: false }
              : m
          )
        );
        setTimeout(() => setConnectionError(false), 5000);
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
      inputRef.current?.focus();
    }
  };

  const stopStreaming = () => {
    abortControllerRef.current?.abort();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div className={styles.chatPage}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.kinet4Badge}>
                <svg viewBox="0 0 20 20" width="14" height="14">
                  <polygon points="10,2 18,17 2,17" fill="#00d4ff" opacity="0.9" />
                  <line x1="10" y1="2" x2="6" y2="17" stroke="rgba(0,212,255,0.4)" strokeWidth="0.6" />
                  <line x1="10" y1="2" x2="14" y2="17" stroke="rgba(0,212,255,0.4)" strokeWidth="0.6" />
                </svg>
                Kaizen 4
              </div>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.newChatBtn}
                onClick={() => router.push("/chat")}
              >
                + New
              </button>
            </div>
          </header>

          <div className={styles.messages}>
            {loadingHistory && (
              <div className={styles.historySkeleton}>
                {[1,2,3].map(i => (
                  <div key={i} className={`${styles.skeletonMsg} ${i % 2 === 0 ? styles.skeletonRight : styles.skeletonLeft}`}></div>
                ))}
              </div>
            )}
            {!loadingHistory && messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyPrismWrap}>
                  <Image
                    src="/images/kaizen-icon.png"
                    alt="Kaizen 4"
                    width={70}
                    height={70}
                    className={styles.emptyLogo}
                  />
                  <div className={styles.emptyRing}></div>
                </div>
                <p className={styles.emptyTitle}>I&apos;m Kaizen 4</p>
                {userDoc?.soul?.name && (
                  <p className={styles.emptyGreeting}>
                    Hey {userDoc.soul.name.split(" ")[0]}, ready when you are
                  </p>
                )}
                <p className={styles.emptySub}>
                  {userDoc?.soul?.bigGoal
                    ? `Let's work on "${userDoc.soul.bigGoal}"`
                    : "Your AI that actually knows you. Ask me anything."}
                </p>
                <div className={styles.suggestions}>
                  {["Help me plan my week", "Review my code", "Build something with me"].map(
                    (s) => (
                      <button
                        key={s}
                        className={styles.suggestionChip}
                        onClick={() => {
                          setInput(s);
                          inputRef.current?.focus();
                        }}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrap} ${
                    msg.role === "user" ? styles.userWrap : styles.assistantWrap
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.assistantAvatar}>
                      <svg viewBox="0 0 20 20" width="12" height="12">
                        <polygon points="10,2 18,17 2,17" fill="#00d4ff" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`${styles.bubble} ${
                      msg.role === "user" ? styles.userBubble : styles.assistantBubble
                    }`}
                  >
                    {msg.content}
                    {msg.streaming && <span className={styles.cursor}></span>}
                    {!msg.streaming && msg.content && (
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyMessage(msg.content)}
                        title="Copy"
                      >
                        ⎘
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className={`${styles.messageWrap} ${styles.assistantWrap}`}>
                <div className={styles.assistantAvatar}>
                  <svg viewBox="0 0 20 20" width="12" height="12">
                    <polygon points="10,2 18,17 2,17" fill="#00d4ff" />
                  </svg>
                </div>
                <div className={`${styles.bubble} ${styles.assistantBubble} ${styles.typingBubble}`}>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {connectionError && (
            <div style={{
              background: "rgba(255,68,68,0.08)",
              border: "1px solid rgba(255,68,68,0.18)",
              borderRadius: "8px",
              padding: "10px 16px",
              color: "#ff6b6b",
              fontSize: "12px",
              margin: "0 20px 8px",
              textAlign: "center",
            }}>
              Connection issue. Check your internet and try again.
            </div>
          )}

          <div className={styles.inputArea}>
            <div className={styles.inputWrap}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={`Message Kaizen 4${
                  userDoc?.soul?.name ? `, ${userDoc.soul.name.split(" ")[0]}` : ""
                }...`}
                rows={1}
                disabled={streaming}
              />
              {streaming ? (
                <button className={styles.stopBtn} onClick={stopStreaming} title="Stop">
                  ⏹
                </button>
              ) : (
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  title="Send"
                >
                  ↑
                </button>
              )}
            </div>
            <p className={styles.disclaimer}>
              Kaizen 4 can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
