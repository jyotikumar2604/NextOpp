/**
 * Claude AI Service — Server-side only
 * Provides AI-powered explanations and insights.
 * Falls back to rule-based responses when API is unavailable.
 */

let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch {
  Anthropic = null;
}

const DEFAULT_MODEL = 'claude-3-haiku-20240307';
const MAX_TOKENS = 800;
const REQUEST_TIMEOUT_MS = 15000;

let client = null;
let isAvailable = false;

function initClient() {
  if (!Anthropic || !process.env.ANTHROPIC_API_KEY) {
    isAvailable = false;
    return;
  }
  try {
    client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: REQUEST_TIMEOUT_MS });
    isAvailable = true;
  } catch {
    isAvailable = false;
  }
}

initClient();

/**
 * Send a message to Claude with retry logic
 */
async function callClaude(systemPrompt, userMessage, maxRetries = 1) {
  if (!isAvailable || !client) {
    throw new Error('AI service unavailable');
  }

  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      return response.content[0]?.text || '';
    } catch (err) {
      lastErr = err;
      if (i < maxRetries) await sleep(1000 * (i + 1));
    }
  }
  throw lastErr;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Rule-based fallbacks ──────────────────────────────────────────────────────

function fallbackMatchExplanation(matchResult, opportunity) {
  const { overallScore, components, eligibility } = matchResult;
  const lines = [];

  lines.push(`**Match Score: ${overallScore}/100**`);

  if (eligibility.status === 'ineligible') {
    lines.push(`\n⚠️ **Eligibility concern:** ${eligibility.failures[0]}`);
  }

  if (components.requiredSkills.matched.length > 0) {
    lines.push(`\n✅ **Skill strengths:** You have ${components.requiredSkills.matched.length} of ${components.requiredSkills.matched.length + components.requiredSkills.missing.length} required skills: ${components.requiredSkills.matched.slice(0, 4).join(', ')}.`);
  }

  if (components.requiredSkills.missing.length > 0) {
    lines.push(`\n🔧 **Skill gaps:** Missing ${components.requiredSkills.missing.slice(0, 3).join(', ')}.`);
  }

  if (overallScore >= 75) {
    lines.push('\n🌟 Strong match — this opportunity aligns well with your profile.');
  } else if (overallScore >= 50) {
    lines.push('\n👍 Moderate match — some gaps to address before applying.');
  } else {
    lines.push('\n📈 Growing match — consider building more relevant skills first.');
  }

  return lines.join('\n');
}

function fallbackSkillGapAnalysis(matchResult) {
  const { missingSkills, components, recommendations } = matchResult;
  const lines = [];

  if (missingSkills.length === 0) {
    return 'Your skill profile covers all the listed requirements and preferred skills for this opportunity.';
  }

  const required = missingSkills.filter((s) => s.type === 'required');
  const preferred = missingSkills.filter((s) => s.type === 'preferred');

  if (required.length > 0) {
    lines.push(`**Required skills to develop:** ${required.map((s) => s.skill).join(', ')}`);
    lines.push('');
    lines.push('Suggested learning paths:');
    for (const s of required.slice(0, 3)) {
      lines.push(`- **${s.skill}**: Search for online courses, tutorials, or build a small project demonstrating this skill.`);
    }
  }

  if (preferred.length > 0) {
    lines.push('');
    lines.push(`**Nice-to-have skills:** ${preferred.map((s) => s.skill).slice(0, 4).join(', ')}`);
  }

  if (recommendations.length > 0) {
    lines.push('');
    lines.push('**Recommendations:**');
    for (const rec of recommendations.slice(0, 3)) {
      lines.push(`- ${rec}`);
    }
  }

  return lines.join('\n');
}

