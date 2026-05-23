import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import StudyPlan from '../models/StudyPlan';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all study plans
// @route   GET /api/v1/study-plans
// @access  Private
export const getStudyPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const studyPlans = await StudyPlan.find({ userId: req.user!._id })
    .populate('subjects.subjectId', 'name color')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: studyPlans.length,
    data: { studyPlans },
  });
});

// @desc    Get single study plan
// @route   GET /api/v1/study-plans/:id
// @access  Private
export const getStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const studyPlan = await StudyPlan.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  }).populate('subjects.subjectId', 'name color');

  if (!studyPlan) {
    throw new ApiError('Study plan not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { studyPlan },
  });
});

// @desc    Create study plan
// @route   POST /api/v1/study-plans
// @access  Private
export const createStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, subjects, schedule, startDate, endDate, aiGenerated } = req.body;

  // Deactivate other plans if this one is active
  if (req.body.isActive) {
    await StudyPlan.updateMany(
      { userId: req.user!._id },
      { isActive: false }
    );
  }

  const studyPlan = await StudyPlan.create({
    userId: req.user!._id,
    title,
    description,
    subjects,
    schedule,
    startDate,
    endDate,
    isActive: req.body.isActive || false,
    aiGenerated: aiGenerated || false,
  });

  const populatedPlan = await StudyPlan.findById(studyPlan._id)
    .populate('subjects.subjectId', 'name color');

  res.status(201).json({
    status: 'success',
    message: 'Study plan created successfully',
    data: { studyPlan: populatedPlan },
  });
});

// @desc    Update study plan
// @route   PUT /api/v1/study-plans/:id
// @access  Private
export const updateStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let studyPlan = await StudyPlan.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!studyPlan) {
    throw new ApiError('Study plan not found', 404);
  }

  // Deactivate other plans if activating this one
  if (req.body.isActive && !studyPlan.isActive) {
    await StudyPlan.updateMany(
      { userId: req.user!._id, _id: { $ne: req.params.id } },
      { isActive: false }
    );
  }

  studyPlan = await StudyPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('subjects.subjectId', 'name color');

  res.status(200).json({
    status: 'success',
    message: 'Study plan updated successfully',
    data: { studyPlan },
  });
});

// @desc    Delete study plan
// @route   DELETE /api/v1/study-plans/:id
// @access  Private
export const deleteStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const studyPlan = await StudyPlan.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!studyPlan) {
    throw new ApiError('Study plan not found', 404);
  }

  await studyPlan.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Study plan deleted successfully',
  });
});

// @desc    Get active study plan
// @route   GET /api/v1/study-plans/active
// @access  Private
export const getActiveStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const studyPlan = await StudyPlan.findOne({
    userId: req.user!._id,
    isActive: true,
  }).populate('subjects.subjectId', 'name color');

  res.status(200).json({
    status: 'success',
    data: { studyPlan },
  });
});
