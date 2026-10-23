// Shared enumerations. Keep in sync with the backend's allowed values.

export const OPPORTUNITY_TYPES = ["Internship", "Hackathon", "Scholarship", "Fellowship", "Competition"];
export const WORK_MODES = ["Remote", "Hybrid", "On-site"];
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const YEARS_OF_STUDY = [1, 2, 3, 4, 5];

// Tracker statuses, in pipeline order. "All" is a UI filter, not a stored status.
export const APPLICATION_STATUSES = ["Applied", "Interview", "Offered", "Rejected"];

export const SORT_OPTIONS = [
  { value: "match", label: "Best match" },
  { value: "deadline", label: "Deadline (soonest)" },
  { value: "newest", label: "Newest" },
];

// Suggestions shown in the profile editor (free text is still allowed).
export const SKILL_SUGGESTIONS = [
  "React", "JavaScript", "TypeScript", "HTML", "CSS", "Node.js", "Express", "MongoDB", "SQL", "Python", "Git", "Docker", "Linux",
  "Figma", "UI/UX Design", "Testing", "Machine Learning", "Data Analysis", "Communication", "Public Speaking", "Technical Writing", "Research",
];
export const INTEREST_SUGGESTIONS = [
  "Web Development", "Open Source", "Product Design", "Data Science", "Security", "Climate", "Entrepreneurship", "Research", "Infrastructure", "Leadership",
];

// Accent per opportunity type (card edge, filters). Distinct hues, used only to aid scanning.
export const TYPE_COLORS = {
  Internship: "#2d47f0",
  Hackathon: "#a855f7",
  Scholarship: "#16a34a",
  Fellowship: "#f97316",
  Competition: "#ca8a04",
};
