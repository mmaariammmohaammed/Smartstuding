import express from 'express';
import {
  createCheckoutSession,
  getSubscription,
  createPortalSession,
  webhook,
} from '../controllers/stripe.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/checkout', protect, createCheckoutSession);
router.get('/subscription', protect, getSubscription);
router.post('/portal', protect, createPortalSession);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

export default router;
