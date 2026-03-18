import { create } from "zustand";
import { ChatState } from "@/types/chat.type";

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  onlineUsers: [],
  typing: {},

  currentChatId: null,
  selectedChatData: null,

  setCurrentChat: (id: string | null) => set({ currentChatId: id }),

  setSelectedChatData: (data: any) => set({ selectedChatData: data }),

  addMessage: (chatId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), msg],
      },
    })),

  setOnline: (id: string) =>
    set((s) => {
      if (s.onlineUsers.includes(id)) return s; // already online
      return {
        onlineUsers: [...s.onlineUsers, id],
      };
    }),

  setOffline: (id: string) =>
    set((s) => ({
      onlineUsers: s.onlineUsers.filter((u) => u !== id),
    })),

  setTyping: (chatId, value) =>
    set((s) => ({
      typing: { ...s.typing, [chatId]: value },
    })),

  setInitialMessages: (chatId: string, msgs: any[]) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: msgs,
      },
    })),
}));
