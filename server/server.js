
console.log("🚀 server.js is running");

// Import dependencies
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");

// Import database connection
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Load environment variables before initializing the app
dotenv.config();

// Create Express application and HTTP server
const app = express();
const server = http.createServer(app);

// Shared CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

// Make Socket.IO available to controllers
app.set("io", io);

// Express middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

// Home route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to NotifyHub Backend 🚀");
});

// Socket.IO JWT authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");
      return next(new Error("Server authentication configuration error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return next(new Error("Invalid token payload"));
    }

    socket.userId = String(decoded.id);
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Invalid or expired token"));
  }
});

// Handle authenticated Socket.IO connections
io.on("connection", (socket) => {
  console.log("✅ Authenticated client connected:", socket.id);

  // Each user joins their own private room
  socket.join(socket.userId);

  console.log("User joined private room:", socket.userId);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from the .env file");
    }

    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log("✅ Socket.IO is ready");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
