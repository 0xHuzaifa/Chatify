"use client";

export default function EmptyChat() {
  return (
    <div
      className="hidden sm:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, var(--color-bg-primary), var(--color-bg-secondary), var(--color-bg-primary))",
      }}
    >
      <div className="absolute inset-0 opacity-10">
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
        <div className="text-6xl mb-6 animate-fade-in">💬</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Start a Conversation
        </h2>
        <p
          className="max-w-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Select a chat from the list or start a new conversation to begin
          messaging
        </p>
      </div>
    </div>
  );
}
