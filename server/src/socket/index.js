import { Server } from "socket.io";
import chatEvents from "./events/chat.event.js";
import messageEvents from "./events/message.event.js";
import trackOnlineUsers from "./userStatus.js";
import socketAuth from "./socketAuth.js";

const initSocket = (server) => {
  // CORS configuration matching Express CORS config
  const allowedOrigins = [
    "http://localhost:5005",
    "http://localhost:3000",
    "http://127.0.0.1:5005",
    "http://127.0.0.1:3000",
  ];

  if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
  }

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow non-browser requests (no origin header)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // In development, allow any localhost origin
        if (process.env.NODE_ENV !== "production") {
          const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+/.test(
            origin
          );
          if (isLocalhost) {
            return callback(null, true);
          }
        }

        console.log("Blocked Socket.io CORS origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true, // Required for cookies (withCredentials: true on client)
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
    allowEIO3: true, // Allow Engine.IO v3 clients (for compatibility)
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    trackOnlineUsers(io, socket);
    chatEvents(io, socket);
    messageEvents(io, socket);
  });

  return io;
};

export default initSocket;
