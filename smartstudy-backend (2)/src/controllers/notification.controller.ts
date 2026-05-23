import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import Notification from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all notifications
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { unreadOnly } = req.query;

  const query: any = { userId: req.user!._id };
  if (unreadOnly === 'true') query.read = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user!._id,
    read: false,
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications, unreadCount },
  });
});

// @desc    Get single notification
// @route   GET /api/v1/notifications/:id
// @access  Private
export const getNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { notification },
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
    data: { notification },
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await Notification.updateMany(
    { userId: req.user!._id, read: false },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  await notification.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted',
  });
});

// @desc    Create notification (internal use)
// @access  Private
export const createNotification = async ({
  userId,
  title,
  message,
  type,
  actionUrl,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
}) => {
  return await Notification.create({
    userId,
    title,
    message,
    type,
    actionUrl,
  });
};
