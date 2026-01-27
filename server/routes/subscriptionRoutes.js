const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const protect = require('../middleware/auth');

/**
 * @swagger
 * /subscriptions/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout session created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/create-checkout-session', protect, subscriptionController.createCheckoutSession);

/**
 * @swagger
 * /subscriptions/status:
 *   get:
 *     summary: Get subscription status
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status
 *       401:
 *         description: Unauthorized
 */
router.get('/status', protect, subscriptionController.getSubscriptionStatus);

/**
 * @swagger
 * /subscriptions/details:
 *   get:
 *     summary: Get subscription details
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details
 *       401:
 *         description: Unauthorized
 */
router.get('/details', protect, subscriptionController.getSubscriptionDetails);

/**
 * @swagger
 * /subscriptions/upgrade:
 *   post:
 *     summary: Upgrade subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPlanId]
 *             properties:
 *               newPlanId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription upgraded successfully
 *       400:
 *         description: Validation error
 */
router.post('/upgrade', protect, subscriptionController.upgradeSubscription);

/**
 * @swagger
 * /subscriptions/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/cancel', protect, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook', subscriptionController.handleStripeWebhook);

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of available plans
 */
router.get('/plans', subscriptionController.getPlans);

module.exports = router;
