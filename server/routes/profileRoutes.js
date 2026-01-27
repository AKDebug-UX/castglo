const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const protect = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileType]
 *             properties:
 *               profileType:
 *                 type: string
 *                 enum: [talent, professional]
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, profileController.createProfile);

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/me', protect, profileController.getMyProfile);

/**
 * @swagger
 * /profiles/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', protect, profileController.updateMyProfile);

/**
 * @swagger
 * /profiles/me/headshots:
 *   post:
 *     summary: Add headshot to profile
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [headshot]
 *             properties:
 *               headshot:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Headshot added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/me/headshots', protect, upload.single('headshot'), profileController.addHeadshot);

/**
 * @swagger
 * /profiles/me/headshots/{headshotId}:
 *   delete:
 *     summary: Delete headshot
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headshotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Headshot deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/me/headshots/:headshotId', protect, profileController.deleteHeadshot);

/**
 * @swagger
 * /profiles/me/showreel:
 *   post:
 *     summary: Upload showreel video
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [showreel]
 *             properties:
 *               showreel:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Showreel uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/me/showreel', protect, upload.single('showreel'), profileController.uploadShowreel);

/**
 * @swagger
 * /profiles/search:
 *   get:
 *     summary: Search profiles
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: profileType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
router.get('/search', protect, profileController.searchProfiles);

/**
 * @swagger
 * /profiles/{userId}:
 *   get:
 *     summary: Get public profile
 *     tags: [Profiles]
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
 *         description: Public profile
 *       404:
 *         description: Profile not found
 */
router.get('/:userId', protect, profileController.getPublicProfile);

module.exports = router;
