const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');
const stripeService = require('../services/stripeService');

// POST /api/subscriptions/create-checkout-session - Create Stripe checkout
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { planName, billingCycle } = req.body;

    if (!planName) {
      return res.status(400).json(
        formatResponse(false, 'Plan name is required')
      );
    }

    if (planName === 'free') {
      return res.status(400).json(
        formatResponse(false, 'Cannot create checkout for free plan')
      );
    }

    const session = await stripeService.createCheckoutSession(
      req.user._id,
      planName,
      billingCycle || 'monthly'
    );

    res.status(200).json(
      formatResponse(true, 'Checkout session created', {
        sessionId: session.id,
        url: session.url,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/status - Get subscription status
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const status = await stripeService.getSubscriptionStatus(req.user._id);

    res.status(200).json(
      formatResponse(true, 'Subscription status retrieved', status)
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/subscriptions/details - Get subscription details
exports.getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });

    if (!subscription) {
      return res.status(200).json(
        formatResponse(true, 'Subscription details', {
          planName: 'free',
          status: 'free',
          features: stripeService.PLANS.free.features,
        })
      );
    }

    res.status(200).json(
      formatResponse(true, 'Subscription details retrieved', subscription)
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/upgrade - Upgrade subscription
exports.upgradeSubscription = async (req, res, next) => {
  try {
    const { newPlanName } = req.body;

    if (!newPlanName) {
      return res.status(400).json(
        formatResponse(false, 'New plan name is required')
      );
    }

    const subscription = await stripeService.upgradePlan(req.user._id, newPlanName);

    res.status(200).json(
      formatResponse(true, 'Subscription upgraded successfully', subscription)
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/cancel - Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const subscription = await stripeService.cancelSubscription(
      req.user._id,
      reason || 'User requested'
    );

    res.status(200).json(
      formatResponse(true, 'Subscription cancelled successfully', subscription)
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/subscriptions/webhook - Stripe webhook
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = req.body;

    switch (event.type) {
      case 'checkout.session.completed':
        await stripeService.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await Subscription.updateOne(
          { stripeSubscriptionId: subscription.id },
          { status: subscription.status === 'active' ? 'active' : 'cancelled' }
        );
        break;
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await Subscription.updateOne(
          { stripeSubscriptionId: deletedSubscription.id },
          { status: 'cancelled' }
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json(formatResponse(true, 'Webhook processed'));
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json(formatResponse(false, 'Webhook processing failed'));
  }
};

// GET /api/subscriptions/plans - Get available plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = Object.entries(stripeService.PLANS).map(([key, plan]) => ({
      name: key,
      displayName: plan.name,
      pricePerMonth: plan.pricePerMonth,
      features: plan.features,
    }));

    res.status(200).json(
      formatResponse(true, 'Plans retrieved', { plans })
    );
  } catch (error) {
    next(error);
  }
};
