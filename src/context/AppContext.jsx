import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { api } from "../services/api";
import { useToast } from "./ToastContext";
import { computeMatch } from "../utils/matching";
import { daysUntil } from "../utils/dates";
import { profileCompletion } from "../utils/profile";
import { defaultSettings } from "../data/seed";

// Single source of truth for data shared across pages: opportunities, profile, saved ids,
// applications and notification read-state. Mutations go through the API service layer.
// Pessimistic updates: the UI changes after the service call succeeds, and failures show a toast.

const AppContext = createContext(null);

const initialState = {
  status: "loading", // "loading" | "ready" | "error"
  error: null,
  opportunities: [],
  profile: null,
  savedIds: [],
  applications: [],
  readNotificationIds: [],
  settings: defaultSettings,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: null };
    case "LOADED":
      return { ...state, ...action.payload, status: "ready", error: null };
    case "FAILED":
      return { ...state, status: "error", error: action.error };
    case "SAVE":
      return { ...state, savedIds: [action.id, ...state.savedIds.filter((x) => x !== action.id)] };
    case "UNSAVE":
      return { ...state, savedIds: state.savedIds.filter((x) => x !== action.id) };
    case "APP_ADD":
      return { ...state, applications: [action.application, ...state.applications] };
    case "APP_UPDATE":
      return { ...state, applications: state.applications.map((a) => (a.id === action.application.id ? action.application : a)) };
    case "APP_REMOVE":
      return { ...state, applications: state.applications.filter((a) => a.id !== action.id) };
    case "PROFILE":
      return { ...state, profile: action.profile };
    case "SETTINGS":
      return { ...state, settings: action.settings };
    case "NOTIFS_READ":
      return { ...state, readNotificationIds: [...new Set([...state.readNotificationIds, ...action.ids])] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [applyTarget, setApplyTarget] = useState(null); // opportunity awaiting "Did you apply?" confirmation
  const toast = useToast();

  const load = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      dispatch({ type: "LOADED", payload: await api.bootstrap() });
    } catch (err) {
      dispatch({ type: "FAILED", error: err.message || "Something went wrong." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ---- derived data (memoised so pages don't recompute scores on every render) ----
  const opportunityById = useMemo(() => new Map(state.opportunities.map((o) => [o.id, o])), [state.opportunities]);

  const matchById = useMemo(() => {
    const map = new Map();
    if (state.profile) for (const o of state.opportunities) map.set(o.id, computeMatch(o, state.profile));
    return map;
  }, [state.opportunities, state.profile]);

  const savedSet = useMemo(() => new Set(state.savedIds), [state.savedIds]);
  const appByOpportunity = useMemo(() => new Map(state.applications.map((a) => [a.opportunityId, a])), [state.applications]);
  const completion = useMemo(() => (state.profile ? profileCompletion(state.profile) : { percent: 0, items: [], missing: [] }), [state.profile]);

  // ---- actions ----
  const run = useCallback(
    async (fn, failMessage) => {
      try {
        return await fn();
      } catch (err) {
        toast.error(err.message || failMessage);
        return undefined;
      }
    },
    [toast],
  );

  const toggleSave = useCallback(
    async (opp) => {
      const saved = savedSet.has(opp.id);
      const ok = await run(async () => {
        await (saved ? api.unsave(opp.id) : api.save(opp.id));
        return true;
      }, "Couldn't update your saved list.");
      if (!ok) return;
      dispatch({ type: saved ? "UNSAVE" : "SAVE", id: opp.id });
      toast.success(saved ? "Removed from saved." : "Saved for later.");
    },
    [savedSet, run, toast],
  );

  const updateApplication = useCallback(
    async (id, patch) => {
      const application = await run(() => api.updateApplication(id, patch), "Couldn't update the application.");
      if (application) dispatch({ type: "APP_UPDATE", application });
      return application;
    },
    [run],
  );

  const removeApplication = useCallback(
    async (id) => {
      const ok = await run(async () => {
        await api.deleteApplication(id);
        return true;
      }, "Couldn't remove the application.");
      if (ok) {
        dispatch({ type: "APP_REMOVE", id });
        toast.success("Application removed from your tracker.");
      }
    },
    [run, toast],
  );

  const updateProfile = useCallback(
    async (profile, message = "Profile saved. Your matches have been updated.") => {
      const saved = await run(() => api.updateProfile(profile), "Couldn't save your profile.");
      if (saved) {
        dispatch({ type: "PROFILE", profile: saved });
        toast.success(message);
      }
      return !!saved;
    },
    [run, toast],
  );

  // Skill Gap actions. Adding a skill changes matching; "learning" is only a personal marker.
  const addSkill = useCallback(
    (name, level = "Beginner") =>
      updateProfile({ ...state.profile, skills: [...state.profile.skills, { name, level }] }, `Added ${name} to your skills. Matches updated.`),
    [state.profile, updateProfile],
  );

  const toggleLearning = useCallback(
    (name) => {
      const learning = state.profile.learning ?? [];
      const on = learning.includes(name);
      return updateProfile({ ...state.profile, learning: on ? learning.filter((x) => x !== name) : [...learning, name] }, on ? `Stopped tracking ${name}.` : `Tracking ${name} as a skill you're learning.`);
    },
    [state.profile, updateProfile],
  );

  const updateSettings = useCallback(
    async (patch) => {
      const next = { ...state.settings, ...patch };
      dispatch({ type: "SETTINGS", settings: next }); // instant feedback; revert if the save fails
      const ok = await run(() => api.updateSettings(next), "Couldn't save that setting.");
      if (!ok) dispatch({ type: "SETTINGS", settings: state.settings });
    },
    [state.settings, run],
  );

  const markNotificationsRead = useCallback(
    async (ids) => {
      if (!ids.length) return;
      dispatch({ type: "NOTIFS_READ", ids });
      await run(() => api.markNotificationsRead(ids), "Couldn't update notifications.");
    },
    [run],
  );

  /**
   * Apply flow. We open the OFFICIAL application page in a new tab, then ask the student to
   * confirm. The tracker records "Applied" only when the student says they actually applied.
   */
  const requestApply = useCallback((opp) => {
    window.open(opp.applyUrl, "_blank", "noopener,noreferrer");
    setApplyTarget(opp);
  }, []);

  const confirmApplied = useCallback(async () => {
    if (!applyTarget) return;
    const opp = applyTarget;
    setApplyTarget(null);
    if (appByOpportunity.has(opp.id)) return;
    const application = await run(() => api.createApplication({ opportunityId: opp.id, status: "Applied" }), "Couldn't add to your tracker.");
    if (application) {
      dispatch({ type: "APP_ADD", application });
      toast.success(`Added "${opp.title}" to My Applications.`);
    }
  }, [applyTarget, appByOpportunity, run, toast]);

  // Opportunities from the user's own lists that close within `days`, excluding already-applied saved items.
  const upcomingDeadlines = useCallback(
    (days = 14) =>
      state.savedIds
        .map((id) => opportunityById.get(id))
        .filter((o) => o && !appByOpportunity.has(o.id))
        .filter((o) => {
          const d = daysUntil(o.deadline);
          return d !== null && d >= 0 && d <= days;
        })
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline)),
    [state.savedIds, opportunityById, appByOpportunity],
  );

  const value = useMemo(
    () => ({
      ...state,
      reload: load,
      opportunityById,
      matchById,
      savedSet,
      appByOpportunity,
      completion,
      applyTarget,
      toggleSave,
      updateApplication,
      removeApplication,
      updateProfile,
      addSkill,
      toggleLearning,
      updateSettings,
      markNotificationsRead,
      requestApply,
      confirmApplied,
      cancelApply: () => setApplyTarget(null),
      upcomingDeadlines,
    }),
    [state, load, opportunityById, matchById, savedSet, appByOpportunity, completion, applyTarget, toggleSave, updateApplication, removeApplication, updateProfile, addSkill, toggleLearning, updateSettings, markNotificationsRead, requestApply, confirmApplied, upcomingDeadlines],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
};
