const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { parseResumeFile } = require('../services/resumeService');

// GET /api/profile
async function getProfile(req, res, next) {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
    }
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, profile, user: user ? user.toSafeObject() : null });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/profile
async function updateProfile(req, res, next) {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    const allowed = [
      'bio', 'location', 'phone', 'education', 'skills',
      'projects', 'experience', 'certifications', 'resume',
      'careerInterests', 'careerGoals', 'links', 'preferences'
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    }

    // Deduplicate skills
    if (profile.skills) {
      const seen = new Set();
      profile.skills = profile.skills.filter((s) => {
        const key = (typeof s === 'string' ? s : s.skill || '').toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    await profile.save();
    res.json({ success: true, message: 'Profile updated.', profile });
  } catch (err) {
    next(err);
  }
}

// POST /api/profile/onboarding — Complete full or step onboarding
async function saveOnboarding(req, res, next) {
  try {
    const { education, skills, projects, experience, certifications, interests, preferences, links, bio, location, isComplete } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    if (education !== undefined) profile.education = education;
    if (skills !== undefined) profile.skills = skills;
    if (projects !== undefined) profile.projects = projects;
    if (experience !== undefined) profile.experience = experience;
    if (certifications !== undefined) profile.certifications = certifications;
    if (interests !== undefined) profile.careerInterests = interests;
    if (preferences !== undefined) profile.preferences = preferences;
    if (links !== undefined) profile.links = links;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;

    // Deduplicate skills
    if (profile.skills) {
      const seen = new Set();
      profile.skills = profile.skills.filter((s) => {
        const key = (typeof s === 'string' ? s : s.skill || '').toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    await profile.save();

    // Update user onboarding state
    const userUpdates = {};
    if (isComplete) {
      userUpdates.isOnboarded = true;
      userUpdates.onboardingStep = 6;
    } else if (req.body.step) {
      userUpdates.onboardingStep = req.body.step;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true });

    res.json({
      success: true,
      message: isComplete ? 'Onboarding completed!' : 'Progress saved.',
      profile,
      user: updatedUser.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/profile/resume — Upload and parse resume
async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a resume file (PDF, DOCX, or TXT).' });
    }

    const parsed = await parseResumeFile(req.file);

    // Save resume meta onto profile without overwriting skills directly until confirmed
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.resume = {
        fileName: req.file.originalname,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
        uploadedAt: new Date(),
        parsedSkills: parsed.parsedSkills.map((s) => s.skill),
        rawText: parsed.textSnippet,
      };
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Resume uploaded and processed.',
      resume: {
        parsedSkills: parsed.parsedSkills.map((s) => s.skill),
        extractedData: parsed.extractedData || {},
        textSnippet: parsed.textSnippet,
      },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/profile/image
async function updateProfileImage(req, res, next) {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, message: 'No image URL provided.' });

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { profileImage: imageUrl },
      { new: true, upsert: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
}

// GET /api/profile/tips — AI profile improvement suggestions
async function getProfileTips(req, res, next) {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

    const result = await aiService.suggestProfileImprovements(profile);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  saveOnboarding,
  uploadResume,
  updateProfileImage,
  getProfileTips,
};
