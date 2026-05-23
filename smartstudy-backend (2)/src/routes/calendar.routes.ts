import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByRange,
} from '../controllers/calendar.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getEvents);
router.get('/range', protect, getEventsByRange);
router.get('/:id', protect, getEvent);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
