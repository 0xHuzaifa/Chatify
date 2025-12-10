"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getInitials from "@/utils/getInitialName";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  avatar?: string;
  unread: number;
  timestamp: string;
  isOnline?: boolean;
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
}: {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium">No conversations found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full px-3 py-2.5 rounded-lg transition-colors group relative ${
                selectedChatId === chat.id
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-accent/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0 mt-1">
                  <Avatar className="">
                    {chat.avatar && (
                      <AvatarImage
                        src={chat.avatar || "/placeholder.svg"}
                        alt={chat.name}
                      />
                    )}
                    <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {getInitials(chat.name)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {chat.name}
                    </h3>
                    <span className="text-xs shrink-0 text-muted-foreground">
                      {chat.timestamp}
                    </span>
                  </div>
                  <p
                    className="text-xs truncate text-muted-foreground"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {chat.lastMessage}
                  </p>
                </div>

                {chat.unread > 0 && (
                  <Badge
                    variant="default"
                    className="shrink-0 ml-1 bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-xl"
                  >
                    {chat.unread}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
