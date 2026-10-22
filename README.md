# CampusConnect (frontend)

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

Test hooks (mock mode): add `?mockError=1` to any URL to see the error state. Settings of the demo data can be reset by clearing the `campusconnect:demo:v1` localStorage key.

## Structure
```
src/
  components/
    common/        Button, Badge, Modal, Field, ProgressRing, EmptyState, ErrorState, LoadingState, DataGate, CompanyLogo
    layout/        AppLayout, Sidebar, Navbar, NotificationMenu
    dashboard/     StatsCard, DeadlineList, ProfileStrength
    opportunities/ OpportunityCard, MatchBadge, SkillTags, FilterSidebar, ApplyConfirmDialog
    applications/  ApplicationCard
    profile/       TagEditor
  pages/           Dashboard, Explore, OpportunityDetails, Saved, Applications, Profile, NotFound
  context/         AppContext (shared state + actions), ToastContext
  services/        api.js (mock/real switch), http.js (fetch client), mockDb.js (localStorage adapter)
  data/            opportunities.js, seed.js, constants.js   <- MOCK DATA lives only here
  utils/           matching.js, filters.js, dates.js, profile.js
  hooks/           useNotifications.js
```

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
| GET | `/profile` | `Profile` (see `src/data/seed.js`) |
| PUT | `/profile` | full `Profile` -> saved `Profile` |
| GET | `/saved` | `[{ opportunityId }]` or `[opportunityId]` |
| PUT | `/saved/:opportunityId` | 204 |
| DELETE | `/saved/:opportunityId` | 204 |
| GET | `/applications` | `[{ id, opportunityId, status, appliedAt, notes }]` |
| POST | `/applications` | `{ opportunityId, status, notes? }` -> created application |
| PATCH | `/applications/:id` | `{ status?, notes? }` -> updated application |
| DELETE | `/applications/:id` | 204 |
| PATCH | `/notifications/read` | `{ ids: string[] }` |

Error responses: `{ "message": "...", "details": {...} }` with a non-2xx status.
Recommended server-side additions once data grows: query params on `/opportunities` (`q, type, mode, sort, page`),
and `GET /notifications` (replace the derived list in `src/hooks/useNotifications.js`).

## Known limitations
- Sample data: 21 fictional listings and one demo student; `example.com` apply/source links.
- Filtering, sorting and matching run in the browser over the full list (fine for hundreds of items, not thousands).
- No authentication, accounts or real notifications delivery (no email/push).
- Applications are tracked manually; there is no drag-and-drop board and no calendar view.
- Deadlines are generated relative to the current date on every load.
