import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import CalendarEvent from '../models/CalendarEvent';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

// @desc    Get all calendar events
// @route   GET /api/v1/calendar
// @access  Private
export const getEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { start, end, type } = req.query;

  const query: any = { userId: req.user!._id };

  if (start && end) {
    query.startDate = {
      $gte: new Date(start as string),
      $lte: new Date(end as string),
    };
  }

  if (type) query.type = type;

  const events = await CalendarEvent.find(query)
    .populate('subjectId', 'name color')
    .populate('taskId', 'title')
    .sort({ startDate: 1 });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: { events },
  });
});

// @desc    Get single event
// @route   GET /api/v1/calendar/:id
// @access  Private
export const getEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const event = await CalendarEvent.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  }).populate('subjectId', 'name color').populate('taskId', 'title');

  if (!event) {
    throw new ApiError('Event not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { event },
  });
});

// @desc    Create calendar event
// @route   POST /api/v1/calendar
// @access  Private
export const createEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, startDate, endDate, type, subjectId, taskId, color, isAllDay, recurrence, reminder } = req.body;

  const event = await CalendarEvent.create({
    userId: req.user!._id,
    title,
    description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type: type || 'study',
    subjectId,
    taskId,
    color,
    isAllDay: isAllDay || false,
    recurrence: recurrence || 'none',
    reminder: reminder || 0,
  });

  const populatedEvent = await CalendarEvent.findById(event._id)
    .populate('subjectId', 'name color')
    .populate('taskId', 'title');

  res.status(201).json({
    status: 'success',
    message: 'Event created successfully',
    data: { event: populatedEvent },
  });
});

// @desc    Update calendar event
// @route   PUT /api/v1/calendar/:id
// @access  Private
export const updateEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let event = await CalendarEvent.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!event) {
    throw new ApiError('Event not found', 404);
  }

  if (req.body.startDate) req.body.startDate = new Date(req.body.startDate);
  if (req.body.endDate) req.body.endDate = new Date(req.body.endDate);

  event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('subjectId', 'name color').populate('taskId', 'title');

  res.status(200).json({
    status: 'success',
    message: 'Event updated successfully',
    data: { event },
  });
});

// @desc    Delete calendar event
// @route   DELETE /api/v1/calendar/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const event = await CalendarEvent.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!event) {
    throw new ApiError('Event not found', 404);
  }

  await event.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Event deleted successfully',
  });
});

// @desc    Get events for a specific date range
// @route   GET /api/v1/calendar/range
// @access  Private
export const getEventsByRange = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { start, end } = req.query;

  if (!start || !end) {
    throw new ApiError('Please provide start and end dates', 400);
  }

  const events = await CalendarEvent.find({
    userId: req.user!._id,
    $or: [
      {
        startDate: { $gte: new Date(start as string), $lte: new Date(end as string) },
      },
      {
        endDate: { $gte: new Date(start as string), $lte: new Date(end as string) },
      },
      {
        startDate: { $lte: new Date(start as string) },
        endDate: { $gte: new Date(end as string) },
      },
    ],
  }).populate('subjectId', 'name color').sort({ startDate: 1 });

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: { events },
  });
});
