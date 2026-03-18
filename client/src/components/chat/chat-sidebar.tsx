"use client";
import { useState } from "react";
import SearchInput from "@/components/chat/search-input";
import ChatList from "@/components/chat/chat-list";
import UserProfile from "@/components/chat/user-profile";
import { useAccessChat, useFetchChats } from "@/queries/chat.queries";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";

// Memoized selector for online users
const selectOnlineUsers = (s: any) => s.onlineUsers;
const selectCurrentUser = (s: any) => s.user;
const selectSetSelectedChatData = (s: any) => s.setSelectedChatData;

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  avatar?: string;
  unread: number;
  timestamp: string;
  isOnline?: boolean;
}

export default function ChatSidebar({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chatsData } = useFetchChats();
  const { mutateAsync: accessChat, isPending: isAccessingChat } =
    useAccessChat();

  // Get real-time online users from store
  const onlineUsers = useChatStore(selectOnlineUsers);
  const currentUser = useAuthStore(selectCurrentUser);
  const setSelectedChatData = useChatStore(selectSetSelectedChatData);
  const currentUserId = currentUser?._id ?? null;

  const getMessageContent = (m: any) => {
    if (!m) return "";
    if (typeof m === "string") return m;
    if (typeof m === "object") return m.content ?? "";
    return String(m);
  };

  const serverChats = Array.isArray(chatsData)
    ? chatsData.map((c: any) => {
        let displayName = c.chatName ?? "Unknown";

        let unread = 0;
        if (Array.isArray(c.unreadCount) && c.unreadCount.length > 0) {
          const entry = c.unreadCount.find(
            (u: any) => String(u.user) === String(currentUserId),
          );
          unread = entry?.count ?? 0;
        }

        const timestamp = c.lastMessage?.createdAt ?? c.updatedAt ?? "";

        // ── Real-time online status ──
        let isOnline = false;

        // Group chat: check if any other participant is online
        if (c.isGroup) {
          const otherParticipants = c.participants?.filter(
            (p: any) => String(p._id) !== String(currentUserId),
          );
          if (otherParticipants && otherParticipants.length > 0) {
            isOnline = otherParticipants.some((p: any) =>
              onlineUsers.includes(String(p._id)),
            );
          }
        }
        // Single chat: check the other participant
        else {
          const otherParticipant = c.participants?.find(
            (p: any) => String(p._id) !== String(currentUserId),
          );
          if (otherParticipant) {
            isOnline = onlineUsers.includes(String(otherParticipant._id));
          }
        }

        return {
          id: c._id ?? c.id,
          name: displayName,
          lastMessage: getMessageContent(c.lastMessage ?? c.latestMessage),
          avatar: c.avatar,
          unread,
          timestamp,
          isOnline, // ← now real-time!
          _raw: c, // Store raw data for later use
        };
      })
    : [];

  const sourceChats = serverChats.length ? serverChats : [];
  const filteredChats = sourceChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handler for chat selection that also saves the full chat data
  const handleSelectChat = (chatId: string) => {
    const selectedChat = serverChats.find((c: any) => c.id === chatId);
    if (selectedChat?._raw) {
      setSelectedChatData(selectedChat._raw);
    }
    onSelectChat(chatId);
  };

  const handleSelectUserFromSearch = async (user: { _id: string }) => {
    const existingChat = serverChats.find((chat: any) => {
      const raw = chat?._raw;
      if (!raw || raw.isGroup) return false;
      return raw.participants?.some(
        (participant: any) => String(participant?._id) === String(user._id),
      );
    });

    if (existingChat?.id) {
      handleSelectChat(existingChat.id);
      return;
    }

    try {
      const response = await accessChat({ userId: user._id });
      const chat = response?.data?.data;
      if (!chat?._id) return;

      setSelectedChatData(chat);
      onSelectChat(String(chat._id));
    } catch {
      // no-op: keep current chat selection if access fails
    }
  };

  const handleSelectGroupFromSearch = async (group: { _id: string }) => {
    const existingGroup = serverChats.find((chat: any) => {
      const raw = chat?._raw;
      if (!raw || !raw.isGroup) return false;
      return String(raw._id || raw.id) === String(group._id);
    });

    if (existingGroup?.id) {
      handleSelectChat(existingGroup.id);
      return;
    }

    try {
      const response = await accessChat({ groupId: group._id });
      const chat = response?.data?.data;
      if (!chat?._id) return;

      setSelectedChatData(chat);
      onSelectChat(String(chat._id));
    } catch {
      // no-op: keep current chat selection if access fails
    }
  };

  return (
    <div
      className="w-full sm:w-96 border-r flex flex-col h-screen overflow-hidden bg-background"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
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
          totalCount={sourceChats.length}
          onSelectUser={handleSelectUserFromSearch}
          onSelectGroup={handleSelectGroupFromSearch}
          isAccessingChat={isAccessingChat}
        />
      </div>
      <ChatList
        chats={filteredChats.map(({ _raw, ...chat }) => chat)}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
      />
      <UserProfile />
    </div>
  );
}
