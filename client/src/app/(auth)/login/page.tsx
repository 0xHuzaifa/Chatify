"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Email and password are required")
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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Welcome Back
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition"
            placeholder="your@email.com"
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
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition"
            placeholder="Enter your password"
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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage: "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
          }}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="space-y-3">
        <Link
          href="/forgot-password"
          className="block text-center font-medium transition"
          style={{ color: "var(--color-primary)" }}
        >
          Forgot Password?
        </Link>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--color-bg-tertiary)" }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className="px-2"
              style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-tertiary)" }}
            >
              or
            </span>
          </div>
        </div>

        <p style={{ color: "var(--color-text-secondary)" }}>
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold transition" style={{ color: "var(--color-primary)" }}>
            Create One
          </Link>
        </p>
      </div>
    </div>
  )
}
