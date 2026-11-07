
/*
========================================================
NOTIFICATION MODEL
========================================================
This model defines the notification documents stored in MongoDB.

Features:
1. Each notification belongs to a user.
2. Notifications have a title, message, and type.
3. Notifications track whether they have been read.
4. requestId prevents duplicate creation when the same
   request is retried.
5. createdAt and updatedAt are managed automatically.
*/

const mongoose = require("mongoose");


// ======================================================
// NOTIFICATION SCHEMA
// ======================================================

const notificationSchema = new mongoose.Schema(
  {
    // ID of the user who owns this notification.
    // Must match the ID set by authentication middleware.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Short notification heading.
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Main notification content.
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Category of the notification.
    type: {
      type: String,
      default: "general",
      trim: true,
    },

    // False means unread; true means already read.
    isRead: {
      type: Boolean,
      default: false,
    },

    // Unique identifier for retrying the same request.
    // Optional for notifications created without a requestId.
    requestId: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    // Automatically create createdAt and updatedAt fields.
    timestamps: true,
  }
);


// ======================================================
// DATABASE INDEXES
// ======================================================

// Improve queries that retrieve a user's notifications
// in newest-first order.
notificationSchema.index({
  userId: 1,
  createdAt: -1,
});

// Allow a requestId to be used only once per user.
// Documents without a string requestId are excluded.
notificationSchema.index(
  {
    userId: 1,
    requestId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      requestId: { $type: "string" },
    },
  }
);


// ======================================================
// EXPORT MODEL
// ======================================================

// Reuse the registered model if it already exists.
module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
