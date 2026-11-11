const { computeMatch, rankOpportunities, WEIGHTS } = require('../src/services/matchingService');

describe('NextOpp Deterministic Matching Engine', () => {
  const mockOpportunity = {
    _id: 'opp-1',
    title: 'Frontend Engineer Intern',
    organization: 'NextOpp Inc',
    category: 'internship',
    requiredSkills: ['javascript', 'react', 'css'],
    preferredSkills: ['typescript', 'tailwind'],
    workMode: 'remote',
    location: 'Bangalore',
    eligibility: {
      academicYears: ['3rd Year', '4th Year'],
      minGPA: 7.0,
      gpaScale: 10,
      graduationYearMin: 2025,
      graduationYearMax: 2027,
    },
  };

  test('calculates correct score for full match profile', () => {
    const studentProfile = {
      skills: [
        { skill: 'javascript', proficiency: 'advanced' },
        { skill: 'react', proficiency: 'advanced' },
        { skill: 'css', proficiency: 'advanced' },
        { skill: 'typescript', proficiency: 'intermediate' },
        { skill: 'tailwind', proficiency: 'intermediate' },
      ],
      education: {
        academicYear: '3rd Year',
        gpa: 8.5,
        gpaScale: 10,
        graduationYear: 2026,
      },
      careerInterests: ['frontend', 'react', 'web development'],
      preferences: {
        workModes: ['remote'],
        locations: ['Bangalore'],
        opportunityTypes: ['internship'],
      },
    };

    const result = computeMatch(studentProfile, mockOpportunity);

    expect(result.overallScore).toBeGreaterThanOrEqual(85);
    expect(result.components.requiredSkills.matched).toEqual(
      expect.arrayContaining(['javascript', 'react', 'css'])
    );
    expect(result.components.requiredSkills.missing).toHaveLength(0);
    expect(result.eligibility.status).toBe('eligible');
  });

  test('penalizes score when required skills are missing', () => {
    const studentProfile = {
      skills: [
        { skill: 'python', proficiency: 'advanced' },
      ],
      education: {
        academicYear: '3rd Year',
        gpa: 8.5,
        graduationYear: 2026,
      },
      preferences: {
        workModes: ['remote'],
      },
    };

    const result = computeMatch(studentProfile, mockOpportunity);

    expect(result.overallScore).toBeLessThan(50);
    expect(result.components.requiredSkills.missing).toHaveLength(3);
    expect(result.missingSkills.length).toBeGreaterThan(0);
  });

  test('flags ineligibility when student GPA is below required minimum', () => {
    const studentProfile = {
      skills: [{ skill: 'javascript' }, { skill: 'react' }, { skill: 'css' }],
      education: {
        academicYear: '3rd Year',
        gpa: 6.2, // Below 7.0
        gpaScale: 10,
        graduationYear: 2026,
      },
    };

    const result = computeMatch(studentProfile, mockOpportunity);

    expect(result.eligibility.status).toBe('ineligible');
    expect(result.eligibility.failures.some((f) => f.includes('GPA'))).toBe(true);
  });

  test('marks unknown eligibility when profile data is incomplete', () => {
    const studentProfile = {
      skills: [{ skill: 'javascript' }],
      education: {}, // No GPA or academic year
    };

    const result = computeMatch(studentProfile, mockOpportunity);

    expect(result.eligibility.status).toBe('unknown');
    expect(result.profileWarnings.length).toBeGreaterThan(0);
  });

  test('ranks opportunities strictly deterministically by score descending', () => {
    const studentProfile = {
      skills: [{ skill: 'javascript' }, { skill: 'react' }],
      education: { academicYear: '3rd Year', gpa: 8.0, graduationYear: 2026 },
      preferences: { workModes: ['remote'] },
    };

    const oppA = { ...mockOpportunity, _id: 'opp-a', requiredSkills: ['python', 'django'] };
    const oppB = { ...mockOpportunity, _id: 'opp-b', requiredSkills: ['javascript', 'react'] };

    const ranked = rankOpportunities(studentProfile, [oppA, oppB]);

    expect(ranked[0].opportunity._id).toBe('opp-b');
    expect(ranked[0].match.overallScore).toBeGreaterThan(ranked[1].match.overallScore);
  });

  test('recognizes Delhi NCR regional cluster matching (Delhi <-> Noida)', () => {
    const studentProfile = {
      skills: [{ skill: 'javascript' }, { skill: 'react' }, { skill: 'css' }],
      education: { academicYear: '3rd Year', gpa: 8.0, graduationYear: 2026 },
      preferences: {
        city: 'Delhi',
        locationMode: 'city_and_nearby',
        workModes: ['on-site', 'hybrid'],
      },
    };

    const noidaOpp = {
      ...mockOpportunity,
      _id: 'noida-opp',
      location: 'Noida, Uttar Pradesh',
      city: 'Noida',
      workMode: 'on-site',
    };

    const result = computeMatch(studentProfile, noidaOpp);
    expect(result.components.locationWorkMode.score).toBeGreaterThanOrEqual(80);
    expect(result.keyQuestions.locationAndMode).toContain('regional commuting cluster');
  });

  test('matches non-coding ideathons for students with ideation & problem-solving strengths', () => {
    const nonCodingStudent = {
      skills: [], // No coding skills
      education: { academicYear: '1st Year', gpa: 8.0, graduationYear: 2028 },
      preferences: {
        strengths: ['problem_solving', 'creative_ideas', 'research'],
        contributionStyles: ['ideas', 'problem_solving'],
        preferredTracks: ['ideathons', 'case_competitions'],
      },
    };

    const ideathonOpp = {
      _id: 'ideathon-1',
      title: 'Smart City Innovation Ideathon',
      organization: 'Ministry of Housing',
      category: 'hackathon',
      trackFormat: 'ideathon',
      requiresCoding: false,
      readinessLevel: 'Beginner Friendly',
      workMode: 'remote',
      eligibility: { academicYears: ['1st Year', '2nd Year'] },
    };

    const result = computeMatch(nonCodingStudent, ideathonOpp);
    expect(result.overallScore).toBeGreaterThan(60);
    expect(result.keyQuestions.requiresCoding).toContain('No — contribute through ideas');
    expect(result.keyQuestions.canBeginnerParticipate).toContain('Beginner Friendly');
  });
});
