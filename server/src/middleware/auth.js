const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT from HTTP-only cookie and attach user to req
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.nextopp_token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid session. Please log in again.' });
    }

    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    if (user.passwordChangedAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: 'Password was changed. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Administrator access required.' });
  }
  next();
};

/**
 * Optionally attach user if token is present (for public routes with personalization)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.nextopp_token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
    next();
  } catch {
    next(); // Silently continue without auth
  }
};

module.exports = { authenticate, requireAdmin, optionalAuth };
