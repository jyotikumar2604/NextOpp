const Notification = require('../models/Notification');

// GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = { user: req.user._id };
    if (unread === 'true') filter.isRead = false;

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/:id
async function markRead(req, res, next) {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/mark-all-read
async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res, next) {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
