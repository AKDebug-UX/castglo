const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    castingCallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CastingCall',
      required: true,
      index: true,
    },
    talentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    castingDirectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'viewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn'],
      default: 'submitted',
      index: true,
    },
    appliedRole: String,
    applicationData: {
      coverLetter: String,
      experienceLevel: String,
      availabilityStartDate: Date,
      specialNotes: String,
    },
    attachments: [
      {
        type: String,
        url: String,
        cloudinaryId: String,
        uploadedAt: Date,
      },
    ],
    isShortlisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    notes: String,
    viewedAt: Date,
    viewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shortlistedAt: Date,
    shortlistedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: Number,
    feedback: String,
    communication: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
applicationSchema.index({ castingCallId: 1, talentId: 1 }, { unique: true });
applicationSchema.index({ talentId: 1 });
applicationSchema.index({ castingDirectorId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ isShortlisted: 1 });
applicationSchema.index({ createdAt: -1 });

// Method to shortlist application
applicationSchema.methods.shortlist = async function(userId) {
  this.isShortlisted = true;
  this.status = 'shortlisted';
  this.shortlistedAt = new Date();
  this.shortlistedBy = userId;
  return this.save();
};

// Method to reject application
applicationSchema.methods.reject = async function(userId, reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedAt = new Date();
  this.rejectedBy = userId;
  return this.save();
};

// Method to mark as viewed
applicationSchema.methods.markAsViewed = async function(userId) {
  if (!this.viewedAt) {
    this.viewedAt = new Date();
    this.viewedBy = userId;
    this.status = 'viewed';
    return this.save();
  }
  return this;
};

// Method to add communication
applicationSchema.methods.addCommunication = async function(senderId, message) {
  this.communication.push({
    senderId,
    message,
    timestamp: new Date(),
  });
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);
