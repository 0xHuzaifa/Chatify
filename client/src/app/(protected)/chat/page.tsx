"use client"

import { useState } from "react"
import ChatSidebar from "@/components/chat/chat-sidebar"
import ChatWindow from "@/components/chat/chat-window"

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <ChatSidebar selectedChatId={selectedChatId} onSelectChat={setSelectedChatId} />
      <ChatWindow chatId={selectedChatId} />
    </div>
  )
}
