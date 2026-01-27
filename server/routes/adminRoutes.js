const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}/suspend:
 *   put:
 *     summary: Suspend a user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User suspended successfully
 *       404:
 *         description: User not found
 */
router.put('/users/:userId/suspend', protect, authorize('admin'), adminController.suspendUser);

/**
 * @swagger
 * /admin/users/{userId}/unsuspend:
 *   put:
 *     summary: Unsuspend a user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unsuspended successfully
 *       404:
 *         description: User not found
 */
router.put('/users/:userId/unsuspend', protect, authorize('admin'), adminController.unsuspendUser);

/**
 * @swagger
 * /admin/users/{userId}/verify:
 *   put:
 *     summary: Verify user profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile verified successfully
 *       404:
 *         description: User not found
 */
router.put('/users/:userId/verify', protect, authorize('admin'), adminController.verifyProfile);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId', protect, authorize('admin'), adminController.deleteUser);

/**
 * @swagger
 * /admin/action-logs:
 *   get:
 *     summary: Get action logs
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of action logs
 */
router.get('/action-logs', protect, authorize('admin'), adminController.getActionLogs);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *     responses:
 *       200:
 *         description: Platform analytics data
 */
router.get('/analytics', protect, authorize('admin'), adminController.getAnalytics);

/**
 * @swagger
 * /admin/leads:
 *   get:
 *     summary: Get leads overview
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/leads', protect, authorize('admin'), adminController.getLeads);

/**
 * @swagger
 * /admin/subscriptions:
 *   get:
 *     summary: Get subscription overview
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Subscription overview data
 */
router.get('/subscriptions', protect, authorize('admin'), adminController.getSubscriptionOverview);

module.exports = router;
