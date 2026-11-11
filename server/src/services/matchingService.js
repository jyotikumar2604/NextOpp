/**
 * NextOpp Deterministic Matching Engine
 * 
 * Scores a student profile against an opportunity using configurable weights.
 * AI is never used to generate numerical scores.
 */

const WEIGHTS = {
  requiredSkills: 0.40,
  preferredSkills: 0.15,
  education: 0.15,
  experience: 0.10,   // proxied by career & project alignment
  careerInterest: 0.10,
  locationWorkMode: 0.10,
};

// Sensible Indian regional clusters
const REGIONAL_CLUSTERS = {
  'delhi ncr': ['delhi', 'new delhi', 'noida', 'greater noida', 'gurugram', 'gurgaon', 'ghaziabad', 'faridabad'],
  'mumbai mmr': ['mumbai', 'navi mumbai', 'thane', 'kalyan'],
  'bengaluru urban': ['bengaluru', 'bangalore', 'electronic city', 'whitefield'],
  'hyderabad cluster': ['hyderabad', 'secunderabad', 'cyberabad'],
  'pune cluster': ['pune', 'pimprichinchwad', 'pimpri-chinchwad', 'hinjewadi'],
  'chennai cluster': ['chennai', 'tambaram'],
  'kolkata cluster': ['kolkata', 'salt lake', 'new town'],
};

