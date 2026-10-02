// Import Notification model
const Notification = require("../models/Notification");

// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;

        // Create notification for logged-in user
        const notification = await Notification.create({
            userId: req.user.id,
            title,
            message,
            type,
        });

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

const getUserNotifications = async (req, res) => {
    try {
        // Find notifications belonging to logged-in user
        const notifications = await Notification.find({
            userId: req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Export controllers
module.exports = {
    createNotification,
    getUserNotifications,
};