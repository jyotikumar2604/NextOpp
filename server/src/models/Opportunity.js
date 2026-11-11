const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    organization: { type: String, required: true, trim: true, index: 'text' },
    category: {
      type: String,
      required: true,
      enum: ['internship', 'job', 'scholarship', 'hackathon', 'fellowship', 'research', 'competition'],
      index: true,
    },
    description: { type: String, required: true, trim: true },
    responsibilities: [{ type: String, trim: true }],

    requiredSkills: [{ type: String, trim: true, lowercase: true }],
    preferredSkills: [{ type: String, trim: true, lowercase: true }],
    tags: [{ type: String, trim: true, lowercase: true }],

    eligibility: {
      minGPA: { type: Number, min: 0 },
      gpaScale: { type: Number, default: 10 },
      degrees: [{ type: String, trim: true }],
      branches: [{ type: String, trim: true }],
      academicYears: [
        {
          type: String,
          enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'],
        },
      ],
      graduationYearMin: { type: Number },
      graduationYearMax: { type: Number },
      locations: [{ type: String, trim: true }],
      notes: { type: String, trim: true },
    },

    location: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    regionCluster: { type: String, trim: true },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'on-site', 'flexible', ''],
      default: '',
    },

    readinessLevel: {
      type: String,
      enum: [
        'Beginner Friendly',
        'Open to Freshers',
        'First-Year Friendly',
        'Student Projects Accepted',
        'Skills Preferred',
        'Prior Experience Required',
        'Advanced / Experienced Candidates',
      ],
      default: 'Beginner Friendly',
      index: true,
    },
    requiresCoding: { type: Boolean, default: true, index: true },
    requiresPrototype: { type: Boolean, default: false },
    trackFormat: {
      type: String,
      enum: [
        'ideathon',
        'idea-challenge',
        'innovation-challenge',
        'business-case-competition',
        'product-case-competition',
        'startup-challenge',
        'research-challenge',
        'problem-solving-competition',
        'design-challenge',
        'non-coding-hackathon',
        'coding-hackathon',
        'open-innovation',
        'entrepreneurship-program',
        'research-internship',
        'pm-internship',
        'business-analyst-internship',
        'strategy-internship',
        'research-fellowship',
        'tech-internship',
        'other',
      ],
      default: 'tech-internship',
      index: true,
    },
    contributionStylesAccepted: [{ type: String, trim: true }],

    compensation: {
      type: String,
      trim: true,
    },
    compensationNumeric: { type: Number },
    compensationType: {
      type: String,
      enum: ['paid', 'unpaid', 'performance-based', 'undisclosed', 'stipend'],
      default: 'paid',
    },
    isPaid: { type: Boolean },
    exposureBenefits: {
      mentorshipProvided: { type: Boolean, default: false },
      certificateProvided: { type: Boolean, default: false },
      liveProjects: { type: Boolean, default: false },
      industryExposure: { type: Boolean, default: false },
      ppoOffered: { type: Boolean, default: false },
    },

    deadline: { type: Date, index: true },
    startDate: { type: Date },
    duration: { type: String, trim: true },

    applicationUrl: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    sourceName: { type: String, default: 'NextOpp Curated', trim: true },
    sourceId: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ['verified', 'unverified', 'demonstration', 'imported'],
      default: 'verified',
      index: true,
    },
    lastVerifiedAt: { type: Date, default: Date.now },
    dataFreshness: { type: String, default: 'Live' },
    benefits: [{ type: String, trim: true }],
    applicationInstructions: { type: String, trim: true },

    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected', 'archived'],
      default: 'draft',
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, trim: true },
    reviewedAt: { type: Date },

    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Full-text search index
opportunitySchema.index(
  { title: 'text', organization: 'text', description: 'text', requiredSkills: 'text', tags: 'text' },
  { weights: { title: 10, organization: 8, tags: 5, requiredSkills: 4, description: 1 } }
);
opportunitySchema.index({ category: 1, status: 1, deadline: 1 });
opportunitySchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
opportunitySchema.index({ sourceName: 1, verificationStatus: 1 });
opportunitySchema.index({ city: 1, regionCluster: 1, workMode: 1 });
opportunitySchema.index({ readinessLevel: 1, requiresCoding: 1, trackFormat: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
