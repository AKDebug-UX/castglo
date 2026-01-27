const express = require('express');
const router = express.Router();
const castingCallController = require('../controllers/castingCallController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /casting-calls:
 *   get:
 *     summary: Get all casting calls
 *     tags: [Casting Calls]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of casting calls
 */
router.get('/', castingCallController.getCastingCalls);

/**
 * @swagger
 * /casting-calls:
 *   post:
 *     summary: Create a new casting call
 *     tags: [Casting Calls]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, roleType, budget]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               roleType:
 *                 type: string
 *               budget:
 *                 type: number
 *               location:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Casting call created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, authorize('casting_director'), castingCallController.createCastingCall);

/**
 * @swagger
 * /casting-calls/user/my-listings:
 *   get:
 *     summary: Get my casting call listings
 *     tags: [Casting Calls]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: My casting calls
 *       401:
 *         description: Unauthorized
 */
router.get('/user/my-listings', protect, authorize('casting_director'), castingCallController.getMyListings);

/**
 * @swagger
 * /casting-calls/{id}:
 *   get:
 *     summary: Get casting call details
 *     tags: [Casting Calls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Casting call details
 *       404:
 *         description: Casting call not found
 */
router.get('/:id', castingCallController.getCastingCallDetails);

/**
 * @swagger
 * /casting-calls/{id}:
 *   put:
 *     summary: Update casting call
 *     tags: [Casting Calls]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Casting call updated successfully
 *       404:
 *         description: Casting call not found
 */
router.put('/:id', protect, authorize('casting_director', 'admin'), castingCallController.updateCastingCall);

/**
 * @swagger
 * /casting-calls/{id}/close:
 *   put:
 *     summary: Close a casting call
 *     tags: [Casting Calls]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Casting call closed successfully
 *       404:
 *         description: Casting call not found
 */
router.put('/:id/close', protect, authorize('casting_director', 'admin'), castingCallController.closeCastingCall);

/**
 * @swagger
 * /casting-calls/{id}:
 *   delete:
 *     summary: Delete casting call
 *     tags: [Casting Calls]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Casting call deleted successfully
 *       404:
 *         description: Casting call not found
 */
router.delete('/:id', protect, authorize('casting_director', 'admin'), castingCallController.deleteCastingCall);

module.exports = router;
