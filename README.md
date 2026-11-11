# NextOpp — Intelligent Opportunity Discovery & Career-Readiness Platform

> **"Find the role. Fix the gaps. Make your move."**

NextOpp is an intelligent opportunity intelligence platform designed specifically for college students. Rather than acting as another generic job board, NextOpp aggregates internships, jobs, scholarships, hackathons, fellowships, and research grants, pairing every listing with a **multi-variable deterministic matching score**, an eligibility breakdown, and actionable skill-gap roadmap recommendations.

---

## Architecture & Technology Stack

The platform is built exclusively on the **MERN** stack using JavaScript:

### Frontend
- **Framework:** React.js (v19) powered by Vite
- **Language:** JavaScript (`.js`, `.jsx` only)
- **Styling & Design System:** Tailwind CSS with custom editorial brand tokens (cream backgrounds, dark charcoal typography, rust accents, Playfair Display serif paired with Inter sans-serif)
- **Routing:** React Router DOM (v7)
- **Icons:** Lucide React
- **Analytics & Visualizations:** Recharts
- **Toast Notifications:** React Hot Toast
- **State & Context:** React Context API (`AuthContext`) with custom HTTP interceptors

### Backend
- **Runtime:** Node.js
- **Server Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM (strict schemas, indexes, references, and validation)
- **Authentication:** JWT stored in secure, `httpOnly`, SameSite cookies (no tokens in localStorage)
- **Password Security:** Bcrypt password hashing + automated brute-force account locking
- **API Validation:** Zod request schema validation middleware
- **Security Middleware:** Helmet, CORS with credential handling, Express Rate Limit

### Intelligence & Matching Engine
- **Deterministic Match Algorithm:** Pure server-side JavaScript engine (no hallucinated match numbers)
  - Required Skills Match: 40%
  - Preferred Skills Match: 15%
  - Education & Academic Fit: 15%
  - Experience / Project Relevance: 10%
  - Career Interest Alignment: 10%
  - Location & Work Mode Fit: 10%
- **Eligibility Engine:** Independent hard evaluation (GPA, Academic Year, Graduation Year)
- **AI Career Advisor:** Anthropic Claude API (`@anthropic-ai/sdk`) for contextual strengths, gap analysis, and recommended projects
- **Transparent Fallback:** Rule-based fallback engine automatically engages when API keys are absent or services are unreachable (fallback content is never mislabeled as AI-generated)

---

## Project Structure

```
NextOpp/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Centralized Axios client & API modules
│   │   ├── components/         # Shared UI components (ScoreRing, TagInput, ConfirmDialog)
│   │   │   ├── opportunities/  # OpportunityCard and listings
│   │   │   └── ui/             # Page skeletons, stat cards, empty states
│   │   ├── context/            # AuthContext (login, register, session persistence)
│   │   ├── layouts/            # AppLayout (Student sidebar) & AdminLayout
│   │   ├── pages/              # Application pages
│   │   │   ├── auth/           # Login, Register, Forgot Password, Reset Password
│   │   │   ├── student/        # Dashboard (Today's Move), Explore, Detail, Saved, Tracker, Profile, Notifications, Settings
│   │   │   ├── admin/          # Admin Dashboard, Opportunities, Form, Users, Audit Logs
│   │   │   └── LandingPage.jsx # Editorial high-conversion landing page
│   │   ├── utils/              # Formatters, category maps, status styles
│   │   ├── App.jsx             # Route definitions and auth guards
│   │   ├── index.css           # Tailwind directives & editorial design tokens
│   │   └── main.jsx            # React root mount
│   ├── tailwind.config.js      # NextOpp custom brand palette (cream, charcoal, rust, amber)
│   ├── vite.config.js          # Vite config with /api dev proxy and manual chunking
│   ├── package.json
│   └── .env.example
├── server/                     # Node.js + Express Backend
│   ├── scripts/
│   │   └── seed.js             # Database seeder with realistic test data
│   ├── src/
│   │   ├── config/             # MongoDB database connection
│   │   ├── controllers/        # Controllers (auth, opportunities, profile, saved, applications, notifications, admin)
│   │   ├── middleware/         # Auth verification, admin guard, error handling
│   │   ├── models/             # Mongoose schemas (User, StudentProfile, Opportunity, Application, Saved, etc.)
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Deterministic matching service, Claude AI service with fallbacks
│   │   ├── utils/              # Helper utilities
│   │   └── validators/         # Zod request validation schemas
│   ├── tests/                  # Jest unit tests for matching, AI fallback, schemas
│   ├── index.js                # Server entry point
│   ├── package.json
│   └── .env.example
├── package.json                # Root orchestration scripts
└── README.md
```

---

## Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI

### 2. Environment Configuration

