const Notification = require("../models/Notification");
const ser = require("../utils/serialize");

async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ notifications: ser(notifications) });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.sub },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification: ser(notification) });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const result = await Notification.updateMany({ recipient: req.user.sub, isRead: false }, { $set: { isRead: true } });
    res.json({ message: "All notifications marked as read", modified: result.modifiedCount });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotifications, markRead, markAllRead };
