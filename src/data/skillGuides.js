// General, non-personalised starter steps per skill. These are suggestions for how to begin,
// NOT a course recommendation, and they never link to third-party content.
export const SKILL_GUIDES = {
  Testing: ["Add unit tests to one of your existing projects with Vitest or Jest.", "Practise deciding what to test: normal inputs, edge cases and error paths.", "Try one end-to-end test of a real user flow."],
  Docker: ["Containerise a small app you already built with a Dockerfile.", "Run it with docker compose alongside a database.", "Learn the difference between an image and a container."],
  Express: ["Build a small REST API with CRUD routes and input validation.", "Add error-handling middleware and test endpoints with a REST client.", "Connect it to a database."],
  MongoDB: ["Model a small app's data as collections and documents.", "Practise queries, indexes and aggregation basics.", "Connect it to an Express API with Mongoose."],
  SQL: ["Practise SELECT, JOIN, GROUP BY and subqueries on a sample database.", "Design a small schema with keys and constraints.", "Write queries that answer real questions about a dataset."],
  Python: ["Work through the official tutorial, then script something you do by hand today.", "Build a small data or automation project.", "Read other people's code on GitHub."],
  Linux: ["Use a Linux shell daily: navigate, search, permissions, pipes.", "Set up a small server or virtual machine.", "Write a few shell scripts."],
  Networking: ["Learn how DNS, TCP, HTTP and TLS fit together.", "Inspect real traffic with browser dev tools or Wireshark.", "Practise on beginner capture-the-flag challenges."],
  Figma: ["Redesign one screen of an app you use, using components and auto layout.", "Build a clickable prototype.", "Get feedback from a peer and iterate."],
  "UI/UX Design": ["Run a short usability test with three people on something you built.", "Document the problem, the process and what changed in a case study.", "Study accessibility and contrast basics."],
  "Machine Learning": ["Complete a hands-on introductory course using scikit-learn.", "Train and evaluate a model on a public dataset.", "Write up what worked and what didn't."],
  "Data Analysis": ["Explore a public dataset with Pandas or a spreadsheet.", "Summarise findings in a short report with two or three charts.", "Practise cleaning messy data."],
  "Technical Writing": ["Write a README or tutorial for one of your own projects.", "Ask a peer to follow it and note where they get stuck.", "Read a documentation style guide."],
  "Public Speaking": ["Give a five-minute talk at a club or class.", "Record yourself and review pacing and clarity.", "Practise answering unplanned questions."],
  Communication: ["Write a one-page summary of a project for a non-technical reader.", "Practise explaining a decision and its trade-offs.", "Ask for feedback after meetings."],
  Research: ["Read two papers in an area you like and summarise each.", "Reproduce a small result.", "Talk to a faculty member about a lab or topic."],
  Cypress: ["Write an end-to-end test for the login or checkout flow of a practice app.", "Learn selectors and waiting strategies.", "Run the suite in continuous integration."],
};

export const GENERIC_GUIDE = [
  "Read the official getting-started documentation.",
  "Build a small project that uses it and publish it on GitHub.",
  "Add it to your NextOpp skills once you can use it without a tutorial.",
];

export const guideFor = (skill) => SKILL_GUIDES[skill] ?? GENERIC_GUIDE;