#### Backend Configuration (`server/.env`)
Create `server/.env` based on `server/.env.example`:

```env
NODE_ENV=development
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/nextopp

# JWT Authentication
JWT_SECRET=nextopp_jwt_super_secure_development_secret_key_2026_xyz
JWT_EXPIRES_IN=7d

# CORS Client URL
CLIENT_URL=http://localhost:5173

# Optional: Anthropic Claude AI (Fallbacks engage automatically if omitted)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Cookie Domain
COOKIE_DOMAIN=localhost
```

#### Frontend Configuration (`client/.env`)
In development, the Vite server proxies `/api` requests to `http://localhost:5000` automatically. If deploying separately, configure:
```env
VITE_API_BASE_URL=
```

### 3. Database Seeding
To populate realistic opportunity categories (internships, jobs, scholarships, hackathons, fellowships, research), student accounts, and admin accounts:

```bash
npm run seed
```

**Pre-seeded Demo Credentials:**
- **Student Account:** `demo@nextopp.dev` / `Demo@123456`
- **Administrator Account:** `admin@nextopp.dev` / `Admin@123456`

### 4. Running the Development Servers

You can start backend and frontend services:

```bash
# Terminal 1 — Start the Express Backend (Port 5000)
npm run dev:server

# Terminal 2 — Start the Vite Frontend (Port 5173)
npm run dev:client
```

Open your browser to: **`http://localhost:5173`**

---

## Core Features & Walkthrough

### 1. Editorial Landing Page
- Asymmetrical typography with headline *"Find the role. Fix the gaps. Make your move."*
- Opportunity category cards, preview cards, interactive feature highlights, and direct CTAs.

### 2. Multi-Step Onboarding & Profile Setup
- Mandatory onboarding flow (`/onboarding`) directly after student registration:
  - **Step 1: Education** — College/University, Degree, Branch/Major, Academic Year, Graduation Year, CGPA.
  - **Step 2: Skills & Projects** — Skill manager with proficiency levels + project portfolio (technologies used, GitHub links, roles).
  - **Step 3: Experience & Certifications** — Past internships/jobs with date ranges + industry certifications with credential links.
  - **Step 4: Opportunity Preferences** — Preferred categories, remote/hybrid/on-site work modes, location, and career goals.
  - **Step 5: Resume Upload** — Multi-format upload (.pdf, .docx, .txt) with deterministic parser.
- **User-Confirmed Skills:** Skills found in resumes are never auto-assigned; students must explicitly check which skills to adopt.
- **Zero Fabrication Rule:** If a student enters 0 skills, matching returns 0 / unpersonalized, and "Today's Move" displays a prompt to complete the profile.

### 3. "Today's Move" Dashboard
- Prominent dark charcoal card showcasing the **#1 highest-match opportunity** personalized to the student's profile.
- Displays matched skills (emerald tags) alongside skill gaps to close (amber tags).
- If un-onboarded or skills are missing, displays a profile completion prompt with clear benefits rather than fabricated matches.
- Real-time aggregation metrics: active applications, upcoming deadlines, saved opportunities, success rate.
- Interactive timeline for upcoming deadlines.

### 4. Explore & Opportunity Discovery
- Real-time search across titles, organizations, and required skills.
- Category filters (Internships, Jobs, Scholarships, Hackathons, Fellowships, Research, Competitions).
- Source platform filter (Unstop, Internshala, AICTE Portal, Company Portal, NextOpp Curated).
- Work mode (Remote, Hybrid, On-site), compensation (Paid only), and deadline urgency filters.
- Sorting by Relevance/Featured, Recently Added, Deadline (soonest), and Highest Compensation.
- Full URL parameter persistence (`useSearchParams`) for shareable search states.
- Opportunity cards display verification badges (`✓ Verified`) and source attribution tags.

### 5. Opportunity Details & Deterministic Intelligence
- Comprehensive metadata: Work mode, compensation, duration, deadline countdown, verification check.
- **Source & Verification Card:** Clear platform origination, verification status, freshness timestamp, and official application notes.
- **Match Breakdown (0-100 ScoreRing):** Visual progress bars for required skills (40%), preferred skills (15%), education (15%), career alignment (10%), and location (10%).
- Matched skills tagged in emerald; missing skills highlighted for learning.
- **NextOpp Advisor:** Powered by Claude AI (or deterministic rule-based engine when unauthenticated or unconfigured), providing custom roadmap advice.
- Safe **"Apply on Official Site"** link (`noopener, noreferrer`) and one-click **"Add to Application Tracker"** modal.

