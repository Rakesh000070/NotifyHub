console.log("🚀 server.js is running");

const authRoutes = require("./routes/authRoutes");
console.log("✅ authRoutes imported");

// Import the Express framework.
// Express helps us build the backend server and create APIs.
const express = require("express");

// Import dotenv to load environment variables from the .env file.
const dotenv = require("dotenv");

// Import the MongoDB connection function.
const connectDB = require("./config/db");



// Load environment variables before using process.env.
dotenv.config();

// Connect to MongoDB Atlas.
connectDB();

// Create an Express application.
const app = express();

/*
  Middleware

  express.json()
  - Parses incoming JSON data.
  - Required when the client sends JSON in the request body.

  Example:
  {
    "name": "Rakesh",
    "email": "rakesh@gmail.com"
  }
*/
app.use(express.json());

/*
  Parses URL-encoded form data.

  Used when data comes from HTML forms.

  extended: true
  - Allows nested objects in form data.
  - Recommended for most applications.
*/
app.use(express.urlencoded({ extended: true }));

// Read the server port from the .env file.
// If PORT is not defined, use 5000 as the default.
const PORT = process.env.PORT || 5000;

/*
  Home Route

  URL:
  GET http://localhost:5000/

  Used to verify that the backend server is running.
*/
app.get("/", (req, res) => {
  res.send("Welcome to NotifyHub Backend 🚀");
});

/*
  Authentication Routes

  Base URL:
  /api/auth

  Examples:

  POST /api/auth/register
  POST /api/auth/login

  All authentication-related routes are managed in authRoutes.js.
*/
app.use("/api/auth", authRoutes);

// Start the Express server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});