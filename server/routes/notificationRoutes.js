// Import Express
const express = require("express");

// Create router
const router = express.Router();

// Import authentication middleware
const protect = require("../middleware/authMiddleware");

// Import notification controllers
const {
    createNotification,
    getUserNotifications,
} = require("../controllers/notificationController");


// ======================================================
// CREATE NOTIFICATION
// ======================================================

router.post(
    "/",
    protect,
    createNotification
);


// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

router.get(
    "/",
    protect,
    getUserNotifications
);


// Export router
module.exports = router;