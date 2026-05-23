import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/task.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getTasks);
router.get('/stats', protect, getTaskStats);
router.get('/:id', protect, getTask);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

export default router;
