import express from "express";
import cookiesParser from "cookie-parser";

// Middlewares
import errorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(cookiesParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------------------------------------------------------- */

// Routes
import authRoutes from "./routes/auth.routes.js";

// Use Routes
app.use("/api/auth", authRoutes);

/* ---------------------------------------------------------------------------------------------- */

// Error Handler Middleware
app.use(errorHandler);

export default app;
