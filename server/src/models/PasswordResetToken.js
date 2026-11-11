const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: { type: String, required: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  used: { type: Boolean, default: false },
});

passwordResetTokenSchema.statics.createToken = async function (userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate previous tokens
  await this.deleteMany({ user: userId });

  await this.create({ user: userId, token, tokenHash, expiresAt });
  return token; // Return raw token to send in email
};

passwordResetTokenSchema.statics.verifyToken = async function (token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const doc = await this.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
    used: false,
  }).populate('user');
  return doc;
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
