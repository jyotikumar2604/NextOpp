const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ['programming', 'framework', 'tool', 'soft-skill', 'domain', 'language', 'other'],
      default: 'other',
    },
    aliases: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });

module.exports = mongoose.model('Skill', skillSchema);
