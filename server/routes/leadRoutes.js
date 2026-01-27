const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phoneNumber]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               interest:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', leadController.createLead);

/**
 * @swagger
 * /leads/admin/leads:
 *   get:
 *     summary: Get all leads (admin only)
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of leads
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
router.get('/admin/leads', protect, authorize('admin'), leadController.getLeads);

/**
 * @swagger
 * /leads/admin/leads/{id}:
 *   get:
 *     summary: Get lead details (admin only)
 *     tags: [Leads]
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
 *         description: Lead details
 *       404:
 *         description: Lead not found
 */
router.get('/admin/leads/:id', protect, authorize('admin'), leadController.getLeadDetails);

/**
 * @swagger
 * /leads/admin/leads/{id}/convert:
 *   put:
 *     summary: Convert lead to registered user (admin only)
 *     tags: [Leads]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [talent, casting_director, industry_professional]
 *     responses:
 *       200:
 *         description: Lead converted successfully
 *       404:
 *         description: Lead not found
 */
router.put('/admin/leads/:id/convert', protect, authorize('admin'), leadController.convertLeadToUser);

/**
 * @swagger
 * /leads/admin/leads/{id}:
 *   delete:
 *     summary: Delete lead (admin only)
 *     tags: [Leads]
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
 *         description: Lead deleted successfully
 *       404:
 *         description: Lead not found
 */
router.delete('/admin/leads/:id', protect, authorize('admin'), leadController.deleteLead);

module.exports = router;
