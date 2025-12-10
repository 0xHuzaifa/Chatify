import { Server } from "socket.io";
import chatEvents from "./events/chat.event.js";
import messageEvents from "./events/message.event.js";
import trackOnlineUsers from "./userStatus.js";
import socketAuth from "./socketAuth.js";

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", (io, socket) => {
    trackOnlineUsers(io, socket);

    chatEvents(io, socket);

    messageEvents(io, socket);
  });

  return io;
};

export default initSocket;
