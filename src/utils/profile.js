// Profile completion + form validation. Pure functions, easy to unit test.

const CHECKS = [
  { key: "basics", label: "Add your name and email", weight: 10, done: (p) => !!p.name?.trim() && !!p.email?.trim() },
  { key: "major", label: "Add your major", weight: 10, done: (p) => !!p.major?.trim() },
  { key: "university", label: "Add your university", weight: 10, done: (p) => !!p.university?.trim() },
  { key: "grad", label: "Set year of study and graduation year", weight: 10, done: (p) => !!p.yearOfStudy && !!p.graduationYear },
  { key: "skills", label: "List at least 3 skills", weight: 20, done: (p) => (p.skills?.length ?? 0) >= 3 },
  { key: "interests", label: "Add at least one interest", weight: 10, done: (p) => (p.interests?.length ?? 0) >= 1 },
  { key: "prefs", label: "Choose preferred categories and work modes", weight: 10, done: (p) => !!p.preferredTypes?.length && !!p.preferredModes?.length },
  { key: "goals", label: "Describe your career goals", weight: 10, done: (p) => !!p.careerGoals?.trim() },
  { key: "github", label: "Add your GitHub or portfolio link", weight: 10, done: (p) => !!p.github?.trim() },
];

export function profileCompletion(profile) {
  const items = CHECKS.map((c) => ({ key: c.key, label: c.label, weight: c.weight, done: c.done(profile) }));
  const percent = items.filter((i) => i.done).reduce((n, i) => n + i.weight, 0);
  return { percent, items, missing: items.filter((i) => !i.done) };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns an object of field -> message. Empty object means valid. */
export function validateProfile(p) {
  const e = {};
  if (!p.name?.trim()) e.name = "Enter your full name.";
  if (!p.email?.trim()) e.email = "Enter your email address.";
  else if (!EMAIL.test(p.email.trim())) e.email = "Enter a valid email, like name@university.edu.";
  if (!p.major?.trim()) e.major = "Enter your major or field of study.";
  const year = Number(p.graduationYear);
  if (!p.graduationYear) e.graduationYear = "Enter your expected graduation year.";
  else if (!Number.isInteger(year) || year < 2024 || year > 2035) e.graduationYear = "Enter a year between 2024 and 2035.";
  if (!p.skills?.length) e.skills = "Add at least one skill so we can match you.";
  if (p.github?.trim()) {
    try {
      const u = new URL(p.github.trim());
      if (u.protocol !== "https:") e.github = "Use a link that starts with https://";
    } catch {
      e.github = "Enter a full link, like https://github.com/username";
    }
  }
  return e;
}

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";

/** Tiny className joiner. */
export const cx = (...parts) => parts.filter(Boolean).join(" ");
