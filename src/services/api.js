// API service layer: the ONLY place components' data access should go through.
//
// With VITE_API_URL unset, each call is served by the localStorage-backed mock adapter.
// With VITE_API_URL set (e.g. http://localhost:5000/api), the same calls hit the Express API.
// Components never know which one is in use.
//
// Expected endpoints (see README for request/response shapes):
//   GET    /opportunities
//   GET    /saved                PUT /saved/:opportunityId       DELETE /saved/:opportunityId
//   GET    /applications         POST /applications              PATCH /applications/:id    DELETE /applications/:id
//   GET    /profile              PUT /profile
//   PATCH  /notifications/read

import { ApiError, USE_MOCK, http } from "./http";
import { delay, mockDb } from "./mockDb";

const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

// ---------- mock implementations ----------
const mock = {
  async bootstrap() {
    await delay();
    if (mockDb.shouldFail()) throw new ApiError("The demo server is unavailable (simulated error).", 503);
    const s = mockDb.state();
    return {
      opportunities: mockDb.opportunities(),
      profile: s.profile,
      savedIds: s.savedIds,
      applications: s.applications,
      readNotificationIds: s.readNotificationIds,
    };
  },
  async save(id) {
    await delay(0);
    mockDb.update((s) => ({ ...s, savedIds: s.savedIds.includes(id) ? s.savedIds : [id, ...s.savedIds] }));
  },
  async unsave(id) {
    await delay(0);
    mockDb.update((s) => ({ ...s, savedIds: s.savedIds.filter((x) => x !== id) }));
  },
  async createApplication({ opportunityId, status = "Applied", notes = "" }) {
    await delay(0);
    const app = { id: uid("app"), opportunityId, status, notes, appliedAt: new Date().toISOString() };
    mockDb.update((s) => ({ ...s, applications: [app, ...s.applications] }));
    return app;
  },
  async updateApplication(id, patch) {
    await delay(0);
    let updated;
    mockDb.update((s) => ({
      ...s,
      applications: s.applications.map((a) => (a.id === id ? (updated = { ...a, ...patch }) : a)),
    }));
    return updated;
  },
  async deleteApplication(id) {
    await delay(0);
    mockDb.update((s) => ({ ...s, applications: s.applications.filter((a) => a.id !== id) }));
  },
  async updateProfile(profile) {
    await delay(200);
    mockDb.update((s) => ({ ...s, profile }));
    return profile;
  },
  async markNotificationsRead(ids) {
    await delay(0);
    mockDb.update((s) => ({ ...s, readNotificationIds: [...new Set([...s.readNotificationIds, ...ids])] }));
  },
};

// ---------- real implementations ----------
const real = {
  async bootstrap() {
    const [opportunities, profile, saved, applications] = await Promise.all([
      http.get("/opportunities"),
      http.get("/profile"),
      http.get("/saved"),
      http.get("/applications"),
    ]);
    return {
      opportunities,
      profile,
      savedIds: saved.map((s) => s.opportunityId ?? s),
      applications,
      readNotificationIds: [],
    };
  },
  save: (id) => http.put(`/saved/${id}`),
  unsave: (id) => http.delete(`/saved/${id}`),
  createApplication: (body) => http.post("/applications", body),
  updateApplication: (id, patch) => http.patch(`/applications/${id}`, patch),
  deleteApplication: (id) => http.delete(`/applications/${id}`),
  updateProfile: (profile) => http.put("/profile", profile),
  markNotificationsRead: (ids) => http.patch("/notifications/read", { ids }),
};

export const api = USE_MOCK ? mock : real;
export const isMockApi = USE_MOCK;
export const resetMockData = () => mockDb.reset();
