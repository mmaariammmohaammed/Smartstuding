import express from 'express';
import {
  getDashboardAnalytics,
  getStudyTimeAnalytics,
  recordAnalytics,
} from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/study-time', protect, getStudyTimeAnalytics);
router.post('/record', protect, recordAnalytics);

export default router;
