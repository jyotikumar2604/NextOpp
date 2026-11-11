const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const PasswordResetToken = require('../models/PasswordResetToken');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sendTokenCookie(res, userId) {
  const token = signToken(userId);
  res.cookie('nextopp_token', token, COOKIE_OPTIONS);
  return token;
}

function clearTokenCookie(res) {
  res.clearCookie('nextopp_token', { path: '/' });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password });

    // Create empty profile
    await StudentProfile.create({ user: user._id });

    sendTokenCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      // Consistent timing to prevent user enumeration
      await new Promise((r) => setTimeout(r, 300));
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isLocked()) {
      return res.status(429).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Reset login attempts on success
    await user.updateOne({ $set: { loginAttempts: 0, lastLogin: new Date() }, $unset: { lockUntil: 1 } });

    sendTokenCookie(res, user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res) {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const token = await PasswordResetToken.createToken(user._id);

    // In production, send email here
    // For development, log the token
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 Password reset token for ${email}: ${token}`);
      console.log(`   Reset URL: ${process.env.CLIENT_URL}/reset-password?token=${token}`);
    }

    // TODO: Send reset email via nodemailer when EMAIL_* env vars are set
    // await emailService.sendPasswordReset(user.email, token);

    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    const resetDoc = await PasswordResetToken.verifyToken(token);
    if (!resetDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    resetDoc.user.password = password;
    await resetDoc.user.save();
    await resetDoc.updateOne({ used: true });

    clearTokenCookie(res);
    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword, changePassword };
