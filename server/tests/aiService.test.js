const { explainMatch, analyzeSkillGap, suggestProfileImprovements } = require('../src/services/aiService');
const { computeMatch } = require('../src/services/matchingService');

describe('AI Service & Rule-Based Fallbacks', () => {
  const mockOpportunity = {
    title: 'Full Stack Engineer',
    organization: 'InnovateTech',
    category: 'internship',
    requiredSkills: ['javascript', 'react', 'node.js'],
  };

  const mockProfile = {
    completionScore: 60,
    education: { degree: 'B.Tech', branch: 'Computer Science', academicYear: '3rd Year' },
    skills: [{ skill: 'javascript' }],
    careerInterests: ['web development'],
  };

  test('falls back transparently to rule-based explanation without throwing error', async () => {
    const matchResult = computeMatch(mockProfile, mockOpportunity);
    const explanation = await explainMatch(matchResult, mockOpportunity, mockProfile);

    expect(explanation).toBeDefined();
    expect(explanation.source).toBe('rule-based');
    expect(explanation.text).toContain('Match Score:');
  });

  test('analyzes skill gap with rule-based recommendations when AI unavailable', async () => {
    const matchResult = computeMatch(mockProfile, mockOpportunity);
    const skillGap = await analyzeSkillGap(matchResult, mockOpportunity, mockProfile);

    expect(skillGap).toBeDefined();
    expect(skillGap.source).toBe('rule-based');
    expect(skillGap.text).toContain('Required skills to develop');
  });

  test('suggests profile improvements with rule-based analysis', async () => {
    const tips = await suggestProfileImprovements(mockProfile);

    expect(tips).toBeDefined();
    expect(tips.source).toBe('rule-based');
    expect(tips.text.length).toBeGreaterThan(10);
  });
});
