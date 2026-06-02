"use client"

import { useState, useEffect, useRef } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import {
  createProject,
  getUserProjects,
  updateProject,
  deleteProject,
  getUserConversations,
} from "@/lib/firestore"
import { useToast } from "@/components/ui/Toast"
import PageWrapper from "@/components/ui/PageWrapper"
import styles from "./Projects.module.css"

export default function ProjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { success } = useToast()
  const [projects, setProjects] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (!user) return
    try {
      const unsub1 = getUserProjects(user.uid, (projs) => {
        setProjects(projs)
        setLoading(false)
      })
      const unsub2 = getUserConversations(user.uid, (convs) => {
        setConversations(convs)
      })
      return () => { unsub1(); unsub2() }
    } catch (err) {
      console.error(err)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Failed to load projects. Please refresh.")
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  const handleCreate = async () => {
    if (!newName.trim() || !user) return
    await createProject(user.uid, newName.trim())
    success(`Project "${newName.trim()}" created`)
    setNewName("")
    setCreating(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreate()
    if (e.key === "Escape") { setCreating(false); setNewName("") }
  }

  const handleRename = async (id) => {
    if (!editName.trim()) return
    await updateProject(id, { name: editName.trim() })
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (confirm("Delete this project?")) {
      await deleteProject(id)
      success("Project deleted")
    }
  }

  const handlePin = async (id, pinned) => {
    await updateProject(id, { pinned: !pinned })
  }

  const getProjectConversations = (projectId) => {
    return conversations.filter(c => c.projectId === projectId)
  }

  return (
    <ProtectedRoute>
      <AppLayout imageSrc="/images/backgrounds/dashboard-bg.jpg" imageOpacity={0.82}>
        <PageWrapper
          loading={loading}
          error={error}
          onRetry={() => window.location.reload()}
          maxWidth="900px"
          padding="32px 36px"
        >
          <div className={styles.header}>
            <h1 className={styles.title}>Projects</h1>
            <button
              className={styles.newBtn}
              onClick={() => setCreating(true)}
            >
              + New Project
            </button>
          </div>

          {creating && (
            <div className={styles.createRow}>
              <input
                ref={inputRef}
                className={styles.createInput}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Project name..."
              />
              <button className={styles.createSave} onClick={handleCreate}>
                Create
              </button>
              <button
                className={styles.createCancel}
                onClick={() => { setCreating(false); setNewName("") }}
              >
                Cancel
              </button>
            </div>
          )}

          {projects.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📁</div>
              <p className={styles.emptyTitle}>No projects yet</p>
              <p className={styles.emptySub}>Create a project to organise your conversations</p>
              <button
                className={styles.emptyBtn}
                onClick={() => setCreating(true)}
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {projects.map(project => {
                const projectConvs = getProjectConversations(project.id)
                return (
                  <div key={project.id} className={styles.projectCard}>
                    <div className={styles.projectHeader}>
                      {editingId === project.id ? (
                        <input
                          className={styles.renameInput}
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleRename(project.id)
                            if (e.key === "Escape") setEditingId(null)
                          }}
                          autoFocus
                        />
                      ) : (
                        <h3 className={styles.projectName}>{project.name}</h3>
                      )}
                      <div className={styles.projectActions}>
                        <button
                          className={`${styles.pinBtn} ${project.pinned ? styles.pinned : ""}`}
                          onClick={() => handlePin(project.id, project.pinned)}
                          title={project.pinned ? "Unpin" : "Pin"}
                        >
                          {project.pinned ? "📌" : "📍"}
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setEditingId(project.id)
                            setEditName(project.name)
                          }}
                        >
                          ✎
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(project.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className={styles.projectMeta}>
                      <span className={styles.convCount}>
                        {projectConvs.length} conversation{projectConvs.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className={styles.projectConvs}>
                      {projectConvs.slice(0, 3).map(conv => (
                        <div
                          key={conv.id}
                          className={styles.convPreview}
                          onClick={() => router.push(`/chat/${conv.id}`)}
                        >
                          💬 {conv.title || "New Conversation"}
                        </div>
                      ))}
                      {projectConvs.length > 3 && (
                        <div className={styles.moreConvs}>
                          +{projectConvs.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </PageWrapper>
      </AppLayout>
    </ProtectedRoute>
  )
}
