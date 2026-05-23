"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import {
  getKineById,
  createConversation,
  addMessage,
  getMessages,
  incrementKineUsage,
} from "@/lib/firestore"
import styles from "./KineChat.module.css"

export default function KineChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userDoc } = useAuth()

  const [kine, setKine] = useState(null)
  const [kineLoading, setKineLoading] = useState(true)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [usageIncremented, setUsageIncremented] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    loadKine()
  }, [params.kineId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadKine = async () => {
    try {
      const data = await getKineById(params.kineId)
      if (!data) { router.push("/kines"); return }
      setKine(data)
      if (user) {
        const convId = await createConversation(user.uid, params.kineId)
        setConversationId(convId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setKineLoading(false)
      inputRef.current?.focus()
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || !kine) return

    const userText = input.trim()
    const userMsg = { id: Date.now().toString(), role: "user", content: userText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setStreaming(true)

    if (user && conversationId) {
      await addMessage(conversationId, "user", userText)
    }

    if (!usageIncremented) {
      setUsageIncremented(true)
      incrementKineUsage(params.kineId).catch(() => {})
    }

    const assistantId = Date.now().toString() + "-a"
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", streaming: true }])

    abortControllerRef.current = new AbortController()

    try {
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId,
          userId: user?.uid,
          kinePersona: kine.persona,
          kineName: kine.name,
          soulData: userDoc?.soul || null,
          soulMemory: userDoc?.soulMemory || [],
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error("API error")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: fullResponse, streaming: true } : m)
        )
      }

      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: fullResponse, streaming: false } : m)
      )

      if (user && conversationId) {
        await addMessage(conversationId, "assistant", fullResponse)
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again.", streaming: false }
            : m
          )
        )
      } else {
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
        )
      }
    } finally {
      setStreaming(false)
      abortControllerRef.current = null
      inputRef.current?.focus()
    }
  }

  const stopStreaming = () => {
    abortControllerRef.current?.abort()
  }

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

  if (kineLoading) {
    return (
      <ProtectedRoute>
        <AppLayout variant="universe">
          <div className={styles.loading}>
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
            <div className={styles.loadingDot} />
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
              <button className={styles.backBtn} onClick={() => router.push(`/kines/${params.kineId}`)}>
                ←
              </button>
              <div className={styles.kineAvatar}>{kine?.emoji || "✦"}</div>
              <div className={styles.kineInfo}>
                <span className={styles.kineName}>{kine?.name}</span>
                <span className={styles.kineCategory}>{kine?.category || "general"}</span>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.detailBtn}
                onClick={() => router.push(`/kines/${params.kineId}`)}
              >
                View Details
              </button>
            </div>
          </header>

          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyAvatar}>{kine?.emoji || "✦"}</div>
                <p className={styles.emptyName}>{kine?.name}</p>
                <p className={styles.emptyDesc}>
                  {kine?.shortDescription || "Start the conversation"}
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.messageRow} ${msg.role === "user" ? styles.userRow : styles.assistantRow}`}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.msgAvatar}>{kine?.emoji || "✦"}</div>
                  )}
                  <div className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.assistantBubble}`}>
                    <div className={styles.bubbleText}>
                      {msg.content}
                      {msg.streaming && <span className={styles.cursor} />}
                    </div>
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
                placeholder={`Message ${kine?.name || "Kine"}...`}
                rows={1}
                disabled={streaming}
              />
              {streaming ? (
                <button className={styles.stopBtn} onClick={stopStreaming}>
                  ■
                </button>
              ) : (
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  ↑
                </button>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
