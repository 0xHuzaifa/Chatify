"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectSocket, getSocket } from "@/lib/socket/socket";

export default function ChatInput({ chatId }: { chatId?: string | null }) {
  const [message, setMessage] = useState("");
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback(() => {
    if (!chatId) return;

    const socket = getSocket() ?? connectSocket();
    socket.emit("typing", chatId);

    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", chatId);
    }, 800);
  }, [chatId]);

  useEffect(() => {
    return () => {
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    };
  }, []);

  const handleSend = useCallback(() => {
    if (!chatId) return;

    const content = message.trim();
    if (!content) return;

    const socket = getSocket() ?? connectSocket();
    socket.emit("send_message", { chatId, content });
    socket.emit("stop_typing", chatId);
    setMessage("");
  }, [chatId, message]);

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
          disabled={!chatId}
        >
          ➕
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          disabled={!chatId}
          onChange={(e) => {
            setMessage(e.target.value);
            if (e.target.value.trim()) emitTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
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
          disabled={!chatId || !message.trim()}
          className="w-10 h-10 rounded-lg transition flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0 bg-black/80"
        >
          ✈️
        </button>
      </div>
    </div>
  );
}
