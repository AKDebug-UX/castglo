const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return {
    token,
    hashedToken,
    expiresIn: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
};

const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return {
    token,
    hashedToken,
    expiresIn: Date.now() + 30 * 60 * 1000, // 30 minutes
  };
};

const verifyHashedToken = (token, hashedToken) => {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === hashedToken;
};

const sanitizeUser = (user) => {
  const sanitized = user.toObject ? user.toObject() : user;
  delete sanitized.password;
  delete sanitized.emailVerificationToken;
  delete sanitized.passwordResetToken;
  delete sanitized.loginAttempts;
  delete sanitized.lockUntil;
  return sanitized;
};

const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    ...(data && { data }),
  };
};

const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  const MAX_PAGE_SIZE = config.MAX_PAGE_SIZE || 100;

  if (limit > MAX_PAGE_SIZE) {
    limit = MAX_PAGE_SIZE;
  }

  if (page < 1) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = {
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyHashedToken,
  sanitizeUser,
  formatResponse,
  getPaginationParams,
};
