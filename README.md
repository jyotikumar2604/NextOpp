# NextOpp (frontend)

Personalized opportunity platform for college students. React 18 + Vite + Tailwind CSS v4, **JavaScript only** (`.js` / `.jsx`).
Runs fully on built-in **mock data** today; switches to a Node/Express API by setting one env var.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Connect a backend
```bash
cp .env.example .env
# .env
VITE_API_URL=http://localhost:5000/api
```
With `VITE_API_URL` empty the app uses `src/services/mockDb.js` (localStorage, non-sensitive demo data only).
Auth should use httpOnly cookies; `src/services/http.js` sends `credentials: "include"`. Never store tokens in localStorage.

Test hooks (mock mode): add `?mockError=1` to any URL to see the error state. Demo data can be reset from Settings, or by clearing the `nextopp:demo:v1` localStorage key.

## Pages
Dashboard (`/`) · Explore (`/explore`) · Opportunity details (`/opportunities/:id`) · Saved (`/saved`) · Applications (`/applications`) · **Skill Gap (`/skills`)** · Profile (`/profile`) · **Settings (`/settings`)**. Search anywhere with **Ctrl/Cmd + K**.

## Structure
```
src/
  components/
    common/        Button, Badge, Modal, Field, Toggle, LogoMark, ProgressRing, EmptyState, ErrorState, LoadingState, DataGate
    layout/        AppLayout, Sidebar (collapsible), Navbar, CommandPalette, NotificationMenu
    dashboard/     NextMoveHero, PulseStrip, DeadlineRunway, ProfileStrength, SkillFocus
    opportunities/ OpportunityCard, MatchRing, FitBar, SkillTags, FilterSidebar, ApplyConfirmDialog
    applications/  ApplicationCard
    skills/        SkillPriorityCard, DemandBars
    profile/       TagEditor
  pages/           Dashboard, Explore, OpportunityDetails, Saved, Applications, SkillGap, Profile, Settings, NotFound
  context/         AppContext (shared state + actions), ToastContext
  services/        api.js (mock/real switch), http.js (fetch client), mockDb.js (localStorage adapter)
  data/            opportunities.js, seed.js, skillGuides.js, constants.js   <- MOCK DATA lives here
  utils/           matching.js, skills.js, filters.js, dates.js, profile.js, exportData.js
  hooks/           useNotifications.js
```

## Design system
Warm paper canvas, ink-navy surfaces, one cobalt action color, Bricolage Grotesque for headings and numerals, Inter for text. Green/amber/red appear only to carry meaning (fit, urgency, risk). Tokens live in `src/index.css` (`@theme`).

## Skill gap analysis (counting, not prediction)
`src/utils/skills.js` counts how many OPEN listings require or prefer each skill and ranks the skills you lack by:
1. how many open listings it would complete for you (it is your only missing required skill; listings you've already applied to are excluded),
2. how often it is required, 3. your shortlist, 4. how often it is preferred.
Every row prints its basis ("required in 2 of 20 open listings"). "How to start" steps in `src/data/skillGuides.js` are generic, not course recommendations.

## How matching works (not AI)
`src/utils/matching.js` is a transparent rule-based score. Weights: required skills 50, preferred skills 15,
interests + category 20, work mode 5, eligibility 10. Signals with no data are skipped (missing data never counts against
the student). A clearly failed eligibility rule caps the score at 60. The UI states this on every details page.

## Honesty rules built in
- Clicking an external Apply link never marks anything as applied. The student confirms "Yes, I applied".
- Eligibility has four states: meets / may not meet / add to profile / **not stated** (never treated as "no restriction").
- Missing source links show "No source link is available".
- All records are labelled sample data.

## Backend API contract (what the frontend calls)
| Method | Path | Body / response |
|---|---|---|
| GET | `/opportunities` | `[Opportunity]` (shape documented at the top of `src/data/opportunities.js`) |
| GET | `/profile` | `Profile` (see `src/data/seed.js`; includes `learning: string[]`) |
| PUT | `/profile` | full `Profile` -> saved `Profile` |
| GET | `/saved` | `[{ opportunityId }]` or `[opportunityId]` |
| PUT | `/saved/:opportunityId` | 204 |
| DELETE | `/saved/:opportunityId` | 204 |
| GET | `/applications` | `[{ id, opportunityId, status, appliedAt, notes }]` |
| POST | `/applications` | `{ opportunityId, status, notes? }` -> created application |
| PATCH | `/applications/:id` | `{ status?, notes? }` -> updated application |
| DELETE | `/applications/:id` | 204 |
| GET | `/settings` | `{ deadlineReminders, reminderDays, matchAlerts, matchThreshold, profileTips, visibility }` |
| PUT | `/settings` | full settings object -> saved settings |
| PATCH | `/notifications/read` | `{ ids: string[] }` |

Error responses: `{ "message": "...", "details": {...} }` with a non-2xx status.
Recommended server-side additions once data grows: query params on `/opportunities` (`q, type, mode, sort, page`),
and `GET /notifications` (replace the derived list in `src/hooks/useNotifications.js`).

## Known limitations
- Sample data: 21 fictional listings and one demo student; `example.com` apply/source links.
- Filtering, sorting and matching run in the browser over the full list (fine for hundreds of items, not thousands).
- No authentication, accounts or real notification delivery (no email/push). Profile visibility is a stored preference only.
- Applications are tracked manually; there is no drag-and-drop board and no calendar view.
- Deadlines are generated relative to the current date on every load.
