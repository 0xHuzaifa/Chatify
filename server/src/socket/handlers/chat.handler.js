const handleJoinChat = (socket) => {
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.user._id} joined chat ${chatId}`);
  });
};

const handleTyping = (socket) => {
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing", socket.user._id);
  });

  socket.on("stop_typing", (chatId) => {
    socket.to(chatId).emit("stop_typing", socket.user._id);
  });
};

export { handleJoinChat, handleTyping };
