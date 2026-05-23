import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import Task from '../models/Task';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all tasks for user
// @route   GET /api/v1/tasks
// @access  Private
export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { status, priority, subjectId, search } = req.query;

  const query: any = { userId: req.user!._id };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (subjectId) query.subjectId = subjectId;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tasks = await Task.find(query)
    .populate('subjectId', 'name color')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: { tasks },
  });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  }).populate('subjectId', 'name color');

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { task },
  });
});

// @desc    Create task
// @route   POST /api/v1/tasks
// @access  Private
export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, subjectId, status, priority, dueDate, estimatedTime, tags } = req.body;

  const task = await Task.create({
    userId: req.user!._id,
    title,
    description,
    subjectId,
    status: status || 'pending',
    priority: priority || 'medium',
    dueDate,
    estimatedTime,
    tags,
  });

  const populatedTask = await Task.findById(task._id).populate('subjectId', 'name color');

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
    data: { task: populatedTask },
  });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let task = await Task.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('subjectId', 'name color');

  res.status(200).json({
    status: 'success',
    message: 'Task updated successfully',
    data: { task },
  });
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!task) {
    throw new ApiError('Task not found', 404);
  }

  await task.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
  });
});

// @desc    Get task statistics
// @route   GET /api/v1/tasks/stats
// @access  Private
export const getTaskStats = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const stats = await Task.aggregate([
    { $match: { userId: req.user!._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Task.aggregate([
    { $match: { userId: req.user!._id } },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statusStats: stats,
      priorityStats,
    },
  });
});
