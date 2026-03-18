interface ChatState {
  messages: Record<string, any[]>;
  onlineUsers: string[];
  typing: Record<string, boolean>;
  currentChatId: string | null;
  selectedChatData: any | null;

  addMessage: (chatId: string, msg: any) => void;
  setOnline: (id: string) => void;
  setOffline: (id: string) => void;
  setTyping: (id: string, value: boolean) => void;
  setCurrentChat: (id: string | null) => void;
  setSelectedChatData: (data: any) => void;
  setInitialMessages: (chatId: string, msgs: any[]) => void;
}

export type { ChatState };
