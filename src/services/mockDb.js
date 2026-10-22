// MOCK ADAPTER: persists the demo student's tracker state in this browser's localStorage.
// It exists only so the frontend is fully interactive before the Express/MongoDB backend is built.
// It stores NON-SENSITIVE demo data only: never put passwords, tokens or real personal data here.

import { opportunities } from "../data/opportunities";
import { seedState } from "../data/seed";

const KEY = "campusconnect:demo:v1";
const LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 350);

export const delay = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms));

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupted or unavailable storage: fall through to a fresh seed */
  }
  const fresh = seedState();
  write(fresh);
  return fresh;
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked (private mode): the session still works in memory */
  }
}

export const mockDb = {
  opportunities: () => opportunities,
  state: read,
  update(mutator) {
    const next = mutator(read());
    write(next);
    return next;
  },
  reset() {
    localStorage.removeItem(KEY);
  },
  // Test hook: append ?mockError=1 to the URL to see the error state.
  shouldFail: () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("mockError"),
};
