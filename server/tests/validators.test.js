const { registerSchema, loginSchema, updateProfileSchema } = require('../src/validators/schemas');

describe('Zod Validation Schemas', () => {
  test('validates valid registration payload', () => {
    const valid = {
      name: 'Aditi Sharma',
      email: 'aditi@example.com',
      password: 'Password123',
    };
    const parsed = registerSchema.parse(valid);
    expect(parsed.email).toBe('aditi@example.com');
  });

  test('rejects registration with weak password', () => {
    const invalid = {
      name: 'Aditi',
      email: 'aditi@example.com',
      password: 'weak',
    };
    expect(() => registerSchema.parse(invalid)).toThrow();
  });

  test('rejects invalid email in login schema', () => {
    const invalid = {
      email: 'not-an-email',
      password: 'Password123',
    };
    expect(() => loginSchema.parse(invalid)).toThrow();
  });

  test('validates student profile update payload', () => {
    const valid = {
      bio: 'Enthusiastic CS student',
      education: {
        degree: 'B.Tech',
        gpa: 8.9,
        graduationYear: 2026,
      },
      skills: [
        { skill: 'react', proficiency: 'advanced' },
      ],
      preferences: {
        workModes: ['remote'],
      },
    };
    const parsed = updateProfileSchema.parse(valid);
    expect(parsed.education.gpa).toBe(8.9);
  });
});

