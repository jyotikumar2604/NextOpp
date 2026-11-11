const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const ModerationLog = require('../models/ModerationLog');
const SavedOpportunity = require('../models/SavedOpportunity');

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalStudents,
      totalOpportunities,
      publishedOpportunities,
      pendingOpportunities,
      totalApplications,
      totalSaved,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: 'published' }),
      Opportunity.countDocuments({ status: 'pending_review' }),
      Application.countDocuments(),
      SavedOpportunity.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean(),
    ]);

    // Application status breakdown
    const appStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const appByStatus = {};
    for (const s of appStats) appByStatus[s._id] = s.count;

    // Opportunity category breakdown
    const catStats = await Opportunity.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const oppByCategory = {};
    for (const s of catStats) oppByCategory[s._id] = s.count;

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, students: totalStudents },
        opportunities: { total: totalOpportunities, published: publishedOpportunities, pending: pendingOpportunities },
        applications: { total: totalApplications, byStatus: appByStatus },
        saved: totalSaved,
        byCategory: oppByCategory,
        recentUsers,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/opportunities
async function getOpportunities(req, res, next) {
  try {
    const { status, page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$text = { $search: q };

    const [total, opportunities] = await Promise.all([
      Opportunity.countDocuments(filter),
      Opportunity.find(filter)
        .populate('postedBy', 'name email')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      opportunities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users
async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .select('-password -loginAttempts -lockUntil')
        .lean(),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id
async function updateUser(req, res, next) {
  try {
    const { isActive, role } = req.body;
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found.' });

    // Cannot demote self
    if (target._id.toString() === req.user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }

    const before = { isActive: target.isActive, role: target.role };
    if (isActive !== undefined) target.isActive = isActive;
    if (role) target.role = role;
    await target.save();

    await ModerationLog.create({
      admin: req.user._id,
      action: isActive === false ? 'user_deactivated' : isActive === true ? 'user_reactivated' : 'user_role_changed',
      targetType: 'user',
      targetId: target._id,
      before,
      after: { isActive: target.isActive, role: target.role },
    });

    res.json({ success: true, message: 'User updated.', user: target.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/logs
async function getModerationLogs(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await ModerationLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await ModerationLog.countDocuments();
    res.json({ success: true, logs, pagination: { page: parseInt(page), total } });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/ingest/sources — List supported opportunity sources & API status
async function getIngestionSources(req, res, next) {
  try {
    const { getSupportedSources } = require('../services/ingestionService');
    const sources = getSupportedSources();
    res.json({ success: true, sources });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/ingest/batch — Ingest JSON batch of genuine opportunities
async function ingestOpportunitiesBatch(req, res, next) {
  try {
    const { ingestBatch } = require('../services/ingestionService');
    const items = req.body.opportunities || (Array.isArray(req.body) ? req.body : [req.body]);
    const defaultMeta = req.body.defaultMeta || {};

    const results = await ingestBatch(items, defaultMeta, req.user._id);

    await ModerationLog.create({
      admin: req.user._id,
      action: 'opportunities_ingested',
      targetType: 'opportunity',
      note: `Ingested ${results.imported} new, updated ${results.updated}, skipped ${results.skipped} opportunities`,
    });

    res.json({
      success: true,
      message: `Ingestion complete: ${results.imported} added, ${results.updated} refreshed.`,
      results,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  getOpportunities,
  getUsers,
  updateUser,
  getModerationLogs,
  getIngestionSources,
  ingestOpportunitiesBatch,
};
