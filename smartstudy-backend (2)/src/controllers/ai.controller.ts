import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateStudyPlan, getStudyRecommendations, analyzeStudyHabits } from '../services/ai.service';

// @desc    Generate AI study plan
// @route   POST /api/v1/ai/generate-plan
// @access  Private
export const generateAIStudyPlan = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { subjects, hoursPerDay, startDate, endDate, preferences } = req.body;

  if (!subjects || !hoursPerDay) {
    throw new ApiError('Please provide subjects and hours per day', 400);
  }

  const plan = await generateStudyPlan({
    userId: req.user!._id.toString(),
    subjects,
    hoursPerDay,
    startDate,
    endDate,
    preferences,
  });

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

// @desc    Get AI study recommendations
// @route   POST /api/v1/ai/recommendations
// @access  Private
export const getAIRecommendations = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { currentSubjects, weakAreas, goals } = req.body;

  const recommendations = await getStudyRecommendations({
    userId: req.user!._id.toString(),
    currentSubjects,
    weakAreas,
    goals,
  });

  res.status(200).json({
    status: 'success',
    data: { recommendations },
  });
});

// @desc    Analyze study habits
// @route   POST /api/v1/ai/analyze-habits
// @access  Private
export const analyzeHabits = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const analysis = await analyzeStudyHabits(req.user!._id.toString());

  res.status(200).json({
    status: 'success',
    data: { analysis },
  });
});

// @desc    AI task prioritization
// @route   POST /api/v1/ai/prioritize-tasks
// @access  Private
export const prioritizeTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks)) {
    throw new ApiError('Please provide tasks array', 400);
  }

  // Simple AI prioritization algorithm
  const prioritized = tasks.map((task: any) => {
    let score = 0;

    // Priority weight
    const priorityWeights = { high: 30, medium: 20, low: 10 };
    score += priorityWeights[task.priority as keyof typeof priorityWeights] || 0;

    // Due date weight (closer = higher)
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) score += 40;
      else if (daysUntilDue <= 3) score += 30;
      else if (daysUntilDue <= 7) score += 20;
      else score += 10;
    }

    // Status weight
    if (task.status === 'pending') score += 15;
    else if (task.status === 'in_progress') score += 5;

    return { ...task, aiScore: score };
  });

  prioritized.sort((a: any, b: any) => b.aiScore - a.aiScore);

  res.status(200).json({
    status: 'success',
    data: { prioritizedTasks: prioritized },
  });
});
