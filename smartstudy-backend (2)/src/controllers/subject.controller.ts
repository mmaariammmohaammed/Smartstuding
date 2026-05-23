import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import Subject from '../models/Subject';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all subjects for user
// @route   GET /api/v1/subjects
// @access  Private
export const getSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const subjects = await Subject.find({ userId: req.user!._id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: { subjects },
  });
});

// @desc    Get single subject
// @route   GET /api/v1/subjects/:id
// @access  Private
export const getSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!subject) {
    throw new ApiError('Subject not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { subject },
  });
});

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private
export const createSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, color, icon, description, priority } = req.body;

  const subject = await Subject.create({
    userId: req.user!._id,
    name,
    color,
    icon,
    description,
    priority,
  });

  res.status(201).json({
    status: 'success',
    message: 'Subject created successfully',
    data: { subject },
  });
});

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private
export const updateSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let subject = await Subject.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!subject) {
    throw new ApiError('Subject not found', 404);
  }

  subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Subject updated successfully',
    data: { subject },
  });
});

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private
export const deleteSubject = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!subject) {
    throw new ApiError('Subject not found', 404);
  }

  await subject.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Subject deleted successfully',
  });
});
