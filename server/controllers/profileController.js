const Profile = require('../models/Profile');
const User = require('../models/User');
const { formatResponse, getPaginationParams } = require('../utils/helpers');

// POST /api/profiles - Create user profile
exports.createProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { userRole, bio, headline, location, visibility, talent, professional, socialLinks, preferences } = req.body;

    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json(
        formatResponse(false, 'Profile already exists for this user')
      );
    }

    const profile = new Profile({
      userId,
      userRole,
      bio,
      headline,
      location,
      visibility: visibility || 'public',
      talent: userRole === 'talent' ? talent : undefined,
      professional: userRole !== 'talent' ? professional : undefined,
      socialLinks,
      preferences,
    });

    await profile.save();
    await profile.updateProfileCompletion();

    res.status(201).json(
      formatResponse(true, 'Profile created successfully', profile)
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/profiles/me - Get own profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json(
        formatResponse(false, 'Profile not found')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Profile retrieved', profile)
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/profiles/me - Update own profile
exports.updateMyProfile = async (req, res, next) => {
  try {
    const { bio, headline, location, visibility, talent, professional, socialLinks, preferences } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json(
        formatResponse(false, 'Profile not found')
      );
    }

    if (bio) profile.bio = bio;
    if (headline) profile.headline = headline;
    if (location) profile.location = { ...profile.location, ...location };
    if (visibility) profile.visibility = visibility;
    if (talent && profile.userRole === 'talent') {
      profile.talent = { ...profile.talent, ...talent };
    }
    if (professional && profile.userRole !== 'talent') {
      profile.professional = { ...profile.professional, ...professional };
    }
    if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
    if (preferences) profile.preferences = { ...profile.preferences, ...preferences };

    await profile.save();
    await profile.updateProfileCompletion();

    res.status(200).json(
      formatResponse(true, 'Profile updated successfully', profile)
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/profiles/me/headshots - Add headshot (talent)
exports.addHeadshot = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, 'Headshot file is required')
      );
    }

    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile || profile.userRole !== 'talent') {
      return res.status(404).json(
        formatResponse(false, 'Talent profile not found')
      );
    }

    const cloudinaryService = require('../services/cloudinaryService');
    cloudinaryService.initCloudinary();

    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      `profiles/${req.user._id}/headshots`
    );

    if (req.body.isPrimary || profile.talent.headshots.length === 0) {
      profile.talent.headshots.forEach(h => h.isPrimary = false);
      result.isPrimary = true;
    }

    profile.talent.headshots.push({
      url: result.url,
      cloudinaryId: result.cloudinaryId,
      uploadedAt: new Date(),
      isPrimary: result.isPrimary || false,
    });

    await profile.save();
    await profile.updateProfileCompletion();

    res.status(200).json(
      formatResponse(true, 'Headshot added successfully', {
        headshotsCount: profile.talent.headshots.length,
      })
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/profiles/me/headshots/:headshotId - Delete headshot
exports.deleteHeadshot = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile || profile.userRole !== 'talent') {
      return res.status(404).json(
        formatResponse(false, 'Talent profile not found')
      );
    }

    const headshot = profile.talent.headshots.id(req.params.headshotId);
    if (!headshot) {
      return res.status(404).json(
        formatResponse(false, 'Headshot not found')
      );
    }

    const cloudinaryService = require('../services/cloudinaryService');
    cloudinaryService.initCloudinary();

    try {
      await cloudinaryService.deleteAsset(headshot.cloudinaryId);
    } catch (error) {
      console.error('Failed to delete from Cloudinary:', error);
    }

    profile.talent.headshots.id(req.params.headshotId).deleteOne();
    await profile.save();
    await profile.updateProfileCompletion();

    res.status(200).json(
      formatResponse(true, 'Headshot deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/profiles/me/showreel - Upload showreel (talent)
exports.uploadShowreel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, 'Showreel file is required')
      );
    }

    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile || profile.userRole !== 'talent') {
      return res.status(404).json(
        formatResponse(false, 'Talent profile not found')
      );
    }

    const cloudinaryService = require('../services/cloudinaryService');
    cloudinaryService.initCloudinary();

    const result = await cloudinaryService.uploadVideo(
      req.file.buffer,
      `profiles/${req.user._id}/showreel`
    );

    if (profile.talent.showreel && profile.talent.showreel.cloudinaryId) {
      try {
        await cloudinaryService.deleteAsset(profile.talent.showreel.cloudinaryId);
      } catch (error) {
        console.error('Failed to delete old showreel:', error);
      }
    }

    profile.talent.showreel = {
      url: result.url,
      cloudinaryId: result.cloudinaryId,
      uploadedAt: new Date(),
      duration: result.duration,
    };

    await profile.save();
    await profile.updateProfileCompletion();

    res.status(200).json(
      formatResponse(true, 'Showreel uploaded successfully', {
        showreelUrl: result.url,
        duration: result.duration,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/profiles/:userId - Get public profile
exports.getPublicProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate(
      'userId',
      'fullName email profilePicture'
    );

    if (!profile) {
      return res.status(404).json(
        formatResponse(false, 'Profile not found')
      );
    }

    if (profile.visibility === 'hidden') {
      return res.status(403).json(
        formatResponse(false, 'Profile is hidden')
      );
    }

    if (profile.visibility === 'private' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json(
        formatResponse(false, 'Profile is private')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Profile retrieved', profile)
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/profiles - Search profiles
exports.searchProfiles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { userRole, search, isVerified, sortBy = '-rating' } = req.query;

    const filter = { visibility: { $in: ['public'] } };

    if (userRole) {
      filter.userRole = userRole;
    }

    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    if (search) {
      filter.$or = [
        { bio: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } },
      ];
    }

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .populate('userId', 'fullName profilePicture')
        .sort(sortBy)
        .skip(skip)
        .limit(limit),
      Profile.countDocuments(filter),
    ]);

    res.status(200).json(
      formatResponse(true, 'Profiles retrieved', {
        profiles,
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
