const onlineUsers = new Map();

const trackOnlineUsers = (io, socket) => {
  onlineUsers.set(socket.id, socket.user._id);
  io.emit("user_online", socket.user._id);

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("user_offline", socket.user._id);
  });
};

export default trackOnlineUsers;
