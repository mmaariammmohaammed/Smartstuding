import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Not found - ${req.originalUrl}`, 404));
};
