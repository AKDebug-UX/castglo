const Application = require('../models/Application');
const CastingCall = require('../models/CastingCall');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { validateApplication } = require('../utils/validators');
const { formatResponse, getPaginationParams } = require('../utils/helpers');
const { sendApplicationNotification, sendApplicationStatusUpdate } = require('../services/emailService');

// POST /api/applications - Create application (talents only)
exports.createApplication = async (req, res, next) => {
  try {
    const { castingCallId, appliedRole, applicationData } = req.body;

    const validation = validateApplication({ castingCallId });
    if (!validation.valid) {
      return res.status(400).json(
        formatResponse(false, 'Validation failed', validation.errors)
      );
    }

    const castingCall = await CastingCall.findById(castingCallId);
    if (!castingCall) {
      return res.status(404).json(
        formatResponse(false, 'Casting call not found')
      );
    }

    if (castingCall.status !== 'open') {
      return res.status(400).json(
        formatResponse(false, 'This casting call is no longer open for applications')
      );
    }

    const existingApplication = await Application.findOne({
      castingCallId,
      talentId: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json(
        formatResponse(false, 'You have already applied to this casting call')
      );
    }

    const application = new Application({
      castingCallId,
      talentId: req.user._id,
      castingDirectorId: castingCall.createdBy,
      appliedRole: appliedRole || castingCall.roles[0]?.title,
      applicationData,
      status: 'submitted',
    });

    await application.save();
    await castingCall.incrementApplicantCount();

    const talentProfile = await User.findById(req.user._id);

    try {
      const castingDirector = await User.findById(castingCall.createdBy);
      await sendApplicationNotification(
        castingDirector.email,
        castingCall.title,
        talentProfile.fullName
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    res.status(201).json(
      formatResponse(true, 'Application submitted successfully', {
        applicationId: application._id,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/me - Get my applications (talents)
exports.getMyApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, sortBy = '-createdAt' } = req.query;

    const filter = { talentId: req.user._id };

    if (status) {
      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('castingCallId', 'title projectName status')
        .populate('castingDirectorId', 'fullName profilePicture')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Your applications retrieved', {
        applications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/:castingCallId - Get applications for casting call (casting directors)
exports.getCastingCallApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, isShortlisted, sortBy = '-createdAt' } = req.query;

    const castingCall = await CastingCall.findById(req.params.castingCallId);

    if (!castingCall) {
      return res.status(404).json(
        formatResponse(false, 'Casting call not found')
      );
    }

    if (castingCall.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized to view these applications')
      );
    }

    const filter = { castingCallId: req.params.castingCallId };

    if (status) {
      filter.status = status;
    }

    if (isShortlisted === 'true') {
      filter.isShortlisted = true;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('talentId', 'fullName email profilePicture')
        .populate('castingCallId', 'title')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Applications retrieved', {
        applications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/:applicationId - Get application details
exports.getApplicationDetails = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('talentId', 'fullName email phoneNumber profilePicture')
      .populate('castingCallId', 'title projectName')
      .populate('communication.senderId', 'fullName');

    if (!application) {
      return res.status(404).json(
        formatResponse(false, 'Application not found')
      );
    }

    const isAuthorized =
      application.talentId._id.toString() === req.user._id.toString() ||
      application.castingDirectorId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json(
        formatResponse(false, 'Not authorized to view this application')
      );
    }

    if (application.castingDirectorId.toString() === req.user._id.toString()) {
      await application.markAsViewed(req.user._id);
    }

    res.status(200).json(
      formatResponse(true, 'Application details retrieved', application)
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/applications/:applicationId/shortlist - Shortlist application
exports.shortlistApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json(
        formatResponse(false, 'Application not found')
      );
    }

    if (application.castingDirectorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized')
      );
    }

    await application.shortlist(req.user._id);

    const talent = await User.findById(application.talentId);
    const castingCall = await CastingCall.findById(application.castingCallId);

    try {
      await sendApplicationStatusUpdate(talent.email, castingCall.title, 'shortlisted');
    } catch (error) {
      console.error('Failed to send status update:', error);
    }

    res.status(200).json(
      formatResponse(true, 'Application shortlisted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/applications/:applicationId/reject - Reject application
exports.rejectApplication = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json(
        formatResponse(false, 'Application not found')
      );
    }

    if (application.castingDirectorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized')
      );
    }

    await application.reject(req.user._id, reason);

    const talent = await User.findById(application.talentId);
    const castingCall = await CastingCall.findById(application.castingCallId);

    try {
      await sendApplicationStatusUpdate(talent.email, castingCall.title, 'rejected');
    } catch (error) {
      console.error('Failed to send status update:', error);
    }

    res.status(200).json(
      formatResponse(true, 'Application rejected successfully')
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/applications/:applicationId/accept - Accept application
exports.acceptApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json(
        formatResponse(false, 'Application not found')
      );
    }

    if (application.castingDirectorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized')
      );
    }

    application.status = 'accepted';
    await application.save();

    const talent = await User.findById(application.talentId);
    const castingCall = await CastingCall.findById(application.castingCallId);

    try {
      await sendApplicationStatusUpdate(talent.email, castingCall.title, 'accepted');
    } catch (error) {
      console.error('Failed to send status update:', error);
    }

    res.status(200).json(
      formatResponse(true, 'Application accepted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/applications/:applicationId/communication - Add message to application
exports.addCommunication = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json(
        formatResponse(false, 'Message is required')
      );
    }

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json(
        formatResponse(false, 'Application not found')
      );
    }

    const isAuthorized =
      application.talentId.toString() === req.user._id.toString() ||
      application.castingDirectorId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json(
        formatResponse(false, 'Not authorized')
      );
    }

    await application.addCommunication(req.user._id, message);

    res.status(200).json(
      formatResponse(true, 'Message added successfully')
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/applications/:applicationId - Withdraw application (talent only)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json(
        formatResponse(false, 'Application not found')
      );
    }

    if (application.talentId.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        formatResponse(false, 'Only the applicant can withdraw')
      );
    }

    application.status = 'withdrawn';
    await application.save();

    res.status(200).json(
      formatResponse(true, 'Application withdrawn successfully')
    );
  } catch (error) {
    next(error);
  }
};
