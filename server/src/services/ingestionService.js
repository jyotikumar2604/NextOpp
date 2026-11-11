/**
 * NextOpp Opportunity Ingestion Service
 * 
 * Modular service for importing, validating, normalizing, and attributing
 * opportunities from legitimate sources (Unstop, Internshala, AICTE, Company Career Portals, NextOpp Curated).
 */

const Opportunity = require('../models/Opportunity');

const SUPPORTED_SOURCES = [
  {
    id: 'unstop',
    name: 'Unstop',
    categoryCoverage: ['hackathon', 'competition', 'internship', 'scholarship'],
    description: 'Premier student platform for competitions, hackathons, and corporate internships in India.',
    integrationType: 'Authorized Feed & Verified Batch Import',
    status: 'configured',
    authRequirement: 'Requires enterprise partner API token for live stream. Currently accepting verified batch imports.',
    supportedFields: ['title', 'organization', 'category', 'deadline', 'eligibility', 'compensation', 'skills', 'applicationUrl'],
  },
  {
    id: 'internshala',
    name: 'Internshala',
    categoryCoverage: ['internship', 'job'],
    description: 'Leading platform for college internships and fresher job opportunities.',
    integrationType: 'Partner Feed & Verified Batch Import',
    status: 'configured',
    authRequirement: 'Requires verified employer/partner credential. Batch import active.',
    supportedFields: ['title', 'organization', 'duration', 'compensation', 'skills', 'deadline', 'workMode'],
  },
  {
    id: 'aicte',
    name: 'AICTE Internship Portal',
    categoryCoverage: ['internship', 'research', 'fellowship'],
    description: 'Government technical education internship portal for engineering and degree college students.',
    integrationType: 'Public Feed & Verified Import',
    status: 'active',
    authRequirement: 'Direct integration via verified portal listings.',
    supportedFields: ['title', 'organization', 'location', 'duration', 'eligibility', 'stipend', 'deadline'],
  },
  {
    id: 'company_portals',
    name: 'Direct Company Career Pages',
    categoryCoverage: ['internship', 'job', 'fellowship'],
    description: 'Official student opportunities from corporate career systems (Google, Microsoft, Atlassian, Infosys, etc.).',
    integrationType: 'Verified Direct Ingestion',
    status: 'active',
    authRequirement: 'Official public career portal URLs with verification review.',
    supportedFields: ['title', 'organization', 'description', 'responsibilities', 'skills', 'eligibility', 'applicationUrl'],
  },
  {
    id: 'nextopp_curated',
    name: 'NextOpp Curated & Verified',
    categoryCoverage: ['scholarship', 'fellowship', 'research', 'hackathon'],
    description: 'Hand-vetted opportunities verified by NextOpp career moderators.',
    integrationType: 'Moderator Pipeline',
    status: 'active',
    authRequirement: 'Internal administrative moderation.',
    supportedFields: ['all'],
  },
];

/**
 * Validate and normalize incoming opportunity data
 */
