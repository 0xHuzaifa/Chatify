"use client";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import EmptyChat from "@/components/chat/empty-chat";

const mockChats: Record<
  string,
  {
    name: string;
    avatar: string;
    messages: Array<{
      id: string;
      sender: "user" | "other";
      text: string;
      timestamp: string;
    }>;
  }
> = {
  "1": {
    name: "Sarah Anderson",
    avatar: "👩‍🦰",
    messages: [
      {
        id: "1",
        sender: "other",
        text: "Hey! How are you doing?",
        timestamp: "2:10 PM",
      },
      {
        id: "2",
        sender: "user",
        text: "I'm doing great! How about you?",
        timestamp: "2:11 PM",
      },
      {
        id: "3",
        sender: "other",
        text: "All good! That sounds amazing!",
        timestamp: "2:30 PM",
      },
    ],
  },
  "2": {
    name: "Mike Johnson",
    avatar: "👨‍💼",
    messages: [
      {
        id: "1",
        sender: "other",
        text: "Meeting is scheduled for tomorrow at 10 AM",
        timestamp: "10:00 AM",
      },
      {
        id: "2",
        sender: "user",
        text: "Perfect! I'll be there",
        timestamp: "10:05 AM",
      },
      {
        id: "3",
        sender: "other",
        text: "See you tomorrow",
        timestamp: "Yesterday",
      },
    ],
  },
};

export default function ChatWindow({ chatId }: { chatId: string | null }) {
  if (!chatId) return <EmptyChat />;
  const chatData = mockChats[chatId];
  if (!chatData) return <EmptyChat />;

  return (
    <div
      className="hidden sm:flex sm:flex-col flex-1"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <ChatHeader name={chatData.name} avatar={chatData.avatar} />
      <ChatMessages messages={chatData.messages} />
      <ChatInput />
    </div>
  );
}
