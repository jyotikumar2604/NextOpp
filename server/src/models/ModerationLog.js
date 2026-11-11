const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'opportunity_created',
        'opportunity_published',
        'opportunity_rejected',
        'opportunity_archived',
        'opportunity_updated',
        'opportunity_deleted',
        'user_deactivated',
        'user_reactivated',
        'user_role_changed',
      ],
      required: true,
    },
    targetType: { type: String, enum: ['opportunity', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    note: { type: String, trim: true },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

moderationLogSchema.index({ admin: 1, createdAt: -1 });
moderationLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
