import express from "express";
import cookiesParser from "cookie-parser";

// Middlewares
import errorHandler from "./middlewares/errorHandler.middleware.js";
import authentication from "./middlewares/auth.middleware.js";

// Config
import corsMiddleware from "./config/cors.config.js";

const app = express();

app.use(corsMiddleware);
app.use(cookiesParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------------------------------------------------------- */

// Routes
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";

// Use Routes
app.use("/api/auth", authRoutes);

app.use(authentication);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

/* ---------------------------------------------------------------------------------------------- */

// Error Handler Middleware
app.use(errorHandler);

export default app;
