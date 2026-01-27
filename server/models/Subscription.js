const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      required: true,
    },
    planDescription: String,
    pricePerMonth: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'suspended'],
      default: 'active',
      index: true,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePaymentMethodId: String,
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    renewalDate: Date,
    autoRenew: {
      type: Boolean,
      default: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    features: {
      maxCastingCallsPerMonth: Number,
      maxApplicationsPerMonth: Number,
      maxShortlists: Number,
      advancedAnalytics: Boolean,
      prioritySupport: Boolean,
      brandCustomization: Boolean,
      apiAccess: Boolean,
      bulkUpload: Boolean,
      videoHosting: Boolean,
      advancedFiltering: Boolean,
    },
    paymentHistory: [
      {
        amount: Number,
        currency: String,
        status: String,
        transactionId: String,
        date: Date,
        invoiceUrl: String,
      },
    ],
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: String,
    notes: String,
    promoCode: String,
    discount: {
      type: Number,
      default: 0,
    },
    nextBillingAmount: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ planName: 1 });
subscriptionSchema.index({ renewalDate: 1 });

// Method to cancel subscription
subscriptionSchema.methods.cancel = async function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  return this.save();
};

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && (!this.endDate || this.endDate > new Date());
};

// Method to renew subscription
subscriptionSchema.methods.renew = async function() {
  const monthFromNow = new Date();
  monthFromNow.setMonth(monthFromNow.getMonth() + 1);

  this.status = 'active';
  this.endDate = monthFromNow;
  this.renewalDate = monthFromNow;
  return this.save();
};

// Method to add payment to history
subscriptionSchema.methods.addPayment = async function(paymentData) {
  this.paymentHistory.push({
    amount: paymentData.amount,
    currency: paymentData.currency,
    status: paymentData.status,
    transactionId: paymentData.transactionId,
    date: new Date(),
    invoiceUrl: paymentData.invoiceUrl,
  });
  return this.save();
};

// Method to upgrade subscription
subscriptionSchema.methods.upgrade = async function(newPlan, newPrice) {
  this.planName = newPlan;
  this.pricePerMonth = newPrice;
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
