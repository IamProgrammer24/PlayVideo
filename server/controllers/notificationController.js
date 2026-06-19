import Notification from "../models/notificationModel.js";
import User from "../models/User.js";

// ─── GET MY NOTIFICATIONS ───
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── MARK ONE AS READ ───
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── MARK ALL AS READ ───
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── HELPER — Create notification (used internally by other controllers) ───
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
}) => {
  try {
    await Notification.create({ userId, type, title, message, link });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

// ─── HELPER — Notify all admins ───
export const notifyAllAdmins = async ({ type, title, message, link }) => {
  try {
    const admins = await User.find({ isAdmin: true }).select("_id");
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      type,
      title,
      message,
      link,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Failed to notify admins:", error.message);
  }
};