function fallbackProfileTips(profile) {
  const tips = [];
  const edu = profile.education || {};
  const skills = profile.skills || [];
  const interests = profile.careerInterests || [];

  if (skills.length < 5) tips.push('Add at least 5 skills to improve your match scores.');
  if (!edu.gpa) tips.push('Add your GPA to enable eligibility checks.');
  if (!edu.academicYear) tips.push('Specify your academic year for year-specific opportunities.');
  if (!edu.graduationYear) tips.push('Add your expected graduation year.');
  if (interests.length === 0) tips.push('Add career interests (e.g., "machine learning", "product management").');
  if (!profile.links?.github && !profile.links?.linkedin) tips.push('Add your GitHub or LinkedIn profile link.');
  if (!profile.preferences?.workModes?.length) tips.push('Set your work mode preferences (remote, hybrid, on-site).');
  if (!profile.bio) tips.push('Add a brief bio to your profile.');

  if (tips.length === 0) return 'Your profile looks well-completed! Keep it up to date as you gain new skills and experiences.';
  return tips.slice(0, 5).join('\n- ');
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Explain a match result for a specific opportunity
 */
async function explainMatch(matchResult, opportunity, profile) {
  if (!isAvailable) {
    return { text: fallbackMatchExplanation(matchResult, opportunity), source: 'rule-based' };
  }

  const system = `You are a helpful career advisor at NextOpp, an opportunity discovery platform for college students.
Be encouraging but honest. Use markdown for formatting. Keep responses under 250 words.
Never fabricate requirements not mentioned in the opportunity data. Never invent a probability of getting hired.`;

  const user = `Explain this match to the student:

**Opportunity:** ${opportunity.title} at ${opportunity.organization} (${opportunity.category})

**Match Score:** ${matchResult.overallScore}/100

**Required Skills Match:** ${matchResult.components.requiredSkills.score}/100
- Matched: ${matchResult.components.requiredSkills.matched.join(', ') || 'none'}
- Missing: ${matchResult.components.requiredSkills.missing.join(', ') || 'none'}

**Education Score:** ${matchResult.components.education.score}/100
**Career Alignment:** ${matchResult.components.careerAlignment.score}/100

**Eligibility:** ${matchResult.eligibility.status}${matchResult.eligibility.failures.length > 0 ? '\nIssues: ' + matchResult.eligibility.failures.join('; ') : ''}

Write a 3–4 sentence explanation for the student.`;

  try {
    const text = await callClaude(system, user);
    return { text, source: 'ai' };
  } catch {
    return { text: fallbackMatchExplanation(matchResult, opportunity), source: 'rule-based' };
  }
}

/**
 * Detailed skill gap analysis with learning recommendations
 */
async function analyzeSkillGap(matchResult, opportunity, profile) {
  if (!isAvailable) {
    return { text: fallbackSkillGapAnalysis(matchResult), source: 'rule-based' };
  }

  const system = `You are a career development advisor for college students.
Provide practical, actionable guidance. Use markdown. Keep responses under 300 words.`;

  const missing = matchResult.missingSkills;
  if (missing.length === 0) {
    return { text: 'Your skill profile covers all the listed requirements for this opportunity.', source: 'rule-based' };
  }

  const user = `Analyze skill gaps for a student applying to: ${opportunity.title} at ${opportunity.organization}

Missing skills:
${missing.map((s) => `- ${s.skill} (${s.type})`).join('\n')}

Student's current skills: ${(profile.skills || []).map((s) => (typeof s === 'string' ? s : s.skill)).join(', ') || 'Not specified'}

Provide:
1. Brief explanation of each gap's importance
2. Specific, actionable learning resources or project ideas for the top 3 gaps
3. A realistic timeline estimate`;

  try {
    const text = await callClaude(system, user);
    return { text, source: 'ai' };
  } catch {
    return { text: fallbackSkillGapAnalysis(matchResult), source: 'rule-based' };
  }
}

/**
 * Profile improvement suggestions
 */
async function suggestProfileImprovements(profile) {
  if (!isAvailable) {
    return { text: fallbackProfileTips(profile), source: 'rule-based' };
  }

  const system = `You are a career advisor helping college students optimize their profiles.
Be specific and actionable. Keep response under 200 words. Use bullet points.`;

  const user = `Suggest improvements for this student profile:

**Completion score:** ${profile.completionScore || 0}%
**Education:** ${profile.education?.degree || 'Not set'} in ${profile.education?.branch || 'Not set'}, Year ${profile.education?.academicYear || 'Not set'}
**GPA:** ${profile.education?.gpa || 'Not set'}
**Skills count:** ${(profile.skills || []).length}
**Career interests:** ${(profile.careerInterests || []).join(', ') || 'Not set'}
**Links:** GitHub: ${profile.links?.github ? 'Yes' : 'No'}, LinkedIn: ${profile.links?.linkedin ? 'Yes' : 'No'}
**Bio:** ${profile.bio ? 'Present' : 'Missing'}`;

  try {
    const text = await callClaude(system, user);
    return { text, source: 'ai' };
  } catch {
    return { text: fallbackProfileTips(profile), source: 'rule-based' };
  }
}

module.exports = {
  explainMatch,
  analyzeSkillGap,
  suggestProfileImprovements,
  isAIAvailable: () => isAvailable,
};
