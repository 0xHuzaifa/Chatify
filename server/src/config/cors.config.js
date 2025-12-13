// config/cors.config.js
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5005",
  "http://localhost:3000",
  "http://127.0.0.1:5005",
  "http://127.0.0.1:3000",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development, allow localhost ports dynamically
    if (process.env.NODE_ENV !== "production") {
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }
    }

    console.log("Blocked CORS origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // This is critical
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"], // Optional, helps debugging
  optionsSuccessStatus: 204,
};

export default cors(corsOptions);
