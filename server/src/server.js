import dotenv from "dotenv";
dotenv.config();

// Database
import dbConnection from "./database/db.js";

// Import the configured app (middlewares & routes)
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const serverStart = async () => {
  try {
    await dbConnection.connect();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown for server
    const gracefulShutdown = () => {
      console.log("Shutting down server gracefully...");
      server.close(async () => {
        console.log("HTTP server closed");
        await dbConnection.disconnect();
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

serverStart();
