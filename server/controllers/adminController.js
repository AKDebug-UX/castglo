const User = require('../models/User');
const AdminActionLog = require('../models/AdminActionLog');
const Lead = require('../models/Lead');
const CastingCall = require('../models/CastingCall');
const Subscription = require('../models/Subscription');
const { formatResponse, getPaginationParams } = require('../utils/helpers');

// GET /api/admin/users - Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { role, search, sortBy = '-createdAt' } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Users retrieved', {
        users,
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

// PUT /api/admin/users/:userId/suspend - Suspend user
exports.suspendUser = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json(
        formatResponse(false, 'Suspension reason is required')
      );
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    if (user.role === 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Cannot suspend admin users')
      );
    }

    user.isSuspended = true;
    user.suspensionReason = reason;
    await user.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      actionType: 'user_suspend',
      targetType: 'user',
      targetId: user._id,
      targetEmail: user.email,
      reason,
      newState: { isSuspended: true, suspensionReason: reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(
      formatResponse(true, 'User suspended successfully')
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:userId/unsuspend - Unsuspend user
exports.unsuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    user.isSuspended = false;
    user.suspensionReason = undefined;
    await user.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      actionType: 'user_unsuspend',
      targetType: 'user',
      targetId: user._id,
      targetEmail: user.email,
      reason: 'User unsuspended by admin',
      newState: { isSuspended: false },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(
      formatResponse(true, 'User unsuspended successfully')
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:userId/verify - Verify user profile
exports.verifyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json(
        formatResponse(false, 'Profile not found')
      );
    }

    profile.isVerified = true;
    await profile.save();

    await AdminActionLog.create({
      adminId: req.user._id,
      actionType: 'profile_approve',
      targetType: 'profile',
      targetId: profile._id,
      targetEmail: user.email,
      reason: 'Profile verified by admin',
      newState: { isVerified: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json(
      formatResponse(true, 'Profile verified successfully')
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/action-logs - Get admin action logs
exports.getActionLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { actionType, severity, sortBy = '-createdAt' } = req.query;

    const filter = {};

    if (actionType) {
      filter.actionType = actionType;
    }

    if (severity) {
      filter.severity = severity;
    }

    const [logs, total] = await Promise.all([
      AdminActionLog.find(filter)
        .populate('adminId', 'fullName email')
        .populate('targetId')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      AdminActionLog.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Action logs retrieved', {
        logs,
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

// GET /api/admin/analytics - Get platform analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalCastingCalls, totalApplications, totalLeads, suspendedUsers] = await Promise.all([
      User.countDocuments({}),
      CastingCall.countDocuments({}),
      require('../models/Application').countDocuments({}),
      Lead.countDocuments({}),
      User.countDocuments({ isSuspended: true }),
    ]);

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const subscriptionStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$planName',
          count: { $sum: 1 },
          revenue: { $sum: '$pricePerMonth' },
        },
      },
    ]);

    const castingCallStatus = await CastingCall.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(
      formatResponse(true, 'Analytics retrieved', {
        summary: {
          totalUsers,
          totalCastingCalls,
          totalApplications,
          totalLeads,
          suspendedUsers,
        },
        usersByRole,
        subscriptionStats,
        castingCallStatus,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/leads - Get leads (admin only)
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
      formatResponse(true, 'Leads retrieved', {
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

// GET /api/admin/subscriptions - Get subscription overview
exports.getSubscriptionOverview = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, planName, sortBy = '-createdAt' } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (planName) {
      filter.planName = planName;
    }

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('userId', 'fullName email')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Subscription.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Subscriptions retrieved', {
        subscriptions,
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

// DELETE /api/admin/users/:userId - Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    if (user.role === 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Cannot delete admin users')
      );
    }

    await User.findByIdAndDelete(req.params.userId);

    await AdminActionLog.create({
      adminId: req.user._id,
      actionType: 'user_delete',
      targetType: 'user',
      targetId: user._id,
      targetEmail: user.email,
      reason: reason || 'User deleted by admin',
      previousState: user,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      severity: 'high',
    });

    res.status(200).json(
      formatResponse(true, 'User deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
