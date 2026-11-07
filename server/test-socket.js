
const { io } = require("socket.io-client");

// Paste a valid JWT token obtained from your login API response.
const token = "PASTE_YOUR_LOGIN_TOKEN_HERE";

const socket = io("http://localhost:5000", {
  auth: {
    token: token,
  },
  reconnection: false,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server!");
  console.log("Socket ID:", socket.id);

  // Disconnect after successful connection.
  socket.disconnect();
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection failed:", error.message);
  process.exitCode = 1;
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
  process.exit();
});
