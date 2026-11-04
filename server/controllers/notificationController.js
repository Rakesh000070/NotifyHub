// Import Notification model
const Notification = require("../models/Notification");

// ======================================================
// CREATE NOTIFICATION
// ======================================================
const createNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;

        // Validate required fields
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required",
            });
        }

        const notification = await Notification.create({
            userId: req.user.id,
            title: title.trim(),
            message: message.trim(),
            type,
        });

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification,
        });

    } catch (error) {
        console.error("Create notification error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
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
// ======================================================
// MARK NOTIFICATION AS READ
// ======================================================

const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id,
            },
            {
                isRead: true,
            },
            {
                new: true,
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
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
// DELETE NOTIFICATION
// ======================================================

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ======================================================
// GET UNREAD NOTIFICATION COUNT
// ======================================================

const getUnreadNotificationCount = async (req, res) => {
    try {
        // Count unread notifications belonging to the logged-in user
        const count = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            unreadCount: count,
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
    markNotificationAsRead,
    deleteNotification,
    getUnreadNotificationCount
};