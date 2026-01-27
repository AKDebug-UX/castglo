const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        'user_suspend',
        'user_unsuspend',
        'user_delete',
        'user_verify',
        'profile_approve',
        'profile_reject',
        'casting_call_remove',
        'application_review',
        'subscription_modify',
        'lead_convert',
        'content_moderate',
        'system_setting_change',
      ],
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'profile', 'casting_call', 'application', 'subscription', 'lead', 'system'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetEmail: String,
    reason: String,
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
adminActionLogSchema.index({ adminId: 1 });
adminActionLogSchema.index({ actionType: 1 });
adminActionLogSchema.index({ targetType: 1 });
adminActionLogSchema.index({ targetId: 1 });
adminActionLogSchema.index({ createdAt: -1 });
adminActionLogSchema.index({ severity: 1 });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);
