"use client";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import EmptyChat from "@/components/chat/empty-chat";
import { useGetMessages } from "@/queries/message.queries";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useMemo } from "react";
import { connectSocket, getSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/store/chat.store";

// Memoized selectors
const selectCurrentUser = (s: any) => s.user;
const selectSetInitialMessages = (s: any) => s.setInitialMessages;
const selectOnlineUsers = (s: any) => s.onlineUsers;
const selectSelectedChatData = (s: any) => s.selectedChatData;
const selectSetCurrentChat = (s: any) => s.setCurrentChat;

const EMPTY_MESSAGES: any[] = [];

export default function ChatWindow({ chatId }: { chatId: string | null }) {
  // Fetch messages for this chat
  const { data: messagesData, isPending: isMessagesLoading } =
    useGetMessages(chatId);

  const currentUser = useAuthStore(selectCurrentUser);

  const setInitialMessages = useChatStore(selectSetInitialMessages);
  const setCurrentChat = useChatStore(selectSetCurrentChat);

  const onlineUsers = useChatStore(selectOnlineUsers);
  const selectedChatData = useChatStore(selectSelectedChatData);

  const storedMessages = useChatStore(
    (s: any) => (chatId ? s.messages?.[chatId] : undefined),
  );
  const storedMessagesArray = storedMessages ?? EMPTY_MESSAGES;

  useEffect(() => {
    if (!chatId || !messagesData?.messages) return;

    const formattedMessages = messagesData.messages.map((msg: any) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender?._id : msg.sender;

      return {
        ...msg,
        id: msg._id || msg.id,
        sender:
          String(senderId) === String(currentUser?._id) ? "user" : "other",
        text: msg.content || (msg.fileUrl ? "[Media]" : ""),
        timestamp: msg.createdAt || msg.timestamp || "",
      };
    });

    // Merge with any already-stored messages (e.g., real-time arrivals)
    const existing = useChatStore.getState().messages?.[chatId] || [];
    if (existing.length === 0) {
      setInitialMessages(chatId, formattedMessages);
      return;
    }

    const byId = new Map<string, any>();
    for (const m of [...existing, ...formattedMessages]) {
      const id = String(m?.id ?? m?._id ?? "");
      if (!id) continue;
      byId.set(id, m);
    }

    const merged = Array.from(byId.values()).sort((a, b) => {
      const at = new Date(a.timestamp || a.createdAt || 0).getTime();
      const bt = new Date(b.timestamp || b.createdAt || 0).getTime();
      return at - bt;
    });

    setInitialMessages(chatId, merged);
  }, [chatId, messagesData, currentUser, setInitialMessages]);

  useEffect(() => {
    setCurrentChat(chatId);
    if (!chatId) return;

    const socket = getSocket() ?? connectSocket();
    socket.emit("join_chat", chatId);
    socket.emit("mark_read", chatId);

    return () => {
      socket.emit("leave_chat", chatId);
      socket.emit("stop_typing", chatId);
    };
  }, [chatId, setCurrentChat]);

  const messages = useMemo(() => {
    return storedMessagesArray.map((msg: any) => ({
      id: msg.id || msg._id,
      sender: msg.sender,
      text: msg.text ?? msg.content ?? "",
      timestamp: msg.timestamp ?? msg.createdAt ?? "",
    }));
  }, [storedMessagesArray]);

  // Early returns after all hooks
  if (!chatId) return <EmptyChat />;
  if (isMessagesLoading && storedMessagesArray.length === 0) return <EmptyChat />;

  // Use data from store instead of API response
  const chatData = selectedChatData || {};

  // Extract chat info
  const chatName =
    chatData.chatName ||
    chatData.participants?.find(
      (p: any) => String(p._id) !== String(currentUser?._id),
    )?.fullName ||
    "Unknown";
  const chatAvatar = chatData.avatar || "👤";

  // Get the other participant's online status
  let isOnline = false;

  if (chatData.isGroup) {
    const otherParticipants = chatData.participants?.filter(
      (p: any) => String(p._id) !== String(currentUser?._id),
    );
    if (otherParticipants && otherParticipants.length > 0) {
      isOnline = otherParticipants.some((p: any) =>
        onlineUsers.includes(String(p._id)),
      );
    }
  } else {
    const otherParticipant = chatData.participants?.find(
      (p: any) => String(p._id) !== String(currentUser?._id),
    );
    isOnline = otherParticipant
      ? onlineUsers.includes(String(otherParticipant._id))
      : false;
  }

  return (
    <div
      className="hidden sm:flex sm:flex-col flex-1"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <ChatHeader name={chatName} avatar={chatAvatar} isOnline={isOnline} />
      <ChatMessages messages={messages} />
      <ChatInput chatId={chatId} />
    </div>
  );
}
