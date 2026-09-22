const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    return res.status(200).json(
      new ApiResponse(
        200,
        { notifications, unreadCount },
        'Notifications fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new ApiError(404, 'Notification not found or unauthorized'));
    }

    return res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, user: req.user._id });

    if (!notification) {
      return next(new ApiError(404, 'Notification not found or unauthorized'));
    }

    return res.status(200).json(new ApiResponse(200, null, 'Notification deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
