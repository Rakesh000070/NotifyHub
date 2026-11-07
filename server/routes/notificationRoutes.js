
const express = require("express");
const router = express.Router();

// Authentication middleware
const protect = require("../middleware/authMiddleware");

// Notification controllers
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} = require("../controllers/notificationController");

// POST /api/notifications
// Create a notification for the authenticated user
router.post("/", protect, createNotification);

// GET /api/notifications
// Get notifications belonging to the authenticated user
router.get("/", protect, getUserNotifications);

// PATCH /api/notifications/:id/read
// Mark a notification as read
router.patch("/:id/read", protect, markNotificationAsRead);

// DELETE /api/notifications/:id
// Delete a notification
router.delete("/:id", protect, deleteNotification);

// GET /api/notifications/unread-count
// Get the unread notification count
router.get("/unread-count", protect, getUnreadNotificationCount);

// Export the router
module.exports = router;
