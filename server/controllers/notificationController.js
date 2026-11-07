
/*
========================================================
NOTIFICATION CONTROLLER
========================================================
Handles:
1. Creating notifications
2. Fetching the logged-in user's notifications
3. Marking notifications as read
4. Deleting notifications
5. Counting unread notifications
6. Synchronizing notification changes in real time
*/

const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification = async (req, res) => {
  try {
    const { title, message, type, requestId } = req.body || {};
    const userId = req.user?.id;

    // Ensure the user is authenticated.
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Validate the notification title and message.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    // Validate requestId when provided.
    if (
      requestId !== undefined &&
      (typeof requestId !== "string" || !requestId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid requestId.",
      });
    }

    // Validate notification type when provided.
    if (
      type !== undefined &&
      (typeof type !== "string" || !type.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type.",
      });
    }

    const normalizedRequestId = requestId?.trim();

    // Return the existing notification for a repeated request.
    if (normalizedRequestId) {
      const existingNotification = await Notification.findOne({
        userId,
        requestId: normalizedRequestId,
      });

      if (existingNotification) {
        return res.status(200).json({
          success: true,
          message: "Notification already created.",
          notification: existingNotification,
        });
      }
    }

    let notification;

    try {
      // Save the new notification in MongoDB.
      notification = await Notification.create({
        userId,
        title: title.trim(),
        message: message.trim(),
        type: type?.trim() || "general",
        ...(normalizedRequestId
          ? { requestId: normalizedRequestId }
          : {}),
      });
    } catch (error) {
      // Handle simultaneous requests with the same requestId.
      if (error.code === 11000 && normalizedRequestId) {
        const existingNotification = await Notification.findOne({
          userId,
          requestId: normalizedRequestId,
        });

        if (existingNotification) {
          return res.status(200).json({
            success: true,
            message: "Notification already created.",
            notification: existingNotification,
          });
        }
      }

      throw error;
    }

    // Emit the new notification to the user's private room.
    const io = req.app.get("io");

    if (io) {
      io.to(String(notification.userId)).emit(
        "newNotification",
        notification
      );
    }

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create notification.",
    });
  }
};

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Fetch only notifications belonging to the logged-in user.
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve notifications.",
    });
  }
};

// ======================================================
// MARK NOTIFICATION AS READ
// ======================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Validate the MongoDB document ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    // Update only a notification owned by the logged-in user.
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // Notify all connected tabs belonging to this user.
    const io = req.app.get("io");

    if (io) {
      io.to(String(notification.userId)).emit(
        "notificationUpdated",
        {
          notificationId: String(notification._id),
          isRead: true,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};

// ======================================================
// DELETE NOTIFICATION
// ======================================================

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Validate the MongoDB document ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    // Delete only a notification owned by the logged-in user.
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // Notify all connected tabs belonging to this user.
    const io = req.app.get("io");

    if (io) {
      io.to(String(notification.userId)).emit(
        "notificationDeleted",
        {
          notificationId: String(notification._id),
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
      id: notification._id,
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete notification.",
    });
  }
};

// ======================================================
// GET UNREAD NOTIFICATION COUNT
// ======================================================

const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Count unread notifications belonging to the logged-in user.
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Unread notification count error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve unread count.",
    });
  }
};

// ======================================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ======================================================

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  getUnreadNotificationCount,
};
