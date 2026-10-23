import { Link, NavLink } from "react-router-dom";
import { Bookmark, Briefcase, CalendarClock, Compass, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Target, UserRound, X } from "lucide-react";
import LogoMark from "../common/LogoMark";
import { useApp } from "../../context/AppContext";
import { daysUntil } from "../../utils/dates";
import { cx, initials } from "../../utils/profile";
import { isMockApi } from "../../services/api";

const MAIN_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark, countKey: "saved" },
  { to: "/applications", label: "Applications", icon: Briefcase, countKey: "apps" },
  { to: "/skills", label: "Skill Gap", icon: Target },
];
const FOOT_NAV = [
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ item, collapsed, count, onNavigate }) {
  const { to, label, icon: Icon, end } = item;
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cx(
          "group relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors",
          collapsed ? "justify-center px-0" : "px-3",
          isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r bg-brand-500" aria-hidden />}
          <Icon className="size-[18px] shrink-0" aria-hidden />
          {!collapsed && <span className="flex-1">{label}</span>}
          {!collapsed && count > 0 && (
            <span className="rounded-full bg-white/10 px-2 text-xs font-semibold tabular-nums text-slate-200" aria-label={`${count} items`}>{count}</span>
          )}
          {collapsed && count > 0 && <span className="absolute right-2 top-1.5 size-2 rounded-full bg-brand-500" aria-hidden />}
        </>
      )}
    </NavLink>
  );
}

/** Ink-navy navigation. Fixed + collapsible on desktop, a drawer on mobile (see AppLayout). */
export default function Sidebar({ collapsed = false, onToggleCollapse, onNavigate, onClose }) {
  const { profile, savedIds, applications, completion, upcomingDeadlines } = useApp();
  const counts = { saved: savedIds.length, apps: applications.length };
  const next = upcomingDeadlines(14)[0];
  const d = next ? daysUntil(next.deadline) : null;

  return (
    <div className="flex h-full flex-col bg-ink-900 py-5 text-slate-300">
      <div className={cx("mb-7 flex items-center", collapsed ? "justify-center" : "justify-between px-5")}>
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5" aria-label="NextOpp home">
          <LogoMark />
          {!collapsed && <span className="font-display text-xl font-bold tracking-tight text-white">NextOpp</span>}
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
        )}
      </div>

      <nav aria-label="Primary" className={cx("space-y-1", collapsed ? "px-3" : "px-3")}>
        {MAIN_NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} count={counts[item.countKey]} onNavigate={onNavigate} />)}
      </nav>

      <div className="mt-auto space-y-3 px-3">
        {!collapsed && next && (
          <Link to={`/opportunities/${next.id}`} onClick={onNavigate} className="block rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-3.5 hover:border-white/20">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-200"><CalendarClock className="size-3.5" aria-hidden /> Next deadline</p>
            <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-white">{next.title}</p>
            <p className="mt-1 text-xs text-slate-400">{d === 0 ? "Closes today" : d === 1 ? "Closes tomorrow" : `Closes in ${d} days`} · {next.organization}</p>
          </Link>
        )}

        <div className="space-y-1 border-t border-white/10 pt-3">
          {FOOT_NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />)}
        </div>

        {!collapsed && isMockApi && (
          <p className="rounded-lg bg-white/5 px-3 py-2 text-xs leading-relaxed text-slate-400">Demo mode: sample listings and a sample student, saved in this browser only.</p>
        )}

        {profile && (
          <Link
            to="/profile"
            onClick={onNavigate}
            title={collapsed ? profile.name : undefined}
            aria-label={`${profile.name}, profile ${completion.percent}% complete. Open profile`}
            className={cx("flex items-center gap-3 rounded-xl bg-white/5 p-2.5 transition-colors hover:bg-white/10", collapsed && "justify-center")}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">{initials(profile.name)}</span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{profile.name}</span>
                <span className="block truncate text-xs text-slate-400">{profile.major} · Year {profile.yearOfStudy}</span>
              </span>
            )}
          </Link>
        )}

        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cx("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-white/5 hover:text-slate-200", collapsed && "justify-center px-0")}>
            {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /> Collapse</>}
          </button>
        )}
      </div>
    </div>
  );
}