### 6. Application Tracker (Kanban & Table Views)
- 6 Application Stages: `Applied`, `Assessment`, `Interviewing`, `Offer 🎉`, `Rejected`, `Withdrawn`.
- Seamless drag/drop or dropdown stage movement.
- Record interview dates, follow-up reminders, and stage history logs.
- Real pipeline metrics (total tracked, active pipeline, interviews, offers).

### 7. Student Profile & Readiness
- Personal details, bio, and contact links (GitHub, LinkedIn, Portfolio).
- Multi-tab management: Education, Skills & Tech, Projects, Experience, Certifications, Interests & Goals, Preferences, Bio & Links, Resume.
- Resume upload with deterministic skills extraction and user review.
- Real-time profile strength meter with advice generated via `GET /api/profile/tips`.

### 8. Administration & Ingestion Console
- Protected by `RequireAdmin` middleware and server-side role validation.
- Platform telemetry with Recharts: category distribution and application pipeline status.
- **Opportunity Ingestion Engine (`/admin/ingest`):**
  - Live status directory of supported providers (Unstop, Internshala, AICTE Portal, Company Portals, NextOpp Curated).
  - JSON batch import with automatic deduplication by source ID, URL, or Title + Organization.
- Listing moderation: Approve/Publish, Reject, Archive, Edit, Delete.
- User management: Suspend/reactivate accounts, promote/demote administrator rights (with self-demotion guards).
- Complete immutable audit log of all administrative actions.

---

## Automated Testing & Verification

The test suite validates the deterministic matching engine, AI fallback safety, and Zod input validation schemas.

```bash
# Run server test suite
npm test
```

**Results (16/16 tests passing across 4 test suites):**
- `resumeService.test.js` — Validates deterministic skill extraction from text/lexicon, education detection, link extraction, and absence of invented skills.
- `matchingService.test.js` — Validates weighted scoring, skill gap detection, and GPA/year eligibility checks.
- `aiService.test.js` — Validates transparent fallback to rule-based analysis without error throwing.
- `validators.test.js` — Validates Zod validation rules across auth and profile payloads.

```bash
# Verify client production build
npm run build:client
```
Generates clean, minified production assets in `client/dist`.

---

## REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Student registration | No |
| `POST` | `/api/auth/login` | Login & set HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | No |
| `GET` | `/api/auth/me` | Current authenticated session (includes `isOnboarded`) | Yes |
| `POST` | `/api/auth/change-password` | Change account password | Yes |
| `GET` | `/api/opportunities` | Discover opportunities (search, filters, source, pagination) | Optional |
| `GET` | `/api/opportunities/:id` | Opportunity details & source attribution | Optional |
| `GET` | `/api/opportunities/recommended` | Personalized ranked opportunities (honest top match or unpersonalized state) | Yes |
| `GET` | `/api/opportunities/:id/match` | Deterministic match calculation | Yes |
| `GET` | `/api/opportunities/:id/explain` | AI match explanation & skill gap roadmap | Yes |
| `GET` | `/api/saved` | List saved bookmarks | Yes |
| `POST` | `/api/opportunities/:id/save` | Bookmark opportunity | Yes |
| `DELETE` | `/api/opportunities/:id/save` | Remove bookmark | Yes |
| `GET` | `/api/applications` | List tracked applications | Yes |
| `POST` | `/api/applications` | Track an application | Yes |
| `PATCH` | `/api/applications/:id` | Update status, interview date, or notes | Yes |
| `DELETE` | `/api/applications/:id` | Remove tracked application | Yes |
| `GET` | `/api/profile` | Get student profile (projects, experience, certifications) | Yes |
| `PATCH` | `/api/profile` | Update profile, education, skills, projects | Yes |
| `POST` | `/api/profile/onboarding` | Step-by-step or full onboarding setup | Yes |
| `POST` | `/api/profile/resume` | Upload & deterministically extract resume data | Yes |
| `GET` | `/api/profile/tips` | AI / rule-based profile tips | Yes |
| `GET` | `/api/notifications` | Student notifications & deadline alerts | Yes |
| `PATCH` | `/api/notifications/mark-all-read` | Mark all notifications read | Yes |
| `GET` | `/api/admin/stats` | Admin platform metrics & charts | Admin |
| `GET` | `/api/admin/opportunities` | Admin listings across all statuses | Admin |
| `GET` | `/api/admin/users` | Admin user list & status | Admin |
| `PATCH` | `/api/admin/users/:id` | Suspend user or modify role | Admin |
| `GET` | `/api/admin/logs` | Immutable moderation audit trail | Admin |
| `GET` | `/api/admin/ingest/sources` | Status of supported opportunity sources | Admin |
| `POST` | `/api/admin/ingest/batch` | Batch ingest & deduplicate opportunities | Admin |

---

## License
MIT License. Created for students seeking meaningful career opportunities.

