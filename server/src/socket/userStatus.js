const onlineUsers = new Map(); // userId -> Set(socketId)

const trackOnlineUsers = (io, socket) => {
  const userId = socket.user._id.toString();

  // 🔑 JOIN USER ROOM
  socket.join(userId);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());

    // 🔔 notify others (NOT the user)
    socket.broadcast.emit("user_online", userId);
  }

  onlineUsers.get(userId).add(socket.id);

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);
    userSockets.delete(socket.id);

    if (userSockets.size === 0) {
      onlineUsers.delete(userId);

      // 🔔 notify others
      socket.broadcast.emit("user_offline", userId);
    }
  });
};

export default trackOnlineUsers;

export const isUserOnline = (userId) => onlineUsers.has(userId);
