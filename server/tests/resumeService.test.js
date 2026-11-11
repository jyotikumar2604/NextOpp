const { extractDeterministic, SKILLS_LEXICON } = require('../src/services/resumeService');

describe('Resume Parsing Service — Deterministic Engine', () => {
  test('extracts known technical skills without inventing unmentioned skills', () => {
    const sampleText = `
      John Doe
      Computer Science Undergraduate
      Skills: JavaScript, React, Node.js, Docker, Python.
      Proficient in building REST APIs with Express and MongoDB.
    `;

    const result = extractDeterministic(sampleText);
    const skillNames = result.skills.map((s) => s.skill);

    expect(skillNames).toContain('javascript');
    expect(skillNames).toContain('react');
    expect(skillNames).toContain('node.js');
    expect(skillNames).toContain('docker');
    expect(skillNames).toContain('python');
    expect(skillNames).toContain('rest api');
    expect(skillNames).toContain('express');
    expect(skillNames).toContain('mongodb');

    // Never invents unmentioned skills
    expect(skillNames).not.toContain('flutter');
    expect(skillNames).not.toContain('kubernetes');
    expect(skillNames).not.toContain('swift');
  });

  test('extracts degree, branch, graduation year, and CGPA accurately', () => {
    const sampleText = `
      Education:
      B.Tech in Computer Science & Engineering
      Indian Institute of Technology, Bombay
      Expected Graduation: 2026
      Current CGPA: 8.75 / 10
    `;

    const result = extractDeterministic(sampleText);

    expect(result.education.degree).toBe('B.Tech');
    expect(result.education.branch).toBe('Computer Science & Engineering');
    expect(result.education.graduationYear).toBe(2026);
    expect(result.education.gpa).toBe(8.75);
    expect(result.education.gpaScale).toBe(10);
  });

  test('extracts GitHub and LinkedIn links', () => {
    const sampleText = `
      Find my work at github.com/johndoe-dev
      Connect on linkedin.com/in/johndoe-engineer
    `;

    const result = extractDeterministic(sampleText);

    expect(result.links.github).toBe('https://github.com/johndoe-dev');
    expect(result.links.linkedin).toBe('https://linkedin.com/in/johndoe-engineer');
  });

  test('handles empty or noisy text safely without errors', () => {
    const result = extractDeterministic('');
    expect(result.skills).toEqual([]);
    expect(result.education).toEqual({});
    expect(result.links).toEqual({});
  });
});

