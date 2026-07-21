console.log("✅ authRoutes.js loaded");

// Import the Express framework.
// Express helps us create routes and build the backend server.
const express = require("express");

// Create a new Router object.
// A Router lets us organize related API routes into separate files.
const router = express.Router();


router.get("/test", (req, res) => {
  res.send("Auth Route Working");
});

// Import the registerUser controller.
// This function contains the logic for registering a new user.
const { registerUser } = require("../controllers/authController");

// Create a POST API endpoint for user registration.
//
// When the client sends:
// POST /api/auth/register
//
// Express will execute the registerUser controller.
router.post("/register", registerUser);

// Export this router so it can be imported into server.js.
module.exports = router;