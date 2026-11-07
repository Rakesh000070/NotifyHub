
console.log("✅ authRoutes.js loaded");

// Import Express
const express = require("express");

// Import authentication controllers
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Import authentication middleware
const protect = require("../middleware/authMiddleware");

// Create Express Router
const router = express.Router();

// ======================================================
// TEST ROUTE
// GET /api/auth/test
// ======================================================

router.get("/test", (req, res) => {
  res.status(200).send("Auth Route Working");
});

// ======================================================
// REGISTER ROUTE
// POST /api/auth/register
// ======================================================

router.post("/register", registerUser);

// ======================================================
// LOGIN ROUTE
// POST /api/auth/login
// ======================================================

router.post("/login", loginUser);

// ======================================================
// PROTECTED PROFILE ROUTE
// GET /api/auth/profile
// Requires a valid authentication token
// ======================================================

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile accessed successfully",
    user: req.user,
  });
});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
