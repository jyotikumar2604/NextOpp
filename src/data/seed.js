// MOCK DATA: the demo student and starting tracker state. Written to localStorage on first run only.
// Do not put real personal data here.

const day = 86_400_000;
const daysAgo = (n) => new Date(Date.now() - n * day).toISOString();

export const seedProfile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@example.edu",
  major: "Computer Science",
  university: "Riverside Institute of Technology",
  yearOfStudy: 3,
  graduationYear: 2027,
  location: "New Delhi, India",
  skills: [
    { name: "React", level: "Advanced" },
    { name: "JavaScript", level: "Advanced" },
    { name: "CSS", level: "Intermediate" },
    { name: "HTML", level: "Advanced" },
    { name: "Git", level: "Intermediate" },
    { name: "Node.js", level: "Intermediate" },
    { name: "Python", level: "Beginner" },
  ],
  interests: ["Web Development", "Open Source", "Product Design"],
  preferredTypes: ["Internship", "Hackathon", "Fellowship"],
  preferredModes: ["Remote", "Hybrid"],
  careerGoals: "",
  github: "",
  learning: ["Testing"], // skills the student is working on (does not affect matching)
};

export const defaultSettings = {
  deadlineReminders: true,
  reminderDays: 3,
  matchAlerts: true,
  matchThreshold: 85,
  profileTips: true,
  visibility: "private",
};

export const seedState = () => ({
  profile: seedProfile,
  savedIds: ["opp-001", "opp-002", "opp-009", "opp-003", "opp-015"],
  applications: [
    { id: "app-001", opportunityId: "opp-007", status: "Applied", appliedAt: daysAgo(5), notes: "Submitted resume and a short cover note." },
    { id: "app-002", opportunityId: "opp-017", status: "Interview", appliedAt: daysAgo(12), notes: "First-round call scheduled. Revise testing basics." },
    { id: "app-003", opportunityId: "opp-011", status: "Applied", appliedAt: daysAgo(3), notes: "" },
    { id: "app-004", opportunityId: "opp-013", status: "Rejected", appliedAt: daysAgo(20), notes: "Asked for feedback by email." },
  ],
  readNotificationIds: [],
  settings: defaultSettings,
});
