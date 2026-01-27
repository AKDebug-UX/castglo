const Lead = require('../models/Lead');
const { validateLead } = require('../utils/validators');
const { formatResponse, getPaginationParams } = require('../utils/helpers');
const AdminActionLog = require('../models/AdminActionLog');

// POST /api/leads - Create a new lead
exports.createLead = async (req, res, next) => {
  try {
    const { fullName, email, roleInterestedIn, feedback, consent, phoneNumber } = req.body;

    const validation = validateLead({
      fullName,
      email,
      roleInterestedIn,
      feedback,
    });

    if (!validation.valid) {
      return res.status(400).json(
        formatResponse(false, 'Validation failed', validation.errors)
      );
    }

    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(409).json(
        formatResponse(false, 'Email already exists in lead system')
      );
    }

    const lead = new Lead({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      roleInterestedIn,
      feedback: feedback || null,
      consent,
      phoneNumber: phoneNumber || null,
      source: req.body.source || 'landing_page',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        utmSource: req.query.utm_source || null,
        utmMedium: req.query.utm_medium || null,
        utmCampaign: req.query.utm_campaign || null,
      },
    });

    await lead.save();

    res.status(201).json(
      formatResponse(
        true,
        'Lead captured successfully',
        { id: lead._id, email: lead.email }
      )
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/leads - Get all leads (admin only)
exports.getLeads = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { roleInterestedIn, isConverted, sortBy = '-createdAt' } = req.query;

    const filter = {};
    if (roleInterestedIn) {
      filter.roleInterestedIn = roleInterestedIn;
    }
    if (isConverted !== undefined) {
      filter.isConverted = isConverted === 'true';
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Leads retrieved successfully', {
        leads,
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

// GET /api/admin/leads/:id - Get single lead details
exports.getLeadDetails = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      'convertedUserId',
      'fullName email'
    );

    if (!lead) {
      return res.status(404).json(formatResponse(false, 'Lead not found'));
    }

    res.status(200).json(formatResponse(true, 'Lead details retrieved', lead));
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/leads/:id/convert - Convert lead to user
exports.convertLeadToUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json(formatResponse(false, 'Lead not found'));
    }

    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    lead.isConverted = true;
    lead.convertedUserId = userId;
    lead.convertedAt = new Date();
    await lead.save();

    // Log admin action
    await AdminActionLog.create({
      adminId: req.user._id,
      actionType: 'lead_convert',
      targetType: 'lead',
      targetId: lead._id,
      targetEmail: lead.email,
      reason: 'Lead converted to registered user',
      newState: { convertedUserId: userId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(
      formatResponse(true, 'Lead converted successfully', lead)
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/leads/:id - Delete lead
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json(formatResponse(false, 'Lead not found'));
    }

    // Log admin action
    await AdminActionLog.create({
      adminId: req.user._id,
      actionType: 'content_moderate',
      targetType: 'lead',
      targetId: lead._id,
      targetEmail: lead.email,
      reason: req.body.reason || 'Lead deleted by admin',
      previousState: lead,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(formatResponse(true, 'Lead deleted successfully'));
  } catch (error) {
    next(error);
  }
};
