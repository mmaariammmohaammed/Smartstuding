import express from 'express';
import {
  generateAIStudyPlan,
  getAIRecommendations,
  analyzeHabits,
  prioritizeTasks,
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/generate-plan', protect, generateAIStudyPlan);
router.post('/recommendations', protect, getAIRecommendations);
router.post('/analyze-habits', protect, analyzeHabits);
router.post('/prioritize-tasks', protect, prioritizeTasks);

export default router;
