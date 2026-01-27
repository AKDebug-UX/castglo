const mongoose = require('mongoose');

const castingCallSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Please provide a project name'],
    },
    projectType: {
      type: String,
      enum: ['film', 'tv', 'commercial', 'web_series', 'theater', 'music_video', 'other'],
      required: true,
    },
    budget: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    location: {
      city: String,
      state: String,
      country: String,
      remote: {
        type: Boolean,
        default: false,
      },
    },
    roles: [
      {
        title: String,
        description: String,
        numberOfPositions: Number,
        requiredSkills: [String],
        minExperience: String,
        preferredAge: {
          min: Number,
          max: Number,
        },
        ethnicity: [String],
        specialRequirements: String,
      },
    ],
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    shootDates: {
      startDate: Date,
      endDate: Date,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    status: {
      type: String,
      enum: ['open', 'filled', 'closed', 'cancelled'],
      default: 'open',
      index: true,
    },
    media: [
      {
        url: String,
        cloudinaryId: String,
        type: String,
        uploadedAt: Date,
      },
    ],
    applicantCount: {
      type: Number,
      default: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
    },
    requirements: {
      headshot: {
        type: Boolean,
        default: true,
      },
      resume: {
        type: Boolean,
        default: false,
      },
      demo: {
        type: Boolean,
        default: false,
      },
      union: {
        type: Boolean,
        default: false,
      },
    },
    compensationType: {
      type: String,
      enum: ['paid', 'unpaid', 'deferred', 'equity'],
      default: 'paid',
    },
    compensationAmount: Number,
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    viewCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      source: String,
      externalId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
castingCallSchema.index({ createdBy: 1 });
castingCallSchema.index({ status: 1 });
castingCallSchema.index({ deadline: 1 });
castingCallSchema.index({ projectType: 1 });
castingCallSchema.index({ createdAt: -1 });
castingCallSchema.index({ featured: 1, featuredUntil: 1 });

// Method to close casting call
castingCallSchema.methods.closeCastingCall = async function() {
  this.status = 'closed';
  return this.save();
};

// Method to check if deadline has passed
castingCallSchema.methods.isDeadlinePassed = function() {
  return new Date() > this.deadline;
};

// Method to increment view count
castingCallSchema.methods.incrementViewCount = async function() {
  return this.updateOne({ $inc: { viewCount: 1 } });
};

// Method to increment applicant count
castingCallSchema.methods.incrementApplicantCount = async function(count = 1) {
  return this.updateOne({ $inc: { applicantCount: count } });
};

module.exports = mongoose.model('CastingCall', castingCallSchema);
