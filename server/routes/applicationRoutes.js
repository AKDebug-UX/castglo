const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Submit an application to a casting call
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [castingCallId]
 *             properties:
 *               castingCallId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, authorize('talent'), applicationController.createApplication);

/**
 * @swagger
 * /applications/me:
 *   get:
 *     summary: Get my applications (talent)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of my applications
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, authorize('talent'), applicationController.getMyApplications);

/**
 * @swagger
 * /applications/{castingCallId}:
 *   get:
 *     summary: Get applications for a casting call
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: castingCallId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applications
 *       401:
 *         description: Unauthorized
 */
router.get('/:castingCallId', protect, applicationController.getCastingCallApplications);

/**
 * @swagger
 * /applications/details/{applicationId}:
 *   get:
 *     summary: Get application details
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Application not found
 */
router.get('/details/:applicationId', protect, applicationController.getApplicationDetails);

/**
 * @swagger
 * /applications/{applicationId}/shortlist:
 *   put:
 *     summary: Shortlist an application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application shortlisted successfully
 *       404:
 *         description: Application not found
 */
router.put('/:applicationId/shortlist', protect, authorize('casting_director', 'admin'), applicationController.shortlistApplication);

/**
 * @swagger
 * /applications/{applicationId}/reject:
 *   put:
 *     summary: Reject an application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application rejected successfully
 *       404:
 *         description: Application not found
 */
router.put('/:applicationId/reject', protect, authorize('casting_director', 'admin'), applicationController.rejectApplication);

/**
 * @swagger
 * /applications/{applicationId}/accept:
 *   put:
 *     summary: Accept an application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application accepted successfully
 *       404:
 *         description: Application not found
 */
router.put('/:applicationId/accept', protect, authorize('casting_director', 'admin'), applicationController.acceptApplication);

/**
 * @swagger
 * /applications/{applicationId}/communication:
 *   post:
 *     summary: Add communication to application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Communication added successfully
 *       404:
 *         description: Application not found
 */
router.post('/:applicationId/communication', protect, applicationController.addCommunication);

/**
 * @swagger
 * /applications/{applicationId}:
 *   delete:
 *     summary: Withdraw an application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *       404:
 *         description: Application not found
 */
router.delete('/:applicationId', protect, applicationController.withdrawApplication);

module.exports = router;
