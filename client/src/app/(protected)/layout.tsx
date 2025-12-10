"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate auth check
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      router.push("/login")
    } else {
      setIsAuthorized(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-bg-primary)">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-(--color-bg-tertiary) border-t-(--color-primary) rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return children
}
