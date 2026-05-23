import express from 'express';
import {
  getSessions,
  getTodaySessions,
  startSession,
  completeSession,
  updateSession,
  deleteSession,
  getStats,
} from '../controllers/pomodoro.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getSessions);
router.get('/today', protect, getTodaySessions);
router.get('/stats', protect, getStats);
router.post('/', protect, startSession);
router.put('/:id', protect, updateSession);
router.put('/:id/complete', protect, completeSession);
router.delete('/:id', protect, deleteSession);

export default router;
