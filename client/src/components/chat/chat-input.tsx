"use client";

import { useState } from "react";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div
      className="border-t p-4"
      style={{
        borderColor: "var(--color-bg-tertiary)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      <div className="flex items-end gap-3">
        <button
          className="w-10 h-10 hover:bg-opacity-80 rounded-lg transition flex items-center justify-center shrink-0"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            color: "var(--color-text-secondary)",
          }}
        >
          ➕
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            borderColor: "var(--color-bg-tertiary)",
            color: "var(--color-text-primary)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.boxShadow = "0 0 0 1px var(--color-primary)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-bg-tertiary)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-10 h-10 rounded-lg transition flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0 bg-black/80"
        >
          ✈️
        </button>
      </div>
    </div>
  );
}