function normalizeCity(name) {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function findCluster(cityName) {
  const norm = normalizeCity(cityName);
  if (!norm) return null;
  for (const [cluster, cities] of Object.entries(REGIONAL_CLUSTERS)) {
    if (cities.some((c) => norm.includes(c) || c.includes(norm))) {
      return cluster;
    }
  }
  return null;
}

/**
 * Normalize a score to [0, 1]
 */
const clamp = (val) => Math.max(0, Math.min(1, val));

/**
 * Normalize skill strings for comparison
 */
const normalizeSkill = (s) => s.trim().toLowerCase().replace(/[^a-z0-9+#.\s]/g, '').trim();

/**
 * Find matched skills between student skills and opportunity skills arrays
 */
function matchSkills(studentSkills, opportunitySkills) {
  if (!opportunitySkills || opportunitySkills.length === 0) {
    return { matched: [], missing: [], score: 1, partial: false };
  }
  if (!studentSkills || studentSkills.length === 0) {
    return { matched: [], missing: [...opportunitySkills], score: 0, partial: false };
  }

  const normalizedStudent = studentSkills.map((s) =>
    typeof s === 'string' ? normalizeSkill(s) : normalizeSkill(s.skill || '')
  );

  const matched = [];
  const missing = [];

  for (const reqSkill of opportunitySkills) {
    const norm = normalizeSkill(reqSkill);
    const isMatch = normalizedStudent.some((s) => s === norm || s.includes(norm) || norm.includes(s));
    if (isMatch) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  }

  const score = opportunitySkills.length > 0 ? matched.length / opportunitySkills.length : 1;
  return { matched, missing, score: clamp(score), partial: missing.length > 0 && matched.length > 0 };
}

/**
 * Score education eligibility
 */
function scoreEducation(profile, opportunity) {
  const edu = profile.education || {};
  const elig = opportunity.eligibility || {};
  const reasons = [];
  let score = 1;

  // GPA check
  if (elig.minGPA != null && edu.gpa != null) {
    const studentGpa = elig.gpaScale ? (edu.gpa / (edu.gpaScale || 10)) * elig.gpaScale : edu.gpa;
    if (studentGpa < elig.minGPA) {
      reasons.push(`GPA ${edu.gpa.toFixed(2)} is below minimum ${elig.minGPA.toFixed(2)}`);
      score -= 0.4;
    }
  } else if (elig.minGPA != null && edu.gpa == null) {
    reasons.push('GPA not in your profile — eligibility unknown');
    score -= 0.1;
  }

  // Academic year check
  if (elig.academicYears && elig.academicYears.length > 0 && edu.academicYear) {
    if (!elig.academicYears.includes(edu.academicYear)) {
      reasons.push(`Academic year "${edu.academicYear}" may not meet requirement: ${elig.academicYears.join(', ')}`);
      score -= 0.3;
    }
  }

  // Graduation year range
  if (elig.graduationYearMin && edu.graduationYear) {
    if (edu.graduationYear < elig.graduationYearMin) {
      reasons.push(`Graduation year ${edu.graduationYear} is before minimum ${elig.graduationYearMin}`);
      score -= 0.3;
    }
  }
  if (elig.graduationYearMax && edu.graduationYear) {
    if (edu.graduationYear > elig.graduationYearMax) {
      reasons.push(`Graduation year ${edu.graduationYear} is after maximum ${elig.graduationYearMax}`);
      score -= 0.3;
    }
  }

  // Degree / branch checks (soft — not a hard blocker unless explicitly required)
  if (elig.degrees && elig.degrees.length > 0 && edu.degree) {
    const degreeMatch = elig.degrees.some(
      (d) => d.toLowerCase().includes(edu.degree.toLowerCase()) || edu.degree.toLowerCase().includes(d.toLowerCase())
    );
    if (!degreeMatch) {
      reasons.push(`Your degree "${edu.degree}" may not match: ${elig.degrees.join(', ')}`);
      score -= 0.15;
    }
  }

  return { score: clamp(score), reasons };
}

/**
 * Score career interest alignment
 */
function scoreCareerInterest(profile, opportunity) {
  const interests = (profile.careerInterests || []).map((i) => i.toLowerCase());
  const tags = (opportunity.tags || []).map((t) => t.toLowerCase());
  const category = opportunity.category?.toLowerCase();
  const requiredSkills = (opportunity.requiredSkills || []).map((s) => s.toLowerCase());

  if (interests.length === 0) return { score: 0.5, reason: 'Career interests not set' };

  let matches = 0;
  for (const interest of interests) {
    if (tags.some((t) => t.includes(interest) || interest.includes(t))) matches++;
    if (category && (category.includes(interest) || interest.includes(category))) matches++;
    if (requiredSkills.some((s) => s.includes(interest) || interest.includes(s))) matches++;
  }

  const score = clamp(matches / Math.max(interests.length, 1));
  return { score };
}

/**
 * Score location and work mode preferences with Indian regional clustering
 */
function scoreLocationWorkMode(profile, opportunity) {
  const prefs = profile.preferences || {};
  let score = 0.5; // neutral base
  let reason = 'Standard location alignment';

  const workMode = (opportunity.workMode || '').toLowerCase();
  const oppLoc = (opportunity.location || '').toLowerCase();
  const oppCity = (opportunity.city || '').toLowerCase();
  const studentCity = (prefs.city || profile.location || '').toLowerCase();
  const locationMode = prefs.locationMode || 'city_and_nearby';
  const willingToRelocate = Boolean(prefs.willingToRelocate);
  const workModePrefs = prefs.workModes || [];

  // Work mode scoring
  if (workMode === 'remote') {
    score = 0.92;
    reason = '100% Remote — fully accessible from your current location';
  } else if (studentCity && (oppCity || oppLoc)) {
    const oppCluster = findCluster(oppCity || oppLoc);
    const studentCluster = findCluster(studentCity);

    const isExactCity = oppLoc.includes(studentCity) || (oppCity && oppCity.includes(studentCity));
    const isSameCluster = oppCluster && studentCluster && oppCluster === studentCluster;

    if (isExactCity) {
      score = 1.0;
      reason = `Direct city match in ${prefs.city || profile.location}`;
    } else if (isSameCluster) {
      score = 0.88;
      const clusterDisplay = oppCluster.toUpperCase();
      reason = `Within your regional commuting cluster (${clusterDisplay})`;
    } else if (locationMode === 'only_my_city') {
      score = 0.15;
      reason = `On-site in ${opportunity.location || 'another city'} — outside your strict local preference`;
    } else if (willingToRelocate || locationMode === 'willing_to_relocate' || locationMode === 'anywhere_in_india') {
      score = 0.80;
      reason = `In ${opportunity.location || 'another city'} — matches willingness to relocate / travel`;
    } else {
      score = 0.40;
      reason = `In ${opportunity.location || 'different location'} — requires travel`;
    }
  } else if (workModePrefs.length > 0 && workMode) {
    if (workModePrefs.includes(workMode)) {
      score = 0.85;
      reason = `Matches your preferred ${workMode} work mode`;
    } else {
      score = 0.45;
      reason = `Offered as ${workMode}`;
    }
  }

  // Work mode compatibility adjustment
  if (workModePrefs.length > 0 && workMode && workMode !== 'remote') {
    if (!workModePrefs.includes(workMode)) {
      score = Math.max(0.1, score - 0.15);
    }
  }

  return { score: clamp(score), reason };
}

/**
 * Score contribution style and strengths alignment
 */
function scoreContributionStyle(profile, opportunity) {
  const prefs = profile.preferences || {};
  const studentStrengths = (prefs.strengths || []).map((s) => s.toLowerCase());
  const contributionStyles = (prefs.contributionStyles || []).map((c) => c.toLowerCase());
  const preferredTracks = (prefs.preferredTracks || []).map((t) => t.toLowerCase());

  let score = 0.5; // neutral when unselected
  let reason = 'General track match';

  const track = (opportunity.trackFormat || '').toLowerCase();
  const requiresCoding = opportunity.requiresCoding !== false; // default true if unspecified
  const requiresPrototype = Boolean(opportunity.requiresPrototype);
  const acceptedStyles = (opportunity.contributionStylesAccepted || []).map((s) => s.toLowerCase());

  const isIdeathonOrCase = [
    'ideathon', 'idea-challenge', 'innovation-challenge', 'business-case-competition',
    'product-case-competition', 'startup-challenge', 'design-challenge', 'non-coding-hackathon'
  ].includes(track) || !requiresCoding;

  const studentPrefersIdeas = contributionStyles.some((c) => ['ideas', 'problem_solving', 'research', 'design', 'pitching'].includes(c)) ||
    studentStrengths.some((s) => ['problem_solving', 'creative_ideas', 'research', 'business_strategy', 'design_creativity'].includes(s));

  const studentPrefersCode = contributionStyles.includes('building') || studentStrengths.includes('coding_implementation');

  if (isIdeathonOrCase && studentPrefersIdeas) {
    score = 0.95;
    reason = 'Strong fit: Ideation & problem-solving challenge — no coding barrier';
  } else if (!requiresCoding && !studentPrefersCode) {
    score = 0.90;
    reason = 'Idea & analytical submission track';
  } else if (requiresCoding && studentPrefersCode) {
    score = 0.90;
    reason = 'Technical build track matching your coding preference';
  } else if (requiresCoding && !studentPrefersCode && studentPrefersIdeas) {
    score = 0.35;
    reason = 'Requires software implementation/coding — may not suit non-coding preference';
  } else if (preferredTracks.length > 0 && track) {
    const trackMatch = preferredTracks.some((pt) => track.includes(pt) || pt.includes(track));
    if (trackMatch) {
      score = 0.85;
      reason = `Matches your preferred ${opportunity.trackFormat || 'track'} format`;
    }
  }

  return {
    score: clamp(score),
    reason,
    requiresCoding,
    requiresPrototype,
    isIdeathonOrCase,
  };
}

/**
 * Score compensation and exposure priority alignment
 */
function scoreCompensationAndExposure(profile, opportunity) {
  const prefs = profile.preferences || {};
  let score = 0.5;
  let reason = 'Standard compensation terms';

  const priority = prefs.opportunityPriority || 'flexible';
  const isPaid = Boolean(opportunity.isPaid);
  const hasStipend = Boolean(opportunity.compensationNumeric && opportunity.compensationNumeric > 0);
  const benefits = opportunity.benefits || [];
  const exposureBenefits = opportunity.exposureBenefits || {};

  if (priority === 'paid') {
    if (isPaid || hasStipend) {
      score = 0.95;
      reason = 'Verified paid role with financial stipend';
    } else {
      score = 0.20;
      reason = 'Unpaid / volunteer role — does not meet your paid preference';
    }
  } else if (priority === 'learning' || priority === 'skill_development') {
    const hasMentorship = exposureBenefits.mentorshipProvided || benefits.some((b) => /mentor|guidance/i.test(b));
    const hasCertificate = exposureBenefits.certificateProvided || benefits.some((b) => /certif/i.test(b));
    score = 0.85;
    if (hasMentorship || hasCertificate) {
      score = 0.95;
      reason = 'High learning value with verified mentorship & credentials';
    } else {
      reason = 'Practical hands-on industry exposure';
    }
  } else if (priority === 'company_experience' || priority === 'networking') {
    score = opportunity.isFeatured || opportunity.organization?.length > 0 ? 0.85 : 0.60;
    reason = `Professional exposure with ${opportunity.organization || 'host organization'}`;
  } else {
    // Flexible
    score = isPaid ? 0.90 : 0.70;
    reason = isPaid ? 'Paid opportunity' : 'Valuable for experience & exposure';
  }

  return { score: clamp(score), reason, isPaid, priority };
}

/**
 * Evaluate hard eligibility (pass/fail, not scored)
 */
function evaluateEligibility(profile, opportunity) {
  const edu = profile.education || {};
  const elig = opportunity.eligibility || {};
  const failures = [];
  const warnings = [];

  // GPA hard check
  if (elig.minGPA != null) {
    if (edu.gpa == null) {
      warnings.push('GPA not in profile — eligibility cannot be confirmed');
    } else {
      const studentGpa = elig.gpaScale
        ? (edu.gpa / (edu.gpaScale || 10)) * elig.gpaScale
        : edu.gpa;
      if (studentGpa < elig.minGPA) {
        failures.push(`Minimum GPA of ${elig.minGPA} required (yours: ${edu.gpa})`);
      }
    }
  }

  // Academic year hard check
  if (elig.academicYears && elig.academicYears.length > 0) {
    if (!edu.academicYear) {
      warnings.push('Academic year not in profile');
    } else if (!elig.academicYears.includes(edu.academicYear)) {
      failures.push(`Open to: ${elig.academicYears.join(', ')} (yours: ${edu.academicYear})`);
    }
  }

  // Graduation year range hard check
  if (elig.graduationYearMin && edu.graduationYear) {
    if (edu.graduationYear < elig.graduationYearMin) {
      failures.push(`Must graduate in/after ${elig.graduationYearMin}`);
    }
  }
  if (elig.graduationYearMax && edu.graduationYear) {
    if (edu.graduationYear > elig.graduationYearMax) {
      failures.push(`Must graduate by ${elig.graduationYearMax}`);
    }
  }

  let status = 'eligible';
  if (failures.length > 0) status = 'ineligible';
  else if (warnings.length > 0) status = 'unknown';

  return { status, failures, warnings };
}

/**
 * Compute profile completeness warnings
 */
function profileCompletenessWarnings(profile) {
  const warnings = [];
  if (!profile.education?.gpa) warnings.push('Add your GPA to improve eligibility checks');
  if (!profile.education?.academicYear) warnings.push('Add your academic year to improve matching');
  if (!profile.education?.graduationYear) warnings.push('Add your graduation year');
  if (!profile.skills || profile.skills.length === 0) warnings.push('Add skills to get skill match scores');
  if (!profile.careerInterests || profile.careerInterests.length === 0)
    warnings.push('Add career interests for better recommendations');
  if (!profile.preferences?.workModes || profile.preferences.workModes.length === 0)
    warnings.push('Set work mode preferences to refine recommendations');
  return warnings;
};

/**
 * Main match function
 * @param {Object} profile - StudentProfile document
 * @param {Object} opportunity - Opportunity document
 * @returns {Object} Full match result
 */
function computeMatch(profile, opportunity) {
  const profileWarnings = profileCompletenessWarnings(profile);
  const hasSkills = Boolean(profile.skills && profile.skills.length > 0);
  const hasEducation = Boolean(profile.education?.institution || profile.education?.degree || profile.education?.academicYear);
  const hasSufficientProfile = hasSkills && hasEducation;

  // Component scores
  // For skills, combine technical skills with strengths so non-coding opportunities match strengths fairly
  const allStudentSkillsAndStrengths = [
    ...(profile.skills || []),
    ...(profile.preferences?.strengths || []).map((s) => ({
      skill: s.toLowerCase().replace(/[-_]/g, ' '),
      proficiency: 'intermediate',
    })),
  ];

  const reqSkillResult = matchSkills(allStudentSkillsAndStrengths, opportunity.requiredSkills);
  const prefSkillResult = matchSkills(allStudentSkillsAndStrengths, opportunity.preferredSkills);
  const educationResult = scoreEducation(profile, opportunity);
  const careerResult = scoreCareerInterest(profile, opportunity);
  const locationResult = scoreLocationWorkMode(profile, opportunity);
  const contributionResult = scoreContributionStyle(profile, opportunity);
  const compensationResult = scoreCompensationAndExposure(profile, opportunity);

  const isBeginnerFriendly = [
    'Beginner Friendly', 'Open to Freshers', 'First-Year Friendly', 'Student Projects Accepted'
  ].includes(opportunity.readinessLevel || 'Beginner Friendly');

  const requiresCoding = opportunity.requiresCoding !== false;
  const isNonCodingTrack = !requiresCoding || contributionResult.isIdeathonOrCase;

  // Weighted composite score
  let compositeScore = 0;
  if (hasSkills) {
    const contributionBonus = (profile.preferences?.strengths?.length > 0 || profile.preferences?.contributionStyles?.length > 0)
      ? (careerResult.score * 0.5 + contributionResult.score * 0.5)
      : careerResult.score;

    if (isNonCodingTrack) {
      // Non-coding Ideathon or Case Challenge: evaluate based on strengths, contribution, education, and location
      compositeScore =
        (reqSkillResult.score > 0 ? reqSkillResult.score * 0.25 : 0) +
        contributionResult.score * 0.35 +
        educationResult.score * 0.20 +
        locationResult.score * 0.15 +
        compensationResult.score * 0.05;
    } else {
      compositeScore =
        reqSkillResult.score * WEIGHTS.requiredSkills +
        prefSkillResult.score * WEIGHTS.preferredSkills +
        educationResult.score * WEIGHTS.education +
        careerResult.score * WEIGHTS.experience +
        contributionBonus * WEIGHTS.careerInterest +
        locationResult.score * WEIGHTS.locationWorkMode;
    }
  } else if (hasEducation || (profile.preferences?.strengths && profile.preferences.strengths.length > 0)) {
    // Beginner / Zero-technical-skill mode:
    // If the opportunity is an ideathon, case competition, or beginner friendly, score based on
    // contribution style, education, location, and exposure without inventing skills!
    if (isNonCodingTrack || isBeginnerFriendly) {
      compositeScore =
        contributionResult.score * 0.40 +
        educationResult.score * 0.30 +
        locationResult.score * 0.20 +
        compensationResult.score * 0.10;
    } else {
      compositeScore = 0; // Honest 0 when hard technical skills are required but absent
    }
  }

  const overallScore = Math.round(clamp(compositeScore) * 100);

  // Eligibility check (hard pass/fail, independent of score)
  const eligibility = evaluateEligibility(profile, opportunity);

  // Recommendations
  const recommendations = [];
  if (reqSkillResult.missing.length > 0 && requiresCoding) {
    recommendations.push(
      `Learn ${reqSkillResult.missing.slice(0, 3).join(', ')} to meet required skill criteria.`
    );
  } else if (!requiresCoding) {
    recommendations.push('Prepare your idea presentation, problem statement analysis, and pitch deck.');
  }

  if (locationResult.reason) {
    recommendations.push(locationResult.reason);
  }
  if (profileWarnings.length > 0) {
    recommendations.push(profileWarnings[0]);
  }
  if (eligibility.status === 'ineligible') {
    recommendations.push('You may not meet the eligibility requirements — review before applying.');
  }

  // Key answers to the 7 core student questions
  const suitableText = overallScore >= 70
    ? 'High compatibility with your background, location, and contribution style.'
    : overallScore >= 45
      ? 'Moderate fit — good for exposure, exploration, or learning.'
      : 'Low direct alignment — check prerequisites.';

  const whyMatchText = isNonCodingTrack
    ? `Idea & problem-solving challenge in ${opportunity.location || 'remote'} matching your contribution style.`
    : reqSkillResult.matched.length > 0
      ? `Direct skill alignment with ${reqSkillResult.matched.slice(0, 3).join(', ')}.`
      : isBeginnerFriendly
        ? 'Beginner-friendly entry with no prior experience required.'
        : 'Opportunity in your field of study.';

  const beginnerText = isBeginnerFriendly
    ? `Yes — labeled "${opportunity.readinessLevel || 'Beginner Friendly'}" and open to freshers.`
    : opportunity.readinessLevel || 'Check experience prerequisites.';

  const codingText = requiresCoding
    ? 'Yes — software / code implementation required.'
    : 'No — contribute through ideas, problem-solving, design, research, or pitching.';

  const prototypeText = opportunity.requiresPrototype
    ? 'Working prototype required.'
    : 'Idea submission / presentation accepted without a working prototype.';

  const locationText = locationResult.reason || 'Check commute distance & work mode.';
  const compensationText = compensationResult.reason || 'Verified opportunity terms.';

  const nextActionText = requiresCoding && reqSkillResult.missing.length > 0
    ? `Brush up on ${reqSkillResult.missing[0]} before submitting application.`
    : isNonCodingTrack
      ? 'Form your team, select problem statement, and draft idea pitch deck.'
      : 'Review application portal and prepare resume / statement of purpose.';

  const keyQuestions = {
    suitableForMe: suitableText,
    suitability: suitableText,
    whyGoodMatch: whyMatchText,
    matchReason: whyMatchText,
    canBeginnerParticipate: beginnerText,
    requiresCoding: codingText,
    requiresCodingOrIdeas: codingText,
    isPrototypeRequired: prototypeText,
    locationAndMode: locationText,
    locationVerdict: locationText,
    compensationAndExposure: compensationText,
    compensationVerdict: compensationText,
    nextAction: nextActionText,
  };

  return {
    opportunityId: opportunity._id?.toString(),
    overallScore,
    hasSufficientProfile,
    hasSkills,
    eligibility,
    keyQuestions,
    readinessLevel: opportunity.readinessLevel || 'Beginner Friendly',
    requiresCoding,
    requiresPrototype: Boolean(opportunity.requiresPrototype),
    trackFormat: opportunity.trackFormat || 'tech-internship',
    components: {
      requiredSkills: {
        score: Math.round(reqSkillResult.score * 100),
        matched: reqSkillResult.matched,
        missing: reqSkillResult.missing,
        weight: WEIGHTS.requiredSkills,
      },
      preferredSkills: {
        score: Math.round(prefSkillResult.score * 100),
        matched: prefSkillResult.matched,
        missing: prefSkillResult.missing,
        weight: WEIGHTS.preferredSkills,
      },
      education: {
        score: Math.round(educationResult.score * 100),
        reasons: educationResult.reasons,
        weight: WEIGHTS.education,
      },
      careerAlignment: {
        score: Math.round(careerResult.score * 100),
        weight: WEIGHTS.careerInterest + WEIGHTS.experience,
      },
      locationWorkMode: {
        score: Math.round(locationResult.score * 100),
        reason: locationResult.reason,
        weight: WEIGHTS.locationWorkMode,
      },
      contributionFit: {
        score: Math.round(contributionResult.score * 100),
        reason: contributionResult.reason,
        weight: 0.10,
      },
    },
    missingSkills: [
      ...reqSkillResult.missing.map((s) => ({ skill: s, type: 'required' })),
      ...prefSkillResult.missing.map((s) => ({ skill: s, type: 'preferred' })),
    ],
    profileWarnings,
    recommendations,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Rank opportunities by match score for a given profile
 * @param {Object} profile
 * @param {Array} opportunities
 * @returns {Array} sorted opportunities with match data
 */
function rankOpportunities(profile, opportunities) {
  return opportunities
    .map((opp) => ({
      opportunity: opp,
      match: computeMatch(profile, opp),
    }))
    .sort((a, b) => b.match.overallScore - a.match.overallScore);
}

module.exports = { computeMatch, rankOpportunities, matchSkills };
