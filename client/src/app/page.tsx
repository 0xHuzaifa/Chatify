"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      router.push("/chat")
    } else {
      router.push("/login")
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div className="animate-spin">
          <div
            className="w-12 h-12 border-4 border-t rounded-full"
            style={{
              borderColor: "var(--color-bg-tertiary)",
              borderTopColor: "var(--color-primary)",
            }}
          />
        </div>
      </div>
    )
  }

  return null
}
