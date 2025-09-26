import mongoose, { set } from "mongoose";

// Connection options for production
const mongoOptions = {
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30s of inactivity

  // Timeout settings
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long to wait for a response
  connectTimeoutMS: 10000, // How long to wait for initial connection

  // Retry settings
  retryWrites: true,
  retryReads: true,

  // Compression
  compressors: ["zlib"],

  // Authentication & Security
  authSource: "admin",

  // Additional modern options
  heartbeatFrequencyMS: 10000, // How often to check server health
  family: 4, // Use IPv4, skip trying IPv6
};

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempt = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    if (this.isConnected) {
      console.log("MongoDB already connected");
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Connecting to MongoDB...");
    try {
      await mongoose.connect(process.env.MONGO_URI, mongoOptions);

      this.isConnected = true;
      this.connectionAttempt = 0;

      console.log(
        `MongoDB connected successfully to: ${mongoose.connection.host}`
      );
      console.log(`Database: ${mongoose.connection.name}`);

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      this.connectionAttempt++;
      console.error(
        `MongoDB connection attempt ${this.connectionAttempt} failed:`,
        error.message
      );

      if (this.connectionAttempt < this.maxRetries) {
        console.log(
          `Retrying connection in ${this.retryDelay / 1000} seconds...`
        );
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        console.error("Max connection attempts reached. Giving up.");
        process.exit(1); // Exit the process with failure
      }
    }
  }

  setupEventListeners() {
    const db = mongoose.connection;

    db.on("connected", () => {
      console.log("MongoDB event: connected");
      this.isConnected = true;
    });

    db.on("error", (error) => {
      console.error("MongoDB event: error", error);
      this.isConnected = false;
    });

    db.on("reconnected", () => {
      console.log("MongoDB event: reconnected");
      this.isConnected = true;
    });

    db.on("disconnected", () => {
      console.warn("MongoDB event: disconnected");
      this.isConnected = false;

      if (!this.isShuttingDown) {
        console.log("Attempting to reconnect to MongoDB...");
        setTimeout(() => this.connect(), this.retryDelay);
      }
    });

    // // Monitoring connection pool
    db.on("fullsetup", () => {
      console.log("MongoDB replica set connected");
    });
  }

  async disconnect() {
    if (!this.isConnected) {
      console.log("MongoDB not connected");
      return;
    }

    try {
      this.isShuttingDown = true;
      await mongoose.disconnect();
      console.log("MongoDB disconnected successfully");
      this.isConnected = false;
    } catch (error) {
      console.error("Error during MongoDB disconnection:", error);
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();
      return { status: "healthy", ping: result };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

const dbConnection = new DatabaseConnection();

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await dbConnection.disconnect();
    console.log("Database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle different termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // nodemon restart

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

export default dbConnection;
