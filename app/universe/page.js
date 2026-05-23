"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UniverseRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/kines") }, [router])
  return null
}
