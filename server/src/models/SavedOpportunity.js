const mongoose = require('mongoose');

const savedOpportunitySchema = new mongoose.Schema(
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
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Prevent duplicate saves
savedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });
savedOpportunitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedOpportunity', savedOpportunitySchema);
