import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import User from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Admin
export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { firstName, lastName, avatar, language, timezone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      firstName,
      lastName,
      avatar,
      language,
      timezone,
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user },
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  await user.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});
