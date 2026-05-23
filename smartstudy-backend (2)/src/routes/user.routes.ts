import express from 'express';
import {
  getUsers,
  getUser,
  updateProfile,
  deleteUser,
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, restrictTo('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/profile', protect, updateProfile);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

export default router;
