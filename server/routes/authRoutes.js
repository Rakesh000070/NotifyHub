
console.log("✅ authRoutes.js loaded");

// Import Express
const express = require("express");

// Create Express Router
const router = express.Router();

// ======================================================
// TEST ROUTE
// ======================================================

router.get("/test", (req, res) => {
  res.send("Auth Route Working");
});


// ======================================================
// IMPORT AUTH CONTROLLERS
// ======================================================

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");


// ======================================================
// REGISTER ROUTE
// ======================================================

// POST /api/auth/register
router.post("/register", registerUser);


// ======================================================
// LOGIN ROUTE
// ======================================================

// POST /api/auth/login
router.post("/login", loginUser);

const protect = require("../middleware/authMiddleware");

// PROTECTED PROFILE ROUTE
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Profile accessed successfully",
        user: req.user,
    });
});

// Export router
module.exports = router;