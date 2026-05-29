"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import {
  getArena,
  joinArena,
  addArenaMessage,
  getArenaMessages,
} from "@/lib/firestore"
import {
  joinArenaPresence,
  watchPresence,
  updateTyping,
  watchTyping,
} from "@/lib/arena"
import styles from "./ArenaRoom.module.css"

export default function ArenaRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userDoc } = useAuth()
  const arenaId = params.arenaId

  const [arena, setArena] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [members, setMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [copied, setCopied] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const presenceCleanupRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!user || !arenaId) return

    loadArena()
    setupPresence()

    const unsubMessages = getArenaMessages(arenaId, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })

    const unsubPresence = watchPresence(arenaId, setMembers)

    const unsubTyping = watchTyping(arenaId, user.uid, setTypingUsers)

    return () => {
      unsubMessages()
      unsubPresence()
      unsubTyping()
      if (presenceCleanupRef.current) presenceCleanupRef.current()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [user, arenaId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadArena = async () => {
    try {
      const data = await getArena(arenaId)
      if (!data) { router.push("/arena"); return }
      setArena(data)
      if (!data.members?.includes(user.uid)) {
        await joinArena(arenaId, user.uid)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const setupPresence = async () => {
    const name = userDoc?.soul?.name || userDoc?.name || "Builder"
    const cleanup = await joinArenaPresence(arenaId, user.uid, name)
    presenceCleanupRef.current = cleanup
  }

  const handleTyping = (value) => {
    setInput(value)
    updateTyping(arenaId, user.uid, true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      updateTyping(arenaId, user.uid, false)
    }, 2000)
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming) return

    const messageContent = input.trim()
    setInput("")
    updateTyping(arenaId, user.uid, false)

    const userName = userDoc?.soul?.name || userDoc?.name || "Builder"

    await addArenaMessage(arenaId, user.uid, userName, messageContent)

    const shouldAskAI = messageContent.toLowerCase().includes("@kaizen") ||
      messageContent.toLowerCase().includes("@ai") ||
      messageContent.startsWith("/")

    if (shouldAskAI) {
      await askKaizen4(messageContent)
    }
  }

  const askKaizen4Directly = async () => {
    if (!input.trim() || streaming) return
    const messageContent = input.trim()
    setInput("")

    const userName = userDoc?.soul?.name || userDoc?.name || "Builder"
    await addArenaMessage(arenaId, user.uid, userName, messageContent)
    await askKaizen4(messageContent)
  }

  const askKaizen4 = async (triggerMessage) => {
    setStreaming(true)
    setAiThinking(true)
    abortRef.current = new AbortController()

    const aiMessageId = `ai-${Date.now()}`
    setMessages(prev => [...prev, {
      id: aiMessageId,
      userId: "kaizen4",
      userName: "Kaizen 4",
      content: "",
      isAI: true,
      streaming: true,
    }])
    setAiThinking(false)

    try {
      // Build alternating role history — Anthropic requires user/assistant alternation
      const rawMessages = messages
        .filter(m => m.content)
        .slice(-10)
        .map(m => ({
          role: (m.isAI || m.userId === "kaizen4") ? "assistant" : "user",
          content: (m.isAI || m.userId === "kaizen4") ? m.content : `${m.userName}: ${m.content}`,
        }))

      rawMessages.push({ role: "user", content: triggerMessage })

      // Merge consecutive same-role messages to satisfy API requirements
      const recentMessages = rawMessages.reduce((acc, msg) => {
        const last = acc[acc.length - 1]
        if (last && last.role === msg.role) {
          last.content += "\n" + msg.content
        } else {
          acc.push({ ...msg })
        }
        return acc
      }, [])

      const response = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: recentMessages,
          arenaId,
          soulData: userDoc?.soul,
          soulMemory: userDoc?.soulMemory,
          memberCount: members.length,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error("Arena AI error")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullResponse += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m =>
          m.id === aiMessageId
            ? { ...m, content: fullResponse, streaming: true }
            : m
        ))
      }

      setMessages(prev => prev.map(m =>
        m.id === aiMessageId
          ? { ...m, content: fullResponse, streaming: false }
          : m
      ))

      await addArenaMessage(arenaId, "kaizen4", "Kaizen 4", fullResponse)
      setMessages(prev => prev.filter(m => m.id !== aiMessageId))

    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev => prev.filter(m => m.id !== aiMessageId))
      }
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/arena/${arenaId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (name) => {
    return (name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (userId) => {
    const colors = [
      "rgba(0,212,255,0.15)",
      "rgba(0,150,255,0.15)",
      "rgba(0,255,200,0.10)",
      "rgba(150,0,255,0.10)",
    ]
    const index = userId.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout variant="default">
          <div className={styles.loadingState}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout variant="default">
        <div className={styles.room}>

          <div className={styles.roomHeader}>
            <div className={styles.headerLeft}>
              <button
                className={styles.backBtn}
                onClick={() => router.push("/arena")}
              >←</button>
              <div className={styles.arenaName}>{arena?.name || "Arena"}</div>
              <div className={styles.liveIndicator}>
                <span className={styles.liveDot}></span>
                Live
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.memberAvatars}>
                {members.slice(0, 4).map(member => (
                  <div
                    key={member.userId}
                    className={styles.memberAvatar}
                    style={{ background: getAvatarColor(member.userId) }}
                    title={member.userName}
                  >
                    {getInitials(member.userName)}
                  </div>
                ))}
                {members.length > 4 && (
                  <div className={styles.memberAvatar} style={{ background: "rgba(255,255,255,0.06)" }}>
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <button className={styles.shareBtn} onClick={handleCopyLink}>
                {copied ? "✓ Copied" : "⎘ Invite"}
              </button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.emptyRoom}>
                <div className={styles.emptyIcon}>🤝</div>
                <p className={styles.emptyTitle}>Arena is ready</p>
                <p className={styles.emptySub}>
                  Share the link to invite collaborators.
                  Use @kaizen to ask Kaizen 4 anything.
                </p>
              </div>
            )}
            {messages.map(msg => {
              const isCurrentUser = msg.userId === user?.uid
              const isAI = msg.isAI || msg.userId === "kaizen4"

              return (
                <div
                  key={msg.id}
                  className={`${styles.messageWrap} ${isCurrentUser ? styles.ownWrap : isAI ? styles.aiWrap : styles.otherWrap}`}
                >
                  {!isCurrentUser && (
                    <div
                      className={`${styles.msgAvatar} ${isAI ? styles.aiAvatar : ""}`}
                      style={!isAI ? { background: getAvatarColor(msg.userId) } : {}}
                    >
                      {isAI ? (
                        <svg viewBox="0 0 20 20" width="12" height="12">
                          <polygon points="10,2 18,17 2,17" fill="#00d4ff"/>
                        </svg>
                      ) : getInitials(msg.userName)}
                    </div>
                  )}
                  <div className={styles.msgContent}>
                    {!isCurrentUser && (
                      <div className={styles.msgName}>
                        {isAI ? "Kaizen 4" : msg.userName}
                      </div>
                    )}
                    <div className={`${styles.bubble} ${isCurrentUser ? styles.ownBubble : isAI ? styles.aiBubble : styles.otherBubble}`}>
                      {msg.content}
                      {msg.streaming && <span className={styles.cursor}></span>}
                    </div>
                  </div>
                </div>
              )
            })}

            {aiThinking && (
              <div className={`${styles.messageWrap} ${styles.aiWrap}`}>
                <div className={`${styles.msgAvatar} ${styles.aiAvatar}`}>
                  <svg viewBox="0 0 20 20" width="12" height="12">
                    <polygon points="10,2 18,17 2,17" fill="#00d4ff"/>
                  </svg>
                </div>
                <div className={styles.msgContent}>
                  <div className={styles.msgName}>Kaizen 4</div>
                  <div className={`${styles.bubble} ${styles.aiBubble} ${styles.thinkingBubble}`}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                  </div>
                </div>
              </div>
            )}

            {typingUsers.length > 0 && (
              <div className={styles.typingIndicator}>
                {typingUsers.length === 1
                  ? "Someone is typing..."
                  : `${typingUsers.length} people are typing...`}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <div className={styles.inputHint}>
              Type a message · Use @kaizen to ask Kaizen 4
            </div>
            <div className={styles.inputRow}>
              <div className={styles.inputWrap}>
                <textarea
                  ref={inputRef}
                  className={styles.input}
                  value={input}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message the Arena..."
                  rows={1}
                  disabled={streaming}
                />
              </div>
              <div className={styles.inputBtns}>
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming}
                  title="Send message"
                >
                  ↑
                </button>
                <button
                  className={styles.aiBtn}
                  onClick={askKaizen4Directly}
                  disabled={!input.trim() || streaming}
                  title="Ask Kaizen 4"
                >
                  ✦
                </button>
              </div>
            </div>
          </div>

        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
