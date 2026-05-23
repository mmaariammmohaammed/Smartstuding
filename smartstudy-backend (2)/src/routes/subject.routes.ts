import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subject.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getSubjects);
router.get('/:id', protect, getSubject);
router.post('/', protect, createSubject);
router.put('/:id', protect, updateSubject);
router.delete('/:id', protect, deleteSubject);

export default router;
