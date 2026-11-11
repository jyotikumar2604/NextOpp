const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

// GET /api/applications
async function getApplications(req, res, next) {
  try {
    const { status, sort = 'newest', page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const sortObj = sort === 'deadline' ? {} : { appliedAt: -1 };

    const [total, applications] = await Promise.all([
      Application.countDocuments(filter),
      Application.find(filter)
        .populate('opportunity', 'title organization category deadline workMode location applicationUrl isFeatured')
        .sort(sortObj)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/:id
async function getApplication(req, res, next) {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id })
      .populate('opportunity')
      .lean();
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });
    res.json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
}

// POST /api/applications
async function createApplication(req, res, next) {
  try {
    const { opportunityId, notes, appliedAt } = req.body;

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    const existing = await Application.findOne({ user: req.user._id, opportunity: opportunityId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active application for this opportunity.',
        applicationId: existing._id,
      });
    }

    const application = await Application.create({
      user: req.user._id,
      opportunity: opportunityId,
      notes,
      appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
      statusHistory: [{ status: 'applied' }],
    });

    // Increment application count on opportunity
    await Opportunity.findByIdAndUpdate(opportunityId, { $inc: { applicationCount: 1 } });

    // Create deadline notification if deadline is within 7 days
    if (opp.deadline) {
      const daysUntilDeadline = (new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 7) {
        await Notification.create({
          user: req.user._id,
          type: 'deadline_reminder',
          title: 'Application deadline approaching',
          message: `${opp.title} closes in ${Math.ceil(daysUntilDeadline)} day(s).`,
          link: `/opportunities/${opportunityId}`,
          relatedOpportunity: opportunityId,
          relatedApplication: application._id,
        });
      }
    }

    await application.populate('opportunity', 'title organization category deadline');
    res.status(201).json({ success: true, message: 'Application tracked.', application });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/applications/:id
async function updateApplication(req, res, next) {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    const allowed = ['status', 'notes', 'interviewDate', 'followUpDate', 'offerDetails', 'rejectionReason'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) app[key] = req.body[key];
    }

    if (req.body.interviewDate) app.interviewDate = new Date(req.body.interviewDate);
    if (req.body.followUpDate) app.followUpDate = new Date(req.body.followUpDate);

    await app.save(); // pre-save hook adds status history

    // Notification on status change
    if (req.body.status && req.body.status !== app.status) {
      await Notification.create({
        user: req.user._id,
        type: 'application_update',
        title: 'Application status updated',
        message: `Your application status changed to "${req.body.status}".`,
        link: `/tracker`,
        relatedApplication: app._id,
      });
    }

    await app.populate('opportunity', 'title organization category deadline');
    res.json({ success: true, message: 'Application updated.', application: app });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/applications/:id
async function deleteApplication(req, res, next) {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

    await Opportunity.findByIdAndUpdate(app.opportunity, { $inc: { applicationCount: -1 } });
    res.json({ success: true, message: 'Application removed.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/stats
async function getStats(req, res, next) {
  try {
    const stats = await Application.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = {};
    for (const s of stats) statusCounts[s._id] = s.count;

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      stats: {
        total,
        byStatus: statusCounts,
        successRate: statusCounts.offer ? Math.round((statusCounts.offer / total) * 100) : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getApplications, getApplication, createApplication, updateApplication, deleteApplication, getStats };
