"use client";

import { useRef, useEffect } from "react";

export default function ChatMessages({
  messages,
}: {
  messages: Array<{
    id: string;
    sender: "user" | "other";
    text: string;
    timestamp: string;
  }>;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          } animate-fade-in`}
        >
          <div
            className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
            style={
              message.sender === "user"
                ? {
                    backgroundImage:
                      "linear-gradient(to right, var(--color-primary)",
                    color: "white",
                  }
                : {
                    backgroundColor: "var(--color-bg-secondary)",
                    color: "var(--color-text-primary)",
                  }
            }
          >
            <p className="text-sm">{message.text}</p>
            <p
              className="text-xs mt-1"
              style={{
                color:
                  message.sender === "user"
                    ? "rgba(255,255,255,0.7)"
                    : "var(--color-text-tertiary)",
              }}
            >
              {message.timestamp}
            </p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
