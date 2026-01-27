const CastingCall = require('../models/CastingCall');
const User = require('../models/User');
const { validateCastingCall } = require('../utils/validators');
const { formatResponse, getPaginationParams } = require('../utils/helpers');
const { sendApplicationNotification } = require('../services/emailService');
const AdminActionLog = require('../models/AdminActionLog');

// POST /api/casting-calls - Create casting call (casting directors only)
exports.createCastingCall = async (req, res, next) => {
  try {
    const {
      title,
      description,
      projectName,
      projectType,
      budget,
      location,
      roles,
      deadline,
      shootDates,
      visibility,
      requirements,
      compensationType,
      compensationAmount,
      tags,
    } = req.body;

    const validation = validateCastingCall({
      title,
      description,
      projectName,
      projectType,
      deadline,
      roles,
    });

    if (!validation.valid) {
      return res.status(400).json(
        formatResponse(false, 'Validation failed', validation.errors)
      );
    }

    const castingCall = new CastingCall({
      title: title.trim(),
      description: description.trim(),
      createdBy: req.user._id,
      projectName: projectName.trim(),
      projectType,
      budget,
      location,
      roles,
      deadline: new Date(deadline),
      shootDates,
      visibility: visibility || 'public',
      requirements,
      compensationType: compensationType || 'paid',
      compensationAmount,
      tags: tags || [],
      status: 'open',
    });

    await castingCall.save();

    res.status(201).json(
      formatResponse(true, 'Casting call created successfully', castingCall)
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/casting-calls - Get casting calls
exports.getCastingCalls = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, projectType, search, sortBy = '-createdAt', featured } = req.query;

    const filter = { status: { $ne: 'cancelled' } };

    if (status) {
      filter.status = status;
    }

    if (projectType) {
      filter.projectType = projectType;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } },
      ];
    }

    const [castingCalls, total] = await Promise.all([
      CastingCall.find(filter)
        .populate('createdBy', 'fullName profilePicture')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      CastingCall.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Casting calls retrieved', {
        castingCalls,
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

// GET /api/casting-calls/:id - Get casting call details
exports.getCastingCallDetails = async (req, res, next) => {
  try {
    const castingCall = await CastingCall.findById(req.params.id)
      .populate('createdBy', 'fullName email profilePicture');

    if (!castingCall) {
      return res.status(404).json(
        formatResponse(false, 'Casting call not found')
      );
    }

    await castingCall.incrementViewCount();

    res.status(200).json(
      formatResponse(true, 'Casting call details retrieved', castingCall)
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/casting-calls/:id - Update casting call
exports.updateCastingCall = async (req, res, next) => {
  try {
    const castingCall = await CastingCall.findById(req.params.id);

    if (!castingCall) {
      return res.status(404).json(
        formatResponse(false, 'Casting call not found')
      );
    }

    if (castingCall.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized to update this casting call')
      );
    }

    const { title, description, roles, deadline, status, featured, compensationType, compensationAmount } = req.body;

    if (title) castingCall.title = title.trim();
    if (description) castingCall.description = description.trim();
    if (roles) castingCall.roles = roles;
    if (deadline) castingCall.deadline = new Date(deadline);
    if (status) castingCall.status = status;
    if (typeof featured === 'boolean') {
      castingCall.featured = featured;
      if (featured) {
        castingCall.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }
    if (compensationType) castingCall.compensationType = compensationType;
    if (compensationAmount) castingCall.compensationAmount = compensationAmount;

    await castingCall.save();

    res.status(200).json(
      formatResponse(true, 'Casting call updated successfully', castingCall)
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/casting-calls/:id/close - Close casting call
exports.closeCastingCall = async (req, res, next) => {
  try {
    const castingCall = await CastingCall.findById(req.params.id);

    if (!castingCall) {
      return res.status(404).json(
        formatResponse(false, 'Casting call not found')
      );
    }

    if (castingCall.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized to close this casting call')
      );
    }

    await castingCall.closeCastingCall();

    res.status(200).json(
      formatResponse(true, 'Casting call closed successfully')
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/casting-calls/:id - Delete casting call
exports.deleteCastingCall = async (req, res, next) => {
  try {
    const castingCall = await CastingCall.findById(req.params.id);

    if (!castingCall) {
      return res.status(404).json(
        formatResponse(false, 'Casting call not found')
      );
    }

    if (castingCall.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Not authorized to delete this casting call')
      );
    }

    await CastingCall.findByIdAndDelete(req.params.id);

    if (req.user.role === 'admin') {
      await AdminActionLog.create({
        adminId: req.user._id,
        actionType: 'casting_call_remove',
        targetType: 'casting_call',
        targetId: castingCall._id,
        reason: req.body.reason || 'Casting call removed by admin',
        previousState: castingCall,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.status(200).json(
      formatResponse(true, 'Casting call deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/casting-calls/user/my-listings - Get user's casting calls
exports.getMyListings = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, sortBy = '-createdAt' } = req.query;

    const filter = { createdBy: req.user._id };

    if (status) {
      filter.status = status;
    }

    const [castingCalls, total] = await Promise.all([
      CastingCall.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      CastingCall.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Your casting calls retrieved', {
        castingCalls,
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
