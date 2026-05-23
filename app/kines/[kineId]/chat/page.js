"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { getKineById, incrementKineUsage } from "@/lib/firestore"
import SoftPaywall from "@/components/paywall/SoftPaywall"
import styles from "../../../chat/[conversationId]/Chat.module.css"

export default function KineChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userDoc } = useAuth()

  const [kine, setKine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [usageIncremented, setUsageIncremented] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    loadKine()
  }, [params.kineId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadKine = async () => {
    setLoading(true)
    try {
      const data = await getKineById(params.kineId)
      setKine(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming) return

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setStreaming(true)

    const assistantId = Date.now().toString() + "-a"
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    }])

    abortRef.current = new AbortController()

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const customSystemPrompt = `You are ${kine.name}, a specialised AI agent created in Kinetix. ${kine.persona}

Stay in character as ${kine.name} throughout the conversation. Apply your specialised expertise to help the user. Be helpful, focused, and genuinely useful in your area of expertise.

You are powered by Kinet 4 but you operate as ${kine.name}.`

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: "kine-" + params.kineId,
          userId: user?.uid,
          soulData: userDoc?.soul || null,
          soulMemory: userDoc?.soulMemory || [],
          customSystemPrompt,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        if (response.status === 402) {
          setShowPaywall(true)
          setMessages(prev => prev.filter(m => m.id !== assistantId))
          setStreaming(false)
          return
        }
        throw new Error("API error")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullResponse += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: fullResponse, streaming: true }
            : m
        ))
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: fullResponse, streaming: false }
          : m
      ))

      if (!usageIncremented) {
        incrementKineUsage(params.kineId)
        setUsageIncremented(true)
      }

    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `${kine.name} encountered an error. Please try again.`, streaming: false }
            : m
        ))
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const stopStreaming = () => abortRef.current?.abort()

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"
  }

  if (loading || !kine) {
    return (
      <ProtectedRoute>
        <AppLayout variant="universe">
          <div style={{ padding: "60px", textAlign: "center", color: "#404040" }}>
            Loading Kine...
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout variant="universe">
        <div className={styles.chatPage}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <button
                className={styles.newChatBtn}
                onClick={() => router.push(`/kines/${params.kineId}`)}
                style={{ marginRight: 12 }}
              >
                ← Back
              </button>
              <div className={styles.kinet4Badge}>
                {kine.emoji} {kine.name}
              </div>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.newChatBtn}
                onClick={() => setMessages([])}
              >
                + New
              </button>
            </div>
          </header>

          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyPrismWrap}>
                  <div style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "rgba(0,212,255,0.08)",
                    border: "1.5px solid rgba(0,212,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                    animation: "prismFloat 3.5s ease-in-out infinite",
                  }}>
                    {kine.emoji || "✦"}
                  </div>
                </div>
                <p className={styles.emptyTitle}>{kine.name}</p>
                <p className={styles.emptyGreeting}>by {kine.creatorName || "Anonymous"}</p>
                <p className={styles.emptySub}>{kine.shortDescription}</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrap} ${msg.role === "user" ? styles.userWrap : styles.assistantWrap}`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.assistantAvatar} style={{ fontSize: 14 }}>
                      {kine.emoji || "✦"}
                    </div>
                  )}
                  <div className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.assistantBubble}`}>
                    {msg.content}
                    {msg.streaming && <span className={styles.cursor}></span>}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputWrap}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${kine.name}...`}
                rows={1}
                disabled={streaming}
              />
              {streaming ? (
                <button className={styles.stopBtn} onClick={stopStreaming}>⏹</button>
              ) : (
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >↑</button>
              )}
            </div>
          </div>

          {showPaywall && (
            <SoftPaywall
              reason="You have reached your monthly message limit."
              onClose={() => setShowPaywall(false)}
            />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
