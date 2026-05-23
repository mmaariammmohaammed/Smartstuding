import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import Analytics from '../models/Analytics';
import PomodoroSession from '../models/PomodoroSession';
import Task from '../models/Task';
import { asyncHandler } from '../utils/asyncHandler';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

// @desc    Get dashboard analytics
// @route   GET /api/v1/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Today's stats
  const todayStats = await Analytics.findOne({
    userId,
    date: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    },
  });

  // Weekly stats
  const weeklyStats = await Analytics.aggregate([
    {
      $match: {
        userId,
        date: { $gte: weekStart, $lte: weekEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalStudyTime: { $sum: '$studyTime' },
        totalTasksCompleted: { $sum: '$tasksCompleted' },
        totalPomodoroSessions: { $sum: '$pomodoroSessions' },
        avgStreak: { $avg: '$streakDays' },
      },
    },
  ]);

  // Monthly stats
  const monthlyStats = await Analytics.aggregate([
    {
      $match: {
        userId,
        date: { $gte: monthStart, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalStudyTime: { $sum: '$studyTime' },
        totalTasksCompleted: { $sum: '$tasksCompleted' },
        totalPomodoroSessions: { $sum: '$pomodoroSessions' },
      },
    },
  ]);

  // Task completion rate
  const totalTasks = await Task.countDocuments({ userId });
  const completedTasks = await Task.countDocuments({ userId, status: 'completed' });
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total pomodoro time
  const pomodoroStats = await PomodoroSession.aggregate([
    { $match: { userId, completed: true } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
      },
    },
  ]);

  // Daily activity for the last 7 days
  const last7Days = subDays(today, 6);
  const dailyActivity = await Analytics.find({
    userId,
    date: { $gte: last7Days },
  }).sort({ date: 1 }).select('date studyTime tasksCompleted pomodoroSessions');

  res.status(200).json({
    status: 'success',
    data: {
      today: {
        studyTime: todayStats?.studyTime || 0,
        tasksCompleted: todayStats?.tasksCompleted || 0,
        pomodoroSessions: todayStats?.pomodoroSessions || 0,
        streakDays: todayStats?.streakDays || 0,
      },
      weekly: weeklyStats[0] || {
        totalStudyTime: 0,
        totalTasksCompleted: 0,
        totalPomodoroSessions: 0,
        avgStreak: 0,
      },
      monthly: monthlyStats[0] || {
        totalStudyTime: 0,
        totalTasksCompleted: 0,
        totalPomodoroSessions: 0,
      },
      completionRate,
      totalTasks,
      completedTasks,
      pomodoro: pomodoroStats[0] || {
        totalSessions: 0,
        totalMinutes: 0,
      },
      dailyActivity,
    },
  });
});

// @desc    Get study time analytics
// @route   GET /api/v1/analytics/study-time
// @access  Private
export const getStudyTimeAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const { period = 'week' } = req.query;

  let startDate: Date;
  const today = new Date();

  switch (period) {
    case 'week':
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(today);
      break;
    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      startDate = startOfWeek(today, { weekStartsOn: 1 });
  }

  const analytics = await Analytics.find({
    userId,
    date: { $gte: startDate },
  }).sort({ date: 1 });

  res.status(200).json({
    status: 'success',
    data: { analytics },
  });
});

// @desc    Record daily analytics
// @route   POST /api/v1/analytics/record
// @access  Private
export const recordAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  const { studyTime, tasksCompleted, pomodoroSessions, subjectsStudied } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let analytics = await Analytics.findOne({
    userId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (analytics) {
    analytics.studyTime += studyTime || 0;
    analytics.tasksCompleted += tasksCompleted || 0;
    analytics.pomodoroSessions += pomodoroSessions || 0;
    if (subjectsStudied) {
      analytics.subjectsStudied = [...new Set([...analytics.subjectsStudied, ...subjectsStudied])];
    }
    await analytics.save();
  } else {
    // Calculate streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayAnalytics = await Analytics.findOne({
      userId,
      date: {
        $gte: yesterday,
        $lt: today,
      },
    });

    const streakDays = yesterdayAnalytics ? yesterdayAnalytics.streakDays + 1 : 1;

    analytics = await Analytics.create({
      userId,
      date: today,
      studyTime: studyTime || 0,
      tasksCompleted: tasksCompleted || 0,
      pomodoroSessions: pomodoroSessions || 0,
      subjectsStudied: subjectsStudied || [],
      streakDays,
    });
  }

  res.status(200).json({
    status: 'success',
    data: { analytics },
  });
});
