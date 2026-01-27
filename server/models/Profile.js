const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['talent', 'casting_director', 'industry_professional'],
      required: true,
    },
    bio: {
      type: String,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    headline: {
      type: String,
      maxlength: [200, 'Headline cannot exceed 200 characters'],
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'hidden'],
      default: 'public',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Talent-specific fields
    talent: {
      headshots: [
        {
          url: String,
          cloudinaryId: String,
          uploadedAt: Date,
          isPrimary: Boolean,
        },
      ],
      showreel: {
        url: String,
        cloudinaryId: String,
        uploadedAt: Date,
        duration: Number,
      },
      skills: [String],
      experience: [
        {
          title: String,
          description: String,
          startDate: Date,
          endDate: Date,
          isCurrent: Boolean,
        },
      ],
      education: [
        {
          institution: String,
          field: String,
          degree: String,
          graduationYear: Number,
        },
      ],
      height: String,
      weight: String,
      ethnicity: [String],
      languages: [String],
      union: {
        type: Boolean,
        default: false,
      },
      unionAffiliation: String,
      tattoos: String,
      piercings: String,
      specialSkills: [String],
    },
    // Casting Director & Industry Professional-specific fields
    professional: {
      companyName: String,
      companyWebsite: String,
      companyDescription: String,
      companyLogo: {
        url: String,
        cloudinaryId: String,
      },
      pastProjects: [
        {
          title: String,
          description: String,
          year: Number,
          url: String,
        },
      ],
      creditedAs: String,
      yearsInIndustry: Number,
      specialization: [String],
      serviceOffered: [String],
    },
    // Social links
    socialLinks: {
      instagram: String,
      imdb: String,
      linkedin: String,
      twitter: String,
      website: String,
    },
    // Privacy & Preferences
    preferences: {
      emailNotifications: Boolean,
      smsNotifications: Boolean,
      jobNotifications: Boolean,
      messageNotifications: Boolean,
      profileSearchable: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
profileSchema.index({ userId: 1 });
profileSchema.index({ userRole: 1 });
profileSchema.index({ visibility: 1 });
profileSchema.index({ isVerified: 1 });
profileSchema.index({ rating: -1 });

// Method to calculate profile completion
profileSchema.methods.updateProfileCompletion = function() {
  let completionScore = 0;
  const maxFields = 10;

  if (this.bio) completionScore += 10;
  if (this.headline) completionScore += 10;
  if (this.location.city) completionScore += 10;
  if (this.profileCompletion > 0) completionScore += 10;

  if (this.userRole === 'talent') {
    if (this.talent.headshots.length > 0) completionScore += 10;
    if (this.talent.skills.length > 0) completionScore += 10;
    if (this.talent.experience.length > 0) completionScore += 10;
    if (this.talent.height && this.talent.weight) completionScore += 10;
    if (this.socialLinks.instagram || this.socialLinks.imdb) completionScore += 10;
  } else {
    if (this.professional.companyName) completionScore += 10;
    if (this.professional.companyDescription) completionScore += 10;
    if (this.professional.pastProjects.length > 0) completionScore += 10;
    if (this.professional.yearsInIndustry) completionScore += 10;
    if (this.socialLinks.linkedin || this.socialLinks.website) completionScore += 10;
  }

  this.profileCompletion = Math.min(completionScore, 100);
  return this.save();
};

module.exports = mongoose.model('Profile', profileSchema);
