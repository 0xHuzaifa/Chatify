"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VerifyCodePage() {
  const router = useRouter()
  const [codes, setCodes] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCodes = [...codes]
    newCodes[index] = value.slice(-1)
    setCodes(newCodes)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = codes.join("")

    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    localStorage.setItem("authToken", "demo-token-" + Date.now())
    setTimeout(() => {
      setIsLoading(false)
      router.push("/chat")
    }, 1000)
  }

  return (
    <div className="space-y-8 max-w-md">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Verify Your Email
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Enter the 6-digit code sent to your email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="p-3 rounded-lg text-sm border"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.5)",
              color: "var(--color-error)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {codes.map((code, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 border rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-1 transition"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-tertiary)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)"
                e.currentTarget.style.boxShadow = "0 0 0 1px var(--color-primary)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-bg-tertiary)"
                e.currentTarget.style.boxShadow = "none"
              }}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || codes.join("").length !== 6}
          className="w-full text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
          }}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="text-center">
        <p style={{ color: "var(--color-text-secondary)" }}>
          <span className="text-sm mb-2 block">Didn't receive the code?</span>
        </p>
        <button type="button" className="font-semibold transition" style={{ color: "var(--color-primary)" }}>
          Resend Code
        </button>
      </div>
    </div>
  )
}