function normalizeOpportunity(raw, defaultMeta = {}) {
  if (!raw.title || typeof raw.title !== 'string') {
    throw new Error('Opportunity title is mandatory');
  }
  if (!raw.organization || typeof raw.organization !== 'string') {
    throw new Error('Organization name is mandatory');
  }

  const validCategories = ['internship', 'job', 'scholarship', 'hackathon', 'fellowship', 'research', 'competition'];
  let category = (raw.category || defaultMeta.category || 'internship').toLowerCase().trim();
  if (!validCategories.includes(category)) {
    category = 'internship';
  }

  const validWorkModes = ['remote', 'hybrid', 'on-site', 'flexible', ''];
  let workMode = (raw.workMode || '').toLowerCase().trim();
  if (!validWorkModes.includes(workMode)) {
    workMode = 'flexible';
  }

  // Normalize skills
  const cleanSkills = (skills) => {
    if (!skills) return [];
    const list = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    return [...new Set(list.map((s) => s.toLowerCase().trim()).filter(Boolean))];
  };

  const requiredSkills = cleanSkills(raw.requiredSkills);
  const preferredSkills = cleanSkills(raw.preferredSkills);
  const tags = cleanSkills(raw.tags || [category, workMode, ...(raw.location ? [raw.location.toLowerCase()] : [])]);

  // Clean dates
  let deadline = null;
  if (raw.deadline) {
    const d = new Date(raw.deadline);
    if (!isNaN(d.getTime())) deadline = d;
  }

  let startDate = null;
  if (raw.startDate) {
    const d = new Date(raw.startDate);
    if (!isNaN(d.getTime())) startDate = d;
  }

  // Normalize compensation
  let compensation = raw.compensation || '';
  let compensationNumeric = raw.compensationNumeric != null ? Number(raw.compensationNumeric) : undefined;
  let isPaid = raw.isPaid !== undefined ? Boolean(raw.isPaid) : Boolean(compensation && compensation !== 'Unpaid');

  // Attribution
  const sourceName = raw.sourceName || defaultMeta.sourceName || 'NextOpp Curated';
  const sourceUrl = raw.sourceUrl || raw.applicationUrl || '';
  const sourceId = raw.sourceId ? String(raw.sourceId).trim() : undefined;
  const verificationStatus = raw.verificationStatus || defaultMeta.verificationStatus || 'verified';

  return {
    title: raw.title.trim(),
    organization: raw.organization.trim(),
    category,
    description: raw.description ? raw.description.trim() : `${raw.title} opportunity at ${raw.organization}.`,
    responsibilities: Array.isArray(raw.responsibilities)
      ? raw.responsibilities
      : typeof raw.responsibilities === 'string'
      ? raw.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
      : [],
    requiredSkills,
    preferredSkills,
    tags,
    eligibility: {
      minGPA: raw.eligibility?.minGPA != null ? Number(raw.eligibility.minGPA) : undefined,
      gpaScale: raw.eligibility?.gpaScale ? Number(raw.eligibility.gpaScale) : 10,
      degrees: Array.isArray(raw.eligibility?.degrees) ? raw.eligibility.degrees : [],
      branches: Array.isArray(raw.eligibility?.branches) ? raw.eligibility.branches : [],
      academicYears: Array.isArray(raw.eligibility?.academicYears) ? raw.eligibility.academicYears : [],
      graduationYearMin: raw.eligibility?.graduationYearMin ? Number(raw.eligibility.graduationYearMin) : undefined,
      graduationYearMax: raw.eligibility?.graduationYearMax ? Number(raw.eligibility.graduationYearMax) : undefined,
      locations: Array.isArray(raw.eligibility?.locations) ? raw.eligibility.locations : [],
      notes: raw.eligibility?.notes || '',
    },
    location: raw.location ? raw.location.trim() : 'India / Remote',
    workMode,
    compensation,
    compensationNumeric,
    isPaid,
    deadline,
    startDate,
    duration: raw.duration || '3 months',
    applicationUrl: raw.applicationUrl || raw.sourceUrl || '',
    sourceUrl,
    sourceName,
    sourceId,
    verificationStatus,
    lastVerifiedAt: new Date(),
    dataFreshness: 'Verified Live',
    benefits: Array.isArray(raw.benefits)
      ? raw.benefits
      : typeof raw.benefits === 'string'
      ? raw.benefits.split(',').map((b) => b.trim()).filter(Boolean)
      : [],
    applicationInstructions: raw.applicationInstructions || 'Apply through official source portal.',
    status: raw.status || 'published',
    isVerified: verificationStatus === 'verified',
    isFeatured: Boolean(raw.isFeatured),
  };
}

/**
 * Ingest an array of opportunity records with deduplication
 */
async function ingestBatch(records, defaultMeta = {}, adminUserId = null) {
  const results = {
    total: records.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < records.length; i++) {
    try {
      const normalized = normalizeOpportunity(records[i], defaultMeta);
      if (adminUserId) normalized.postedBy = adminUserId;

      // Duplicate detection query:
      // 1. By sourceId + sourceName (if sourceId is given)
      // 2. By sourceUrl (if unique)
      // 3. By exact title + organization
      let existing = null;
      if (normalized.sourceId) {
        existing = await Opportunity.findOne({
          sourceName: normalized.sourceName,
          sourceId: normalized.sourceId,
        });
      }
      if (!existing && normalized.sourceUrl && normalized.sourceUrl !== '') {
        existing = await Opportunity.findOne({ sourceUrl: normalized.sourceUrl });
      }
      if (!existing) {
        existing = await Opportunity.findOne({
          title: new RegExp(`^${normalized.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
          organization: new RegExp(`^${normalized.organization.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });
      }

      if (existing) {
        // Update freshness, deadline, and verification without destroying existing metrics
        existing.deadline = normalized.deadline || existing.deadline;
        existing.lastVerifiedAt = new Date();
        existing.dataFreshness = 'Verified Live';
        existing.sourceName = normalized.sourceName;
        existing.verificationStatus = normalized.verificationStatus;
        if (normalized.requiredSkills.length > 0) existing.requiredSkills = normalized.requiredSkills;
        await existing.save();
        results.updated++;
      } else {
        await Opportunity.create(normalized);
        results.imported++;
      }
    } catch (err) {
      results.skipped++;
      results.errors.push({ index: i, title: records[i]?.title, error: err.message });
    }
  }

  return results;
}

/**
 * Return list of supported ingestion sources and their real status
 */
function getSupportedSources() {
  return SUPPORTED_SOURCES;
}

module.exports = {
  SUPPORTED_SOURCES,
  getSupportedSources,
  normalizeOpportunity,
  ingestBatch,
};

