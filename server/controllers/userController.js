const User = require('../models/User');
const Profile = require('../models/Profile');
const Subscription = require('../models/Subscription');
const { formatResponse, sanitizeUser, getPaginationParams } = require('../utils/helpers');

// GET /api/users/profile - Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await Profile.findOne({ userId: req.user._id });
    const subscription = await Subscription.findOne({ userId: req.user._id });

    res.status(200).json(
      formatResponse(true, 'User profile retrieved', {
        user: sanitizeUser(user),
        profile,
        subscription: subscription ? {
          planName: subscription.planName,
          status: subscription.status,
          renewalDate: subscription.renewalDate,
        } : { planName: 'free', status: 'free' },
      })
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile - Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber } = req.body;

    const user = await User.findById(req.user._id);

    if (fullName) {
      user.fullName = fullName.trim();
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    await user.save();

    res.status(200).json(
      formatResponse(true, 'Profile updated successfully', sanitizeUser(user))
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile-picture - Update profile picture
exports.updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, 'Profile picture file is required')
      );
    }

    const cloudinaryService = require('../services/cloudinaryService');
    cloudinaryService.initCloudinary();

    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      `profiles/${req.user._id}/pictures`
    );

    const user = await User.findById(req.user._id);
    user.profilePicture = result.url;
    await user.save();

    res.status(200).json(
      formatResponse(true, 'Profile picture updated', {
        profilePictureUrl: result.url,
      })
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/account - Delete user account
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json(
        formatResponse(false, 'Password is required to delete account')
      );
    }

    const user = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json(
        formatResponse(false, 'Invalid password')
      );
    }

    await User.findByIdAndDelete(req.user._id);
    await Profile.deleteOne({ userId: req.user._id });
    await Subscription.deleteOne({ userId: req.user._id });

    res.status(200).json(
      formatResponse(true, 'Account deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:userId - Get user details (public)
exports.getPublicUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role === 'admin') {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    const profile = await Profile.findOne({ userId: req.params.userId });

    if (!profile || profile.visibility === 'hidden') {
      return res.status(404).json(
        formatResponse(false, 'User profile not found')
      );
    }

    if (profile.visibility === 'private' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json(
        formatResponse(false, 'User profile is private')
      );
    }

    res.status(200).json(
      formatResponse(true, 'User profile retrieved', {
        user: {
          id: user._id,
          fullName: user.fullName,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: profile.isVerified,
          rating: profile.rating,
        },
        profile,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/users - Search/list users
exports.searchUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { role, search, sortBy = '-createdAt' } = req.query;

    const filter = { role: { $ne: 'admin' } };

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

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id });
        return {
          user: sanitizeUser(user),
          profile: profile ? {
            rating: profile.rating,
            isVerified: profile.isVerified,
            headline: profile.headline,
          } : null,
        };
      })
    );

    res.status(200).json(
      formatResponse(true, 'Users retrieved successfully', {
        users: usersWithProfiles,
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
