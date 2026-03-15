import { useChatStore } from "@/store/chat.store";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Helper to extract base URL (protocol + host + port) from API URL
// Socket.io doesn't use paths - it connects to root namespace "/"
const getSocketBaseURL = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const url = new URL(apiUrl);
    // Return only protocol + hostname + port (no path)
    return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
  } catch {
    // Fallback if URL parsing fails
    return apiUrl.replace(/\/api.*$/, "").replace(/\/$/, "");
  }
};

export const connectSocket = () => {
  if (socket?.connected) return socket;

  // Disconnect existing socket if reconnecting
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const baseURL = getSocketBaseURL();
  console.log("Connecting socket to:", baseURL);

  // Cookies are sent automatically with withCredentials: true
  // Server will read accessToken from cookies
  socket = io(baseURL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);

    const currentChat = useChatStore.getState().currentChatId;

    if (currentChat) {
      socket?.emit("join_chat", currentChat);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    console.error("Error details:", {
      message: error.message,
      cause: error.cause,
    });
  });

  return socket;
};

export const getSocket = () => socket;

export const isSocketConnected = () => socket?.connected ?? false;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
