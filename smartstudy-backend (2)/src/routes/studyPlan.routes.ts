import express from 'express';
import {
  getStudyPlans,
  getStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  getActiveStudyPlan,
} from '../controllers/studyPlan.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getStudyPlans);
router.get('/active', protect, getActiveStudyPlan);
router.get('/:id', protect, getStudyPlan);
router.post('/', protect, createStudyPlan);
router.put('/:id', protect, updateStudyPlan);
router.delete('/:id', protect, deleteStudyPlan);

export default router;
