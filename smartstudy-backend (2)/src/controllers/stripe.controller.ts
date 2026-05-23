import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import User from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

// Safe Stripe initialization - works even without API keys
let stripe: any = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe');
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  logger.warn('Stripe not initialized - missing API key');
}

const PRICE_ID = process.env.STRIPE_PRICE_ID || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// @desc    Create checkout session
// @route   POST /api/v1/stripe/checkout
// @access  Private
export const createCheckoutSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!stripe) {
    // Return mock response for development
    return res.status(200).json({
      status: 'success',
      message: 'Stripe not configured - mock mode',
      data: {
        url: `${process.env.CLIENT_URL}/dashboard?mock_payment=success`,
        mockMode: true,
      },
    });
  }

  const user = await User.findById(req.user!._id);
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Create Stripe customer if not exists
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.CLIENT_URL}/pricing?subscription=cancelled`,
    metadata: {
      userId: user._id.toString(),
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      url: session.url,
      sessionId: session.id,
    },
  });
});

// @desc    Get subscription status
// @route   GET /api/v1/stripe/subscription
// @access  Private
export const getSubscription = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!stripe || !user.stripeSubscriptionId) {
    return res.status(200).json({
      status: 'success',
      data: {
        isPro: user.isPro,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
        mockMode: !stripe,
      },
    });
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    res.status(200).json({
      status: 'success',
      data: {
        isPro: user.isPro,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } catch (error) {
    res.status(200).json({
      status: 'success',
      data: {
        isPro: user.isPro,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  }
});

// @desc    Create billing portal session
// @route   POST /api/v1/stripe/portal
// @access  Private
export const createPortalSession = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id);
  if (!user || !user.stripeCustomerId) {
    throw new ApiError('No subscription found', 404);
  }

  if (!stripe) {
    return res.status(200).json({
      status: 'success',
      message: 'Stripe not configured - mock mode',
      data: {
        url: `${process.env.CLIENT_URL}/dashboard`,
        mockMode: true,
      },
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
  });

  res.status(200).json({
    status: 'success',
    data: {
      url: session.url,
    },
  });
});

// @desc    Handle Stripe webhook
// @route   POST /api/v1/stripe/webhook
// @access  Public
export const webhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!stripe) {
    return res.status(200).json({ received: true, mockMode: true });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    throw new ApiError(`Webhook Error: ${err.message}`, 400);
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          isPro: true,
          stripeSubscriptionId: session.subscription,
          subscriptionStatus: 'active',
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        user.isPro = true;
        user.subscriptionStatus = 'active';
        await user.save();
      }
      break;
    }

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        user.isPro = false;
        user.subscriptionStatus = subscription.status === 'canceled' ? 'canceled' : 'past_due';
        await user.save();
      }
      break;
    }
  }

  res.status(200).json({ received: true });
});
