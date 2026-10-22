import { NavLink } from "react-router-dom";
import { Bookmark, Briefcase, Compass, LayoutDashboard, UserRound, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cx, initials } from "../../utils/profile";
import { isMockApi } from "../../services/api";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark, countKey: "saved" },
  { to: "/applications", label: "Applications", icon: Briefcase, countKey: "apps" },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">C</span>
      <span className="text-[17px] font-semibold tracking-tight text-white">CampusConnect</span>
    </div>
  );
}

/** Deep-navy navigation. Rendered fixed on desktop and as a drawer on mobile (see AppLayout). */
export default function Sidebar({ onNavigate, onClose }) {
  const { profile, savedIds, applications, completion } = useApp();
  const counts = { saved: savedIds.length, apps: applications.length };

  return (
    <div className="flex h-full flex-col bg-slate-900 py-5 text-slate-300">
      <div className="mb-8 flex items-center justify-between pr-3">
        <Brand />
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end, countKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Icon className="size-[18px]" aria-hidden />
            <span className="flex-1">{label}</span>
            {countKey && counts[countKey] > 0 && (
              <span className="rounded-full bg-white/15 px-2 text-xs font-semibold tabular-nums text-white" aria-label={`${counts[countKey]} items`}>
                {counts[countKey]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 space-y-3 px-3">
        {isMockApi && (
          <p className="rounded-lg bg-slate-800/70 px-3 py-2 text-xs leading-relaxed text-slate-400">
            Demo mode: sample listings and a sample student. Data is saved in this browser only.
          </p>
        )}
        {profile && (
          <NavLink
            to="/profile"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-800/60 p-3 transition-colors hover:bg-slate-800"
            aria-label={`${profile.name}, profile ${completion.percent}% complete. Open profile`}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{initials(profile.name)}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{profile.name}</span>
              <span className="block truncate text-xs text-slate-400">{profile.major} · Year {profile.yearOfStudy}</span>
            </span>
          </NavLink>
        )}
      </div>
    </div>
  );
}
