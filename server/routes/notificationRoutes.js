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
    markNotificationAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} = require("../controllers/notificationController");


// ======================================================
// CREATE NOTIFICATION
// POST /api/notifications
// Creates a notification for the logged-in user
// ======================================================
router.post("/", protect, createNotification);


// ======================================================
// GET USER NOTIFICATIONS
// GET /api/notifications
// Retrieves notifications belonging to the logged-in user
// ======================================================
router.get("/", protect, getUserNotifications);


// ======================================================
// MARK NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// Marks the specified notification as read
// ======================================================
router.patch("/:id/read", protect, markNotificationAsRead);


// ======================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// Deletes a notification belonging to the logged-in user
// ======================================================
router.delete("/:id", protect, deleteNotification);

// ======================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// Returns the number of unread notifications
// belonging to the logged-in user
// ======================================================
router.get("/unread-count", protect, getUnreadNotificationCount);

// ======================================================
// EXPORT ROUTER
// Makes these routes available to server.js
// ======================================================

module.exports = router;