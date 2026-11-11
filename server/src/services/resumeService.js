/**
 * NextOpp Resume Parsing Service
 * 
 * Extracts skills, education, and links from uploaded resumes.
 * Uses deterministic dictionary matching with optional Claude AI assistance.
 * Never invents skills or credentials. Returns candidates for student review.
 */

const fs = require('fs');
const path = require('path');

// Canonical skills lexicon
const SKILLS_LEXICON = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'react', 'next.js', 'vue', 'angular', 'svelte', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring boot',
  'html', 'css', 'tailwind css', 'bootstrap', 'sass', 'redux', 'graphql', 'rest api', 'websockets',
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'firebase', 'supabase', 'prisma', 'mongoose',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'git', 'github', 'gitlab', 'ci/cd', 'nginx',
  'machine learning', 'deep learning', 'data science', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'opencv',
  'nlp', 'computer vision', 'data analysis', 'sql', 'power bi', 'tableau',
  'figma', 'ui/ux', 'wireframing', 'user research', 'agile', 'scrum', 'jira',
  'flutter', 'react native', 'android', 'ios'
];

/**
 * Deterministic text extraction from plain text, markdown, or text-buffered files
 */
function extractTextFromFile(filePath, mimeType) {
  try {
    const buffer = fs.readFileSync(filePath);
    // For standard text/plain or raw buffers:
    const content = buffer.toString('utf-8');
    // Basic sanitization
    return content.replace(/[^\x20-\x7E\t\n\r]/g, ' ');
  } catch (err) {
    console.error('Failed to read file buffer:', err.message);
    return '';
  }
}

/**
 * Deterministic extraction using regex and skill catalog
 */
function extractDeterministic(text) {
  const lower = text.toLowerCase();
  
  // 1. Skill extraction
  const foundSkills = [];
  for (const skill of SKILLS_LEXICON) {
    // Regex boundary matching that handles special tokens like c++, c#, .js, and plural forms
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-zA-Z0-9+#])${escaped}(?:s)?(?![a-zA-Z0-9+#])`, 'i');
    if (regex.test(lower)) {
      foundSkills.push({ skill, proficiency: 'intermediate' });
    }
  }

  // 2. Education extraction
  const edu = {};
  
  // Degree detection
  if (/b\.?\s?tech|bachelor of technology/i.test(text)) edu.degree = 'B.Tech';
  else if (/b\.?\s?e|bachelor of engineering/i.test(text)) edu.degree = 'B.E.';
  else if (/b\.?\s?s|bachelor of science/i.test(text)) edu.degree = 'B.S.';
  else if (/m\.?\s?tech|master of technology/i.test(text)) edu.degree = 'M.Tech';
  else if (/m\.?\s?s|master of science/i.test(text)) edu.degree = 'M.S.';
  else if (/bca|bachelor of computer applications/i.test(text)) edu.degree = 'BCA';
  else if (/mca|master of computer applications/i.test(text)) edu.degree = 'MCA';

  // Branch detection
  if (/computer science|cse/i.test(text)) edu.branch = 'Computer Science & Engineering';
  else if (/information technology|it/i.test(text)) edu.branch = 'Information Technology';
  else if (/data science/i.test(text)) edu.branch = 'Data Science';
  else if (/artificial intelligence|ai/i.test(text)) edu.branch = 'Artificial Intelligence';
  else if (/electronics|ece/i.test(text)) edu.branch = 'Electronics & Communication';
  else if (/mechanical/i.test(text)) edu.branch = 'Mechanical Engineering';
  else if (/electrical/i.test(text)) edu.branch = 'Electrical Engineering';

  // Graduation year (look for 202X or 203X)
  const gradMatch = text.match(/\b(202[4-9]|203[0-5])\b/);
  if (gradMatch) {
    edu.graduationYear = parseInt(gradMatch[1], 10);
  }

  // CGPA / GPA detection (e.g. "CGPA: 8.9", "GPA: 3.8/4.0", "8.75 / 10")
  const gpaMatch = text.match(/(?:cgpa|gpa|score)[\s:=]*([0-9]\.?[0-9]{0,2})/i);
  if (gpaMatch && parseFloat(gpaMatch[1]) <= 10) {
    edu.gpa = parseFloat(gpaMatch[1]);
    edu.gpaScale = edu.gpa <= 4.0 ? 4 : 10;
  }

  // Academic year estimation based on graduation year if available
  if (edu.graduationYear) {
    const currentYear = new Date().getFullYear();
    const diff = edu.graduationYear - currentYear;
    if (diff === 0) edu.academicYear = '4th Year';
    else if (diff === 1) edu.academicYear = '3rd Year';
    else if (diff === 2) edu.academicYear = '2nd Year';
    else if (diff >= 3) edu.academicYear = '1st Year';
  }

  // 3. Links
  const links = {};
  const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-_]+)/i);
  if (githubMatch) links.github = `https://${githubMatch[0]}`;

  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  if (linkedinMatch) links.linkedin = `https://${linkedinMatch[0]}`;

  return {
    skills: foundSkills,
    education: edu,
    links,
    source: 'deterministic-parser',
  };
}

/**
 * Main parse resume function
 */
async function parseResumeFile(file) {
  if (!file) throw new Error('No file provided for parsing');

  const rawText = extractTextFromFile(file.path, file.mimetype);
  const parsed = extractDeterministic(rawText);

  // Snippet preview (first 400 chars)
  const textSnippet = rawText.slice(0, 400).trim();

  return {
    fileName: file.originalname,
    fileSize: file.size,
    parsedSkills: parsed.skills,
    parsedEducation: parsed.education,
    parsedLinks: parsed.links,
    textSnippet,
    parserSource: parsed.source,
  };
}

module.exports = {
  parseResumeFile,
  extractDeterministic,
  SKILLS_LEXICON,
};

