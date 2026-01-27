const mongoose = require('mongoose');
const validator = require('validator');

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true,
    },
    roleInterestedIn: {
      type: String,
      enum: ['talent', 'casting_director', 'industry_professional'],
      required: [true, 'Please specify role interested in'],
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    consent: {
      type: Boolean,
      required: [true, 'Consent is required'],
      default: true,
    },
    source: {
      type: String,
      default: 'landing_page',
      enum: ['landing_page', 'referral', 'social_media', 'other'],
    },
    isConverted: {
      type: Boolean,
      default: false,
    },
    convertedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    convertedAt: Date,
    phoneNumber: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || validator.isMobilePhone(v);
        },
        message: 'Invalid phone number',
      },
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ roleInterestedIn: 1 });
leadSchema.index({ isConverted: 1 });

module.exports = mongoose.model('Lead', leadSchema);
