const User = require('../models/User');
const { validateRegistration, validatePassword, validateEmail } = require('../utils/validators');
const { formatResponse, generateEmailVerificationToken, generatePasswordResetToken, verifyHashedToken, sanitizeUser } = require('../utils/helpers');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const crypto = require('crypto');

// POST /api/auth/register - Register new user
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    const validation = validateRegistration({ fullName, email, password, role });
    if (!validation.valid) {
      return res.status(400).json(
        formatResponse(false, 'Validation failed', validation.errors)
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json(
        formatResponse(false, 'Email already registered')
      );
    }

    const { token, hashedToken, expiresIn } = generateEmailVerificationToken();

    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password,
      role,
      phoneNumber: phoneNumber || null,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresIn,
    });

    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(user.email, token, verificationLink);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    res.status(201).json(
      formatResponse(true, 'Registration successful. Please check your email to verify your account.', {
        userId: user._id,
        email: user.email,
      })
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-email - Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(
        formatResponse(false, 'Verification token is required')
      );
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired verification token')
      );
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.fullName);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    res.status(200).json(
      formatResponse(true, 'Email verified successfully')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login - Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required')
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json(
        formatResponse(false, 'Invalid credentials')
      );
    }

    if (user.isLocked()) {
      return res.status(429).json(
        formatResponse(false, 'Account locked due to too many login attempts. Try again later.')
      );
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json(
        formatResponse(false, 'Invalid credentials')
      );
    }

    if (!user.emailVerified) {
      return res.status(403).json(
        formatResponse(false, 'Please verify your email before logging in')
      );
    }

    if (user.isSuspended) {
      return res.status(403).json(
        formatResponse(false, `Account suspended. Reason: ${user.suspensionReason}`)
      );
    }

    await user.resetLoginAttempts();

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json(
      formatResponse(true, 'Login successful', {
        token,
        user: sanitizeUser(user),
      })
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password - Request password reset
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Valid email is required')
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    const { token, hashedToken, expiresIn } = generatePasswordResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresIn;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, token, resetLink);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json(
        formatResponse(false, 'Failed to send reset email')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Password reset link sent to your email')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password - Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json(
        formatResponse(false, 'Reset token is required')
      );
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return res.status(400).json(
        formatResponse(false, 'Passwords do not match')
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json(
        formatResponse(false, passwordValidation.message)
      );
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired reset token')
      );
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json(
      formatResponse(true, 'Password reset successfully')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password - Change password (authenticated)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json(
        formatResponse(false, 'All fields are required')
      );
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json(
        formatResponse(false, 'New passwords do not match')
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json(
        formatResponse(false, passwordValidation.message)
      );
    }

    const user = await User.findById(req.user._id).select('+password');

    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json(
        formatResponse(false, 'Current password is incorrect')
      );
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(
      formatResponse(true, 'Password changed successfully')
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me - Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json(
      formatResponse(true, 'Current user retrieved', sanitizeUser(user))
    );
  } catch (error) {
    next(error);
  }
};
