"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRegister } from "@/queries/auth.queries"

export default function SignUpPage() {
  const router = useRouter()
  const { mutate: register, isPending: isLoading } = useRegister()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
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

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    register(
      {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: (res) => {
          // Pass userId or email to verification page if needed
          const userId = res.data.data._id
          router.push(`/verification?userId=${userId}`)
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || "Registration failed")
        },
      }
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Create Account
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>Join millions connecting globally</p>
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
            htmlFor="fullName"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition"
            placeholder="Enter your full name"
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
            placeholder="At least 6 characters"
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
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition"
            placeholder="Confirm your password"
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center">
        <p style={{ color: "var(--color-text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold transition" style={{ color: "var(--color-primary)" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
