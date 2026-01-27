const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const PLANS = {
  free: {
    name: 'Free',
    pricePerMonth: 0,
    features: {
      maxCastingCallsPerMonth: 5,
      maxApplicationsPerMonth: 10,
      maxShortlists: 0,
      advancedAnalytics: false,
      prioritySupport: false,
      brandCustomization: false,
      apiAccess: false,
      bulkUpload: false,
      videoHosting: false,
      advancedFiltering: false,
    },
  },
  starter: {
    name: 'Starter',
    pricePerMonth: 29,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      maxCastingCallsPerMonth: 50,
      maxApplicationsPerMonth: 100,
      maxShortlists: 500,
      advancedAnalytics: true,
      prioritySupport: false,
      brandCustomization: false,
      apiAccess: false,
      bulkUpload: true,
      videoHosting: true,
      advancedFiltering: true,
    },
  },
  professional: {
    name: 'Professional',
    pricePerMonth: 99,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    features: {
      maxCastingCallsPerMonth: 500,
      maxApplicationsPerMonth: 5000,
      maxShortlists: null,
      advancedAnalytics: true,
      prioritySupport: true,
      brandCustomization: true,
      apiAccess: true,
      bulkUpload: true,
      videoHosting: true,
      advancedFiltering: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    pricePerMonth: 999,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxCastingCallsPerMonth: null,
      maxApplicationsPerMonth: null,
      maxShortlists: null,
      advancedAnalytics: true,
      prioritySupport: true,
      brandCustomization: true,
      apiAccess: true,
      bulkUpload: true,
      videoHosting: true,
      advancedFiltering: true,
    },
  },
};

const createCheckoutSession = async (userId, planName, billingCycle = 'monthly') => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[planName];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    if (planName === 'free') {
      throw new Error('Cannot create checkout for free plan');
    }

    const lineItems = [
      {
        price: billingCycle === 'yearly' ? plan.stripePriceId.yearly : plan.stripePriceId,
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: userId.toString(),
        planName,
        billingCycle,
      },
    });

    return session;
  } catch (error) {
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

const handleCheckoutSessionCompleted = async (session) => {
  try {
    const userId = session.metadata.userId;
    const planName = session.metadata.planName;
    const billingCycle = session.metadata.billingCycle;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const plan = PLANS[planName];
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planName,
        pricePerMonth: plan.pricePerMonth,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        stripePaymentMethodId: session.payment_method,
        startDate: new Date(),
        status: 'active',
        billingCycle,
        features: plan.features,
        autoRenew: true,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    user.subscriptionStatus = 'active';
    user.subscriptionPlan = subscription._id;
    user.subscriptionExpires = subscription.renewalDate;
    await user.save();

    return subscription;
  } catch (error) {
    throw new Error(`Failed to handle checkout completion: ${error.message}`);
  }
};

const cancelSubscription = async (userId, reason = 'User requested') => {
  try {
    const subscription = await Subscription.findOne({ userId });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    subscription.status = 'cancelled';
    subscription.cancellationReason = reason;
    subscription.cancelledAt = new Date();
    await subscription.save();

    const user = await User.findById(userId);
    user.subscriptionStatus = 'cancelled';
    await user.save();

    return subscription;
  } catch (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
};

const getSubscriptionStatus = async (userId) => {
  try {
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return { planName: 'free', status: 'free', features: PLANS.free.features };
    }

    return {
      planName: subscription.planName,
      status: subscription.status,
      features: subscription.features,
      renewalDate: subscription.renewalDate,
    };
  } catch (error) {
    throw new Error(`Failed to get subscription status: ${error.message}`);
  }
};

const upgradePlan = async (userId, newPlanName) => {
  try {
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const newPlan = PLANS[newPlanName];
    if (!newPlan) {
      throw new Error('Invalid plan');
    }

    subscription.planName = newPlanName;
    subscription.pricePerMonth = newPlan.pricePerMonth;
    subscription.features = newPlan.features;
    await subscription.save();

    return subscription;
  } catch (error) {
    throw new Error(`Failed to upgrade plan: ${error.message}`);
  }
};

module.exports = {
  PLANS,
  createCheckoutSession,
  handleCheckoutSessionCompleted,
  cancelSubscription,
  getSubscriptionStatus,
  upgradePlan,
};
