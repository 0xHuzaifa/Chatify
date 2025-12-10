import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--color-bg-primary), var(--color-bg-secondary), var(--color-bg-primary))",
      }}
    >
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-10 right-10 w-72 h-72 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--color-primary)" }}
          ></div>
          <div
            className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--color-secondary)" }}
          ></div>
        </div>

        <div className="relative z-10 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-2xl font-bold text-white"
            style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
          >
            M
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Messenger
          </h1>
          <p className="text-lg mb-8 max-w-md" style={{ color: "var(--color-text-secondary)" }}>
            Connect instantly with anyone, anywhere. Your conversations, your way.
          </p>

          <div className="space-y-4 mt-12">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                ✓
              </div>
              <span style={{ color: "var(--color-text-secondary)" }}>Secure & Private</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                ✓
              </div>
              <span style={{ color: "var(--color-text-secondary)" }}>Instant Messaging</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                ✓
              </div>
              <span style={{ color: "var(--color-text-secondary)" }}>Always Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
