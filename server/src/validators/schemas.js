const { z } = require('zod');

/**
 * Validate req.body against a Zod schema
 */
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Validate req.query against a Zod schema
 */
const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Auth schemas ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email').toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ─── Profile schemas ───────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  education: z
    .object({
      institution: z.string().max(200).optional(),
      degree: z.string().max(100).optional(),
      branch: z.string().max(100).optional(),
      academicYear: z.string().optional(),
      graduationYear: z.number().int().min(2000).max(2040).optional(),
      gpa: z.number().min(0).max(100).optional(),
      gpaScale: z.number().min(1).max(100).optional(),
      location: z.string().max(100).optional(),
    })
    .optional(),
  skills: z
    .array(
      z.object({
        skill: z.string().trim().min(1).max(100).toLowerCase(),
        proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
      })
    )
    .optional(),
  careerInterests: z.array(z.string().trim().max(100)).optional(),
  careerGoals: z.string().max(1000).optional(),
  links: z
    .object({
      github: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
      portfolio: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
  projects: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        link: z.string().optional().or(z.literal('')),
        role: z.string().optional(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        company: z.string().trim().min(1),
        location: z.string().optional(),
        startDate: z.any().optional(),
        endDate: z.any().optional(),
        current: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        issuer: z.string().trim().min(1),
        issueDate: z.any().optional(),
        credentialUrl: z.string().optional().or(z.literal('')),
      })
    )
    .optional(),
  resume: z.any().optional(),
  preferences: z
    .object({
      opportunityTypes: z.array(z.string()).optional(),
      locations: z.array(z.string().trim()).optional(),
      workModes: z.array(z.string()).optional(),
      compensationRequired: z.boolean().optional(),
      minCompensation: z.number().min(0).optional(),
      country: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      preferredLocations: z.array(z.string().trim()).optional(),
      willingToRelocate: z.boolean().optional(),
      locationMode: z.string().optional(),
      maxTravelRadiusKm: z.number().optional(),
      strengths: z.array(z.string()).optional(),
      contributionStyles: z.array(z.string()).optional(),
      preferredTracks: z.array(z.string()).optional(),
      opportunityPriority: z.string().optional(),
      stipendFilter: z.string().optional(),
      minStipend: z.number().optional(),
      exposurePriorities: z.array(z.string()).optional(),
      isBeginner: z.boolean().optional(),
      semesterCompleted: z.string().optional(),
      collegeActivities: z.array(z.string()).optional(),
      areasOfCuriosity: z.array(z.string()).optional(),
      enjoysNonCoding: z.boolean().optional(),
    })
    .passthrough()
    .optional(),
});

// ─── Opportunity schemas ───────────────────────────────────────────────────────

const opportunityQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  workMode: z.string().optional(),
  isPaid: z.string().optional(),
  deadline: z.string().optional(),
  sort: z.enum(['newest', 'deadline', 'compensation', 'relevance']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  status: z.string().optional(),
});

const createOpportunitySchema = z.object({
  title: z.string().trim().min(3).max(200),
  organization: z.string().trim().min(2).max(200),
  category: z.enum(['internship', 'job', 'scholarship', 'hackathon', 'fellowship', 'research', 'competition']),
  description: z.string().trim().min(50),
  responsibilities: z.array(z.string().trim()).optional(),
  requiredSkills: z.array(z.string().trim().toLowerCase()).optional(),
  preferredSkills: z.array(z.string().trim().toLowerCase()).optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  eligibility: z
    .object({
      minGPA: z.number().min(0).optional(),
      gpaScale: z.number().optional(),
      degrees: z.array(z.string().trim()).optional(),
      branches: z.array(z.string().trim()).optional(),
      academicYears: z.array(z.string()).optional(),
      graduationYearMin: z.number().int().optional(),
      graduationYearMax: z.number().int().optional(),
      locations: z.array(z.string().trim()).optional(),
      notes: z.string().trim().optional(),
    })
    .optional(),
  location: z.string().trim().optional(),
  workMode: z.enum(['remote', 'hybrid', 'on-site', 'flexible', '']).optional(),
  compensation: z.string().trim().optional(),
  compensationNumeric: z.number().optional(),
  isPaid: z.boolean().optional(),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.string().trim().optional(),
  applicationUrl: z.string().url().optional().or(z.literal('')),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  benefits: z.array(z.string().trim()).optional(),
  applicationInstructions: z.string().trim().optional(),
  status: z.enum(['draft', 'pending_review', 'published', 'rejected', 'archived']).optional(),
});

// ─── Application schemas ───────────────────────────────────────────────────────

const createApplicationSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  notes: z.string().max(2000).optional(),
  appliedAt: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['applied', 'assessment', 'interviewing', 'offer', 'rejected', 'withdrawn']).optional(),
  notes: z.string().max(2000).optional(),
  interviewDate: z.string().optional(),
  followUpDate: z.string().optional(),
  offerDetails: z.string().optional(),
  rejectionReason: z.string().optional(),
});

module.exports = {
  validateBody,
  validateQuery,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  opportunityQuerySchema,
  createOpportunitySchema,
  createApplicationSchema,
  updateApplicationSchema,
};
