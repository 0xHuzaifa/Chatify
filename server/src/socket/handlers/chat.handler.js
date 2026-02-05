import mongoose from "mongoose";
import Chat from "../../models/Chat.model.js";

const handleJoinChat = (io, socket) => {
  socket.on("join_chat", async (chatId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(chatId)) return;

      const chat = await Chat.findOne({
        _id: chatId,
        participants: socket.user._id,
      });

      if (!chat) return;

      socket.join(chatId);
      console.log(`User ${socket.user._id} joined chat ${chatId}`);

      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/e0429290-f5d4-452a-8343-37d170eac8ef",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "chat.handler.js:16",
            message: "Socket joined chat room",
            data: {
              chatId,
              socketId: socket.id,
              userId: socket.user._id?.toString(),
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "E",
          }),
        }
      ).catch(() => {});
      // #endregion
    } catch (err) {
      socket.emit("error", "Failed to join chat");
    }
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
  });
};

const handleTyping = (io, socket) => {
  socket.on("typing", async (chatId) => {
    if (!mongoose.Types.ObjectId.isValid(chatId)) return;

    const chat = await Chat.exists({
      _id: chatId,
      participants: socket.user._id,
    });

    if (!chat) return;

    socket.to(chatId).emit("typing", socket.user._id);
  });

  socket.on("stop_typing", async (chatId) => {
    if (!mongoose.Types.ObjectId.isValid(chatId)) return;

    const chat = await Chat.exists({
      _id: chatId,
      participants: socket.user._id,
    });

    if (!chat) return;

    socket.to(chatId).emit("stop_typing", socket.user._id);
  });
};

export { handleJoinChat, handleTyping };
