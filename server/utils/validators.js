const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true };
};

const validateRegistration = (data) => {
  const errors = {};

  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  const passwordValidation = validatePassword(data.password || '');
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }

  if (!data.role || !['talent', 'casting_director', 'industry_professional'].includes(data.role)) {
    errors.role = 'Valid role is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateCastingCall = (data) => {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required';
  }

  if (!data.projectName || !data.projectName.trim()) {
    errors.projectName = 'Project name is required';
  }

  if (!data.projectType) {
    errors.projectType = 'Project type is required';
  }

  if (!data.deadline || new Date(data.deadline) <= new Date()) {
    errors.deadline = 'Valid future deadline is required';
  }

  if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
    errors.roles = 'At least one role is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateApplication = (data) => {
  const errors = {};

  if (!data.castingCallId) {
    errors.castingCallId = 'Casting call is required';
  }

  if (data.applicationData && data.applicationData.coverLetter) {
    if (data.applicationData.coverLetter.length > 2000) {
      errors.coverLetter = 'Cover letter cannot exceed 2000 characters';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLead = (data) => {
  const errors = {};

  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.roleInterestedIn) {
    errors.roleInterestedIn = 'Role interested in is required';
  }

  if (data.feedback && data.feedback.length > 1000) {
    errors.feedback = 'Feedback cannot exceed 1000 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistration,
  validateCastingCall,
  validateApplication,
  validateLead,
};
