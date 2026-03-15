import { useEffect, useCallback } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket/socket";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { useQueryClient } from "@tanstack/react-query";

// Memoized selectors to prevent infinite loops with useSyncExternalStore
const selectIsAuthenticated = (s: any) => s.isAuthenticated;
const selectUserId = (s: any) => s.user?._id;
const selectSetOnline = (s: any) => s.setOnline;
const selectSetOffline = (s: any) => s.setOffline;
const selectAddMessage = (s: any) => s.addMessage;
const selectSetTyping = (s: any) => s.setTyping;

export default function useSocket() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const currentUserId = useAuthStore(selectUserId);
  const setOnline = useChatStore(selectSetOnline);
  const setOffline = useChatStore(selectSetOffline);
  const addMessage = useChatStore(selectAddMessage);
  const setTyping = useChatStore(selectSetTyping);
  const queryClient = useQueryClient();

  // Memoize event handlers to ensure stable references
  const onMessage = useCallback(
    (msg: any) => {
      console.log("SOCKET RECEIVED RAW:", msg);
      const chatId = msg.chat || msg.chatId;
      if (!chatId) return;

      const currentUser = useAuthStore.getState().user;
      const openChatId = useChatStore.getState().currentChatId;

      // Determine if current user is the sender
      // Format message
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const isCurrentUserSender =
        currentUser && String(senderId) === String(currentUser._id);

      const formatted = {
        ...msg,
        id: msg._id,
        sender: isCurrentUserSender ? "user" : "other",
        text: msg.content || (msg.fileUrl ? "[Media]" : ""),
        timestamp: msg.createdAt,
      };

      addMessage(chatId, formatted);

      // Keep message queries in sync for the currently open chat (keys include cursor/limit)
      if (chatId === openChatId) {
        queryClient.invalidateQueries({ queryKey: ["messages", chatId] });

        // If user is actively viewing this chat, immediately mark as read
        // so unread counts don't increase for the open conversation.
        const socket = connectSocket();
        socket.emit("mark_read", chatId);
      }

      // If this is NOT the current open chat → increment unread
      if (chatId !== openChatId && currentUser) {
        // Option A: optimistic local increment (preferred)
        queryClient.setQueryData(["chats"], (old: any) => {
          if (!old) return old;
          return old.map((chat: any) =>
            chat._id === chatId
              ? {
                  ...chat,
                  unreadCount: Array.isArray(chat.unreadCount)
                    ? chat.unreadCount.map((uc: any) =>
                        String(uc.user) === String(currentUser._id)
                          ? { ...uc, count: (uc.count || 0) + 1 }
                          : uc,
                      )
                    : chat.unreadCount,
                }
              : chat,
          );
        });

        // Option B: just invalidate (simpler but causes refetch)
        // queryClient.invalidateQueries({ queryKey: ["chats"] });
      }
    },
    [addMessage, queryClient],
  );

  const onChatUpdated = useCallback(
    (update: { chatId: string; lastMessage: any; updatedAt: string }) => {
      queryClient.setQueryData(["chats"], (oldChats: any[] = []) => {
        if (!oldChats) return oldChats;

        const updatedChats = oldChats.map((chat) => {
          if (chat._id === update.chatId) {
            return {
              ...chat,
              lastMessage: update.lastMessage,
              updatedAt: update.updatedAt,
            };
          }
          return chat;
        });
        // Re-sort by updatedAt (newest first)
        return updatedChats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    const socket = connectSocket();

    socket.on("message_received", onMessage);
    socket.on("chat_updated", onChatUpdated);

    // Unread count updates
    socket.on(
      "unread_updated",
      ({ chatId, unreadCount }: { chatId: string; unreadCount: number }) => {
        const openChatId = useChatStore.getState().currentChatId;
        const nextCount = chatId === openChatId ? 0 : unreadCount;

        queryClient.setQueryData(["chats"], (oldChats: any[] = []) => {
          if (!oldChats) return oldChats;
          return oldChats.map((chat) => {
            if (chat._id === chatId) {
              return {
                ...chat,
                unreadCount: Array.isArray(chat.unreadCount)
                  ? chat.unreadCount.map((uc: any) =>
                      String(uc.user) === String(currentUserId)
                        ? { ...uc, count: nextCount }
                        : uc,
                    )
                  : chat.unreadCount,
              };
            }
            return chat;
          });
        });
      },
    );

    // Online users handling
    socket.on("online_users", (userIds: string[]) => {
      console.log("[ONLINE USERS INITIAL]", userIds);
      useChatStore.setState({ onlineUsers: userIds });
    });
    socket.on("user_online", (userId: string) => {
      console.log("[USER ONLINE]", userId);
      setOnline(userId);
    });
    socket.on("user_offline", (userId: string) => {
      console.log("[USER OFFLINE]", userId);
      setOffline(userId);
    });

    // Typing handlers
    socket.on("typing", (payload) => {
      const chatId = payload?.chatId;
      if (chatId) setTyping(chatId, true);
    });

    socket.on("stop_typing", (payload) => {
      const chatId = payload?.chatId;
      if (chatId) setTyping(chatId, false);
    });

    return () => {
      socket.off("message_received", onMessage);
      socket.off("chat_updated", onChatUpdated);
      socket.off("unread_updated");
      socket.off("online_users");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("typing");
      socket.off("stop_typing");

      disconnectSocket();
    };
  }, [
    isAuthenticated,
    currentUserId,
    onMessage,
    onChatUpdated,
    setOnline,
    setOffline,
    setTyping,
  ]);
}
