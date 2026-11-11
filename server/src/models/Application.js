const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['applied', 'assessment', 'interviewing', 'offer', 'rejected', 'withdrawn'];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: APPLICATION_STATUSES, required: true },
    note: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'applied',
      index: true,
    },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 2000 },
    interviewDate: { type: Date },
    followUpDate: { type: Date },
    statusHistory: { type: [statusHistorySchema], default: [] },
    offerDetails: { type: String, trim: true },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Prevent duplicate active applications for same opportunity
applicationSchema.index({ user: 1, opportunity: 1 }, { unique: true });
applicationSchema.index({ user: 1, status: 1, appliedAt: -1 });

// Push to status history on status change
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
