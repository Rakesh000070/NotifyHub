
/*
========================================================
USER MODEL
========================================================
Defines the structure of user documents stored in MongoDB.

Fields:
1. name
2. email
3. password
4. role
5. createdAt and updatedAt (automatic timestamps)
*/

const mongoose = require("mongoose");


// ======================================================
// USER SCHEMA
// ======================================================

const userSchema = new mongoose.Schema(
  {
    // User's display name.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // User's email address.
    // Mongoose converts it to lowercase and removes
    // surrounding whitespace.
    // The unique index prevents duplicate email addresses.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Store the hashed password, never the plain-text password.
    // Password hashing is handled by authController.js.
    password: {
      type: String,
      required: true,
    },

    // Account role, used for role-based authorization.
    // New accounts are regular users by default.
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    // Mongoose automatically manages these fields:
    // createdAt -> when the document was created
    // updatedAt -> when the document was last updated
    timestamps: true,
  }
);


// ======================================================
// EXPORT USER MODEL
// ======================================================

// Keep "user" because this is your existing registered model name.
// Notification.js must use ref: "user" to match this name.
module.exports =
  mongoose.models.user ||
  mongoose.model("user", userSchema);
