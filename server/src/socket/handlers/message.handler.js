const handleSendMessage = (socket) => {
  socket.on("send_message", (message) => {
    const chatId = message.chatId;

    socket.to(chatId).emit("message_received", message);
  });
};

export { handleSendMessage };
