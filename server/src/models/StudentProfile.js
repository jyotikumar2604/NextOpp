const mongoose = require('mongoose');

const studentSkillSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true, lowercase: true },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true },
  degree: { type: String, trim: true },
  branch: { type: String, trim: true },
  academicYear: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD', ''],
    default: '',
  },
  graduationYear: { type: Number },
  gpa: { type: Number, min: 0 },
  gpaScale: { type: Number, default: 10, min: 0 },
  location: { type: String, trim: true },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  link: { type: String, trim: true },
  role: { type: String, trim: true },
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  issueDate: { type: Date },
  credentialUrl: { type: String, trim: true },
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: { type: String, trim: true, maxlength: 500 },
    location: { type: String, trim: true },
    profileImage: { type: String },
    phone: { type: String, trim: true },

    education: { type: educationSchema, default: () => ({}) },

    skills: { type: [studentSkillSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },

    resume: {
      fileName: { type: String },
      fileUrl: { type: String },
      uploadedAt: { type: Date },
      parsedSkills: [{ type: String }],
      rawText: { type: String },
    },

    careerInterests: [{ type: String, trim: true }],
    careerGoals: { type: String, trim: true, maxlength: 1000 },

    links: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      portfolio: { type: String, trim: true },
    },

    preferences: {
      opportunityTypes: [
        {
          type: String,
          enum: ['internship', 'job', 'scholarship', 'hackathon', 'fellowship', 'research', 'competition'],
        },
      ],
      locations: [{ type: String, trim: true }],
      workModes: [{ type: String, enum: ['remote', 'hybrid', 'on-site', 'flexible'] }],
      compensationRequired: { type: Boolean, default: false },
      minCompensation: { type: Number },

      // Location & Regional Preferences
      country: { type: String, default: 'India', trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      preferredLocations: [{ type: String, trim: true }],
      willingToRelocate: { type: Boolean, default: false },
      locationMode: {
        type: String,
        enum: ['only_my_city', 'city_and_nearby', 'within_radius', 'anywhere_in_india', 'remote_only', 'willing_to_relocate'],
        default: 'city_and_nearby',
      },
      maxTravelRadiusKm: { type: Number, default: 50 },

      // Contribution Style & Strengths
      strengths: [{ type: String, trim: true }],
      contributionStyles: [{ type: String, trim: true }],
      preferredTracks: [{ type: String, trim: true }],

      // Compensation & Value Priorities
      opportunityPriority: {
        type: String,
        enum: ['paid', 'learning', 'company_experience', 'networking', 'skill_development', 'flexible'],
        default: 'flexible',
      },
      stipendFilter: {
        type: String,
        enum: ['any', 'paid_only', 'unpaid', 'performance_based', 'undisclosed'],
        default: 'any',
      },
      minStipend: { type: Number, default: 0 },
      exposurePriorities: [{ type: String, trim: true }],

      // Beginner Mode & Experience Profile
      isBeginner: { type: Boolean, default: false },
      semesterCompleted: { type: Number, min: 0, max: 12 },
      collegeActivities: [{ type: String, trim: true }],
      areasOfCuriosity: [{ type: String, trim: true }],
      enjoysNonCoding: { type: Boolean, default: false },
    },

    completionScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Virtual: compute profile completion honestly
studentProfileSchema.methods.computeCompletion = function () {
  const fields = [
    this.bio,
    this.location || this.preferences?.city,
    this.education?.institution,
    this.education?.degree,
    this.education?.branch,
    this.education?.academicYear,
    this.education?.graduationYear,
    this.education?.gpa,
    (this.skills && this.skills.length >= 1) || (this.preferences?.strengths && this.preferences.strengths.length >= 1),
    (this.skills && this.skills.length >= 3) || (this.preferences?.contributionStyles && this.preferences.contributionStyles.length >= 1),
    this.careerInterests && this.careerInterests.length > 0,
    this.careerGoals,
    this.links?.github || this.links?.linkedin || this.links?.portfolio || this.preferences?.opportunityPriority,
    this.preferences?.opportunityTypes && this.preferences.opportunityTypes.length > 0,
    this.preferences?.workModes && this.preferences.workModes.length > 0,
    (this.projects && this.projects.length > 0) || (this.experience && this.experience.length > 0) || (this.resume && this.resume.fileUrl) || (this.preferences?.collegeActivities && this.preferences.collegeActivities.length > 0),
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

// Pre-save hook to recalculate completion
studentProfileSchema.pre('save', function (next) {
  this.completionScore = this.computeCompletion();
  next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
