const SavedOpportunity = require('../models/SavedOpportunity');
const Opportunity = require('../models/Opportunity');

// GET /api/saved
async function getSaved(req, res, next) {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));

    const filter = { user: req.user._id };
    const saved = await SavedOpportunity.find(filter)
      .populate({ path: 'opportunity', match: category ? { category } : {} })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out null (deleted opportunities)
    const valid = saved.filter((s) => s.opportunity);
    const total = valid.length;
    const paginated = valid.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Mark expired
    const now = new Date();
    const items = paginated.map((s) => ({
      ...s,
      isExpired: s.opportunity?.deadline && new Date(s.opportunity.deadline) < now,
    }));

    res.json({
      success: true,
      saved: items,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/opportunities/:id/save
async function saveOpportunity(req, res, next) {
  try {
    const { id } = req.params;

    const opp = await Opportunity.findOne({ _id: id, status: 'published' });
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    const existing = await SavedOpportunity.findOne({ user: req.user._id, opportunity: id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already saved.' });
    }

    await SavedOpportunity.create({ user: req.user._id, opportunity: id, notes: req.body.notes });
    await Opportunity.findByIdAndUpdate(id, { $inc: { saveCount: 1 } });

    res.status(201).json({ success: true, message: 'Opportunity saved.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/opportunities/:id/save
async function unsaveOpportunity(req, res, next) {
  try {
    const { id } = req.params;
    const result = await SavedOpportunity.findOneAndDelete({ user: req.user._id, opportunity: id });
    if (!result) return res.status(404).json({ success: false, message: 'Not saved.' });

    await Opportunity.findByIdAndUpdate(id, { $inc: { saveCount: -1 } });
    res.json({ success: true, message: 'Opportunity removed from saved.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSaved, saveOpportunity, unsaveOpportunity };
