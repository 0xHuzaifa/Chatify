const onlineUsers = new Map(); // userId -> Set(socketId)

const trackOnlineUsers = (io, socket) => {
  const userId = socket.user._id.toString();

  // 🔑 JOIN USER ROOM
  socket.join(userId);

  // Send initial list of all online users to the newly connected client
  const allOnlineUsers = Array.from(onlineUsers.keys());
  socket.emit("online_users", allOnlineUsers);

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
export const getOnlineUsers = () => Array.from(onlineUsers.keys());
export const getUserSocketIds = (userId) =>
  Array.from(onlineUsers.get(String(userId)) || []);
