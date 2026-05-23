import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import PomodoroSession from '../models/PomodoroSession';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all pomodoro sessions
// @route   GET /api/v1/pomodoro
// @access  Private
export const getSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessions = await PomodoroSession.find({ userId: req.user!._id })
    .populate('taskId', 'title')
    .populate('subjectId', 'name color')
    .sort({ startedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: sessions.length,
    data: { sessions },
  });
});

// @desc    Get today's sessions
// @route   GET /api/v1/pomodoro/today
// @access  Private
export const getTodaySessions = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessions = await PomodoroSession.find({
    userId: req.user!._id,
    startedAt: { $gte: today, $lt: tomorrow },
  }).sort({ startedAt: -1 });

  const totalMinutes = sessions.reduce((acc, session) => {
    return acc + (session.completed ? session.duration : 0);
  }, 0);

  res.status(200).json({
    status: 'success',
    data: {
      sessions,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      totalMinutes,
    },
  });
});

// @desc    Start pomodoro session
// @route   POST /api/v1/pomodoro
// @access  Private
export const startSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { taskId, subjectId, duration, breakDuration, notes } = req.body;

  const session = await PomodoroSession.create({
    userId: req.user!._id,
    taskId,
    subjectId,
    duration: duration || 25,
    breakDuration: breakDuration || 5,
    notes,
    startedAt: new Date(),
  });

  res.status(201).json({
    status: 'success',
    message: 'Pomodoro session started',
    data: { session },
  });
});

// @desc    Complete pomodoro session
// @route   PUT /api/v1/pomodoro/:id/complete
// @access  Private
export const completeSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const session = await PomodoroSession.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!session) {
    throw new ApiError('Session not found', 404);
  }

  session.completed = true;
  session.completedAt = new Date();
  await session.save();

  res.status(200).json({
    status: 'success',
    message: 'Session completed',
    data: { session },
  });
});

// @desc    Update pomodoro session
// @route   PUT /api/v1/pomodoro/:id
// @access  Private
export const updateSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const session = await PomodoroSession.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!session) {
    throw new ApiError('Session not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { session },
  });
});

// @desc    Delete pomodoro session
// @route   DELETE /api/v1/pomodoro/:id
// @access  Private
export const deleteSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const session = await PomodoroSession.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!session) {
    throw new ApiError('Session not found', 404);
  }

  await session.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Session deleted',
  });
});

// @desc    Get pomodoro statistics
// @route   GET /api/v1/pomodoro/stats
// @access  Private
export const getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  const stats = await PomodoroSession.aggregate([
    { $match: { userId, completed: true } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
      },
    },
  ]);

  const weeklyStats = await PomodoroSession.aggregate([
    {
      $match: {
        userId,
        completed: true,
        startedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        sessions: { $sum: 1 },
        minutes: { $sum: '$duration' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overall: stats[0] || { totalSessions: 0, totalMinutes: 0, avgDuration: 0 },
      weekly: weeklyStats,
    },
  });
});
