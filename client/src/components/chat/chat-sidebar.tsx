"use client"
import { useState } from "react"
import SearchInput from "@/components/chat/search-input"
import ChatList from "@/components/chat/chat-list"
import UserProfile from "@/components/chat/user-profile"

interface Chat {
  id: string
  name: string
  lastMessage: string
  avatar?: string
  unread: number
  timestamp: string
  isOnline?: boolean
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Sarah Anderson",
    lastMessage: "That sounds amazing!",
    unread: 2,
    timestamp: "2:30 PM",
    isOnline: true,
  },
  {
    id: "2",
    name: "Mike Johnson",
    lastMessage: "See you tomorrow",
    unread: 0,
    timestamp: "Yesterday",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Davis",
    lastMessage: "Thanks for your help!",
    unread: 1,
    timestamp: "11:45 AM",
    isOnline: true,
  },
  {
    id: "4",
    name: "Design Team",
    lastMessage: "New designs are ready",
    unread: 0,
    timestamp: "10:20 AM",
    isOnline: true,
  },
  {
    id: "5",
    name: "Alex Chen",
    lastMessage: "Perfect! Let me know",
    unread: 3,
    timestamp: "Monday",
    isOnline: false,
  },
]

export default function ChatSidebar({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId: string | null
  onSelectChat: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const filteredChats = mockChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div
      className="w-full sm:w-96 border-r flex flex-col h-screen overflow-hidden bg-background"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Messages
          </h1>
          <button
            className="w-9 h-9 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
            style={{
              color: "var(--color-text-secondary)",
            }}
          >
            ⚙️
          </button>
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onFocus={() => {}}
          onBlur={() => {}}
          filteredCount={filteredChats.length}
          totalCount={mockChats.length}
        />
      </div>
      <ChatList chats={filteredChats} selectedChatId={selectedChatId} onSelectChat={onSelectChat} />
      <UserProfile />
    </div>
  )
}
