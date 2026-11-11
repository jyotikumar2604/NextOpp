const Opportunity = require('../models/Opportunity');
const SavedOpportunity = require('../models/SavedOpportunity');
const StudentProfile = require('../models/StudentProfile');
const { computeMatch, rankOpportunities } = require('../services/matchingService');
const { explainMatch, analyzeSkillGap } = require('../services/aiService');
const ModerationLog = require('../models/ModerationLog');

const PAGE_SIZE = 12;

// GET /api/opportunities
async function getOpportunities(req, res, next) {
  try {
    const {
      q,
      category,
      workMode,
      isPaid,
      deadline,
      sort,
      page = 1,
      limit = PAGE_SIZE,
      status,
      sourceName,
      location,
      city,
      regionCluster,
      readinessLevel,
      requiresCoding,
      trackFormat,
      compensationType,
      mentorship,
      certificate,
      ppo,
    } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = {};

    // Only admins can see non-published
    if (req.user?.role === 'admin' && status) {
      filter.status = status;
    } else {
      filter.status = 'published';
    }

    if (q) {
      filter.$text = { $search: q };
    }
    if (category) filter.category = category;
    if (workMode) filter.workMode = workMode;
    if (sourceName) filter.sourceName = sourceName;
    if (isPaid === 'true') filter.isPaid = true;
    if (isPaid === 'false') filter.isPaid = false;
    if (compensationType) filter.compensationType = compensationType;

    // Advanced Location filtering
    if (city) {
      filter.$or = [
        { city: new RegExp(city, 'i') },
        { location: new RegExp(city, 'i') },
      ];
    }
    if (regionCluster) {
      filter.regionCluster = new RegExp(regionCluster, 'i');
    }
    if (location && !city) {
      filter.$or = [
        { location: new RegExp(location, 'i') },
        { city: new RegExp(location, 'i') },
        { regionCluster: new RegExp(location, 'i') },
      ];
    }

    // Contribution & Track filters
    if (trackFormat) filter.trackFormat = trackFormat;
    if (requiresCoding === 'true') filter.requiresCoding = true;
    if (requiresCoding === 'false') filter.requiresCoding = false;

    // Readiness Level (Beginner Friendly)
    if (readinessLevel) {
      if (readinessLevel === 'beginner') {
        filter.readinessLevel = {
          $in: ['Beginner Friendly', 'Open to Freshers', 'First-Year Friendly', 'Student Projects Accepted'],
        };
      } else {
        filter.readinessLevel = readinessLevel;
      }
    }

    // Exposure benefits
    if (mentorship === 'true') filter['exposureBenefits.mentorshipProvided'] = true;
    if (certificate === 'true') filter['exposureBenefits.certificateProvided'] = true;
    if (ppo === 'true') filter['exposureBenefits.ppoOffered'] = true;

    if (deadline === 'week') {
      filter.deadline = { $gte: new Date(), $lte: new Date(Date.now() + 7 * 86400000) };
    } else if (deadline === 'month') {
      filter.deadline = { $gte: new Date(), $lte: new Date(Date.now() + 30 * 86400000) };
    } else if (deadline === 'active') {
      filter.deadline = { $gte: new Date() };
    }

    let sortObj = {};
    if (q && !sort) {
      sortObj = { score: { $meta: 'textScore' } };
    } else {
      switch (sort) {
        case 'deadline': sortObj = { deadline: 1 }; break;
        case 'compensation': sortObj = { compensationNumeric: -1 }; break;
        case 'newest': sortObj = { createdAt: -1 }; break;
        default: sortObj = { isFeatured: -1, createdAt: -1 };
      }
    }

    const totalQuery = Opportunity.countDocuments(filter);
    const oppsQuery = Opportunity.find(filter)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    if (q) {
      oppsQuery.select({ score: { $meta: 'textScore' } });
    }

    const [total, opportunities] = await Promise.all([totalQuery, oppsQuery]);

    // Attach saved status if user is authenticated
    let savedIds = new Set();
    if (req.user) {
      const saved = await SavedOpportunity.find({ user: req.user._id }).select('opportunity').lean();
      savedIds = new Set(saved.map((s) => s.opportunity.toString()));
    }

    const items = opportunities.map((opp) => ({
      ...opp,
      isSaved: savedIds.has(opp._id.toString()),
    }));

    res.json({
      success: true,
      opportunities: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/opportunities/:id
async function getOpportunity(req, res, next) {
  try {
    const opp = await Opportunity.findById(req.params.id).lean();
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    if (opp.status !== 'published' && req.user?.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    // Increment view count (fire-and-forget)
    Opportunity.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    let isSaved = false;
    if (req.user) {
      const saved = await SavedOpportunity.findOne({ user: req.user._id, opportunity: opp._id });
      isSaved = !!saved;
    }

    res.json({ success: true, opportunity: { ...opp, isSaved } });
  } catch (err) {
    next(err);
  }
}

// POST /api/opportunities — Admin only
async function createOpportunity(req, res, next) {
  try {
    const data = { ...req.body, postedBy: req.user._id };
    if (req.body.deadline) data.deadline = new Date(req.body.deadline);
    if (req.body.startDate) data.startDate = new Date(req.body.startDate);

    const opp = await Opportunity.create(data);

    await ModerationLog.create({
      admin: req.user._id,
      action: 'opportunity_created',
      targetType: 'opportunity',
      targetId: opp._id,
      note: `Created "${opp.title}"`,
    });

    res.status(201).json({ success: true, message: 'Opportunity created.', opportunity: opp });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/opportunities/:id — Admin only
async function updateOpportunity(req, res, next) {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    const before = opp.toObject();
    const allowed = [
      'title', 'organization', 'category', 'description', 'responsibilities',
      'requiredSkills', 'preferredSkills', 'tags', 'eligibility', 'location',
      'workMode', 'compensation', 'compensationNumeric', 'isPaid', 'deadline',
      'startDate', 'duration', 'applicationUrl', 'sourceUrl', 'benefits',
      'applicationInstructions', 'status', 'isVerified', 'isFeatured', 'reviewNote',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) opp[key] = req.body[key];
    }
    if (req.body.deadline) opp.deadline = new Date(req.body.deadline);

    // Track review info
    if (req.body.status === 'published' || req.body.status === 'rejected') {
      opp.reviewedBy = req.user._id;
      opp.reviewedAt = new Date();
    }

    await opp.save();

    await ModerationLog.create({
      admin: req.user._id,
      action: 'opportunity_updated',
      targetType: 'opportunity',
      targetId: opp._id,
      before: { status: before.status },
      after: { status: opp.status },
    });

    res.json({ success: true, message: 'Opportunity updated.', opportunity: opp });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/opportunities/:id — Admin only
async function deleteOpportunity(req, res, next) {
  try {
    const opp = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    await ModerationLog.create({
      admin: req.user._id,
      action: 'opportunity_deleted',
      targetType: 'opportunity',
      targetId: opp._id,
      note: `Deleted "${opp.title}"`,
    });

    res.json({ success: true, message: 'Opportunity deleted.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/opportunities/:id/match
async function getMatch(req, res, next) {
  try {
    const opp = await Opportunity.findById(req.params.id).lean();
    if (!opp || opp.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id }).lean();
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please complete your profile.' });
    }

    const matchResult = computeMatch(profile, opp);
    res.json({ success: true, match: matchResult });
  } catch (err) {
    next(err);
  }
}

// GET /api/opportunities/:id/explain — AI explanation
async function explainOpportunityMatch(req, res, next) {
  try {
    const opp = await Opportunity.findById(req.params.id).lean();
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

    const profile = await StudentProfile.findOne({ user: req.user._id }).lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const matchResult = computeMatch(profile, opp);

    const [explanation, skillGap] = await Promise.all([
      explainMatch(matchResult, opp, profile),
      analyzeSkillGap(matchResult, opp, profile),
    ]);

    res.json({
      success: true,
      match: matchResult,
      explanation,
      skillGap,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/opportunities/recommended — Personalized ranked list with beginner & contribution intelligence
async function getRecommended(req, res, next) {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id }).lean();
    const filter = { status: 'published', deadline: { $gte: new Date() } };

    // Apply preference filters
    if (profile?.preferences?.opportunityTypes?.length) {
      filter.category = { $in: profile.preferences.opportunityTypes };
    }

    const [opportunities, allBeginnerOpps] = await Promise.all([
      Opportunity.find(filter).limit(60).lean(),
      Opportunity.find({
        status: 'published',
        deadline: { $gte: new Date() },
        $or: [
          { readinessLevel: { $in: ['Beginner Friendly', 'Open to Freshers', 'First-Year Friendly', 'Student Projects Accepted'] } },
          { requiresCoding: false },
        ],
      }).limit(10).lean(),
    ]);

    const hasSkills = Boolean(profile?.skills && profile.skills.length > 0);
    const hasPreferences = Boolean(
      profile?.preferences?.strengths?.length > 0 ||
      profile?.preferences?.contributionStyles?.length > 0 ||
      profile?.education?.academicYear ||
      profile?.preferences?.city
    );

    // Format beginner opportunities for "Start From Where You Are"
    const beginnerOpportunities = allBeginnerOpps.map((opp) => {
      const match = profile ? computeMatch(profile, opp) : null;
      return {
        ...opp,
        matchScore: match ? match.overallScore : null,
        eligibilityStatus: match ? match.eligibility.status : 'eligible',
        keyQuestions: match?.keyQuestions,
        readinessBadge: opp.readinessLevel || 'Beginner Friendly',
        isNonCoding: !opp.requiresCoding,
      };
    });

    // Tailored "First 30 Days" Journey
    const contributionStyle = profile?.preferences?.contributionStyles?.[0] || 'ideas';
    const first30DaysJourney = [
      {
        day: 'Days 1–5',
        title: 'Define Your Strength Profile',
        description: 'Explore whether you prefer ideation, problem-solving, design, or building.',
        action: 'Review contribution styles in profile',
        link: '/profile',
      },
      {
        day: 'Days 6–15',
        title: contributionStyle === 'building' ? 'Build a Starter Project' : 'Enter an Ideathon or Case Challenge',
        description: contributionStyle === 'building'
          ? 'Pick a beginner hackathon or open-source repo with good first issues.'
          : 'Submit a 3-page problem statement presentation to an active innovation challenge.',
        action: 'Discover beginner roles',
        link: '/explore?readinessLevel=beginner',
      },
      {
        day: 'Days 16–25',
        title: 'Bridge Your First Target Gap',
        description: 'Review the skills breakdown on your saved opportunities and close one gap.',
        action: 'Check skill gaps on Today’s Move',
        link: '/dashboard',
      },
      {
        day: 'Days 26–30',
        title: 'First Application & Milestone',
        description: 'Submit your first verified application through the official portal and track it.',
        action: 'Open application tracker',
        link: '/tracker',
      },
    ];

    if (!hasSkills && !hasPreferences) {
      return res.json({
        success: true,
        isPersonalized: false,
        topMatch: null,
        opportunities: opportunities.slice(0, 10).map((opp) => ({
          ...opp,
          matchScore: null,
          eligibilityStatus: 'unknown',
          missingSkills: opp.requiredSkills || [],
          keyQuestions: null,
        })),
        beginnerOpportunities,
        first30DaysJourney,
        message: 'Complete your education, strengths, or skills to unlock tailored matches.',
      });
    }

    const ranked = rankOpportunities(profile || {}, opportunities);
    const topMatchCandidate = ranked[0];

    // If student has no technical skills but has strengths/education, check if top match is viable
    const isViableTopMatch = topMatchCandidate && (hasSkills || topMatchCandidate.match.overallScore >= 40);

    const topMatch = isViableTopMatch
      ? {
          ...topMatchCandidate.opportunity,
          matchScore: topMatchCandidate.match.overallScore,
          eligibilityStatus: topMatchCandidate.match.eligibility.status,
          matchedSkills: topMatchCandidate.match.components.requiredSkills.matched,
          missingSkills: topMatchCandidate.match.missingSkills.filter((s) => s.type === 'required').map((s) => s.skill),
          matchDetails: topMatchCandidate.match,
          keyQuestions: topMatchCandidate.match.keyQuestions,
        }
      : null;

    res.json({
      success: true,
      isPersonalized: Boolean(isViableTopMatch),
      isBeginnerMode: !hasSkills && hasPreferences,
      topMatch,
      opportunities: ranked.slice(0, 12).map(({ opportunity, match }) => ({
        ...opportunity,
        matchScore: match.overallScore,
        eligibilityStatus: match.eligibility.status,
        matchedSkills: match.components.requiredSkills.matched,
        missingSkills: match.missingSkills.filter((s) => s.type === 'required').map((s) => s.skill),
        keyQuestions: match.keyQuestions,
      })),
      beginnerOpportunities,
      first30DaysJourney,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMatch,
  explainOpportunityMatch,
  getRecommended,
};
