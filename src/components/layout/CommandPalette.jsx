import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Briefcase, Compass, CornerDownLeft, LayoutDashboard, Search, Settings, Target, UserRound } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { matchesQuery } from "../../utils/filters";
import { isClosed } from "../../utils/dates";
import { cx } from "../../utils/profile";

const PAGES = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Explore opportunities", to: "/explore", icon: Compass },
  { label: "Saved opportunities", to: "/saved", icon: Bookmark },
  { label: "My applications", to: "/applications", icon: Briefcase },
  { label: "Skill gap analysis", to: "/skills", icon: Target },
  { label: "Profile", to: "/profile", icon: UserRound },
  { label: "Settings", to: "/settings", icon: Settings },
];

/**
 * Global search + quick navigation (Ctrl/Cmd + K). Combobox pattern: the input keeps focus while
 * arrow keys move the highlighted option, so it works with a keyboard and with screen readers.
 */
export default function CommandPalette({ open, onClose }) {
  const { opportunities, matchById } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listId = useId();

  const items = useMemo(() => {
    const term = q.trim();
    const open_ = opportunities.filter((o) => !isClosed(o.deadline));
    const opps = (term ? open_.filter((o) => matchesQuery(o, term)) : [...open_].sort((a, b) => (matchById.get(b.id)?.score ?? 0) - (matchById.get(a.id)?.score ?? 0)))
      .slice(0, term ? 6 : 4)
      .map((o) => ({ key: o.id, group: term ? "Opportunities" : "Top matches", label: o.title, sub: `${o.organization} · ${o.type}`, to: `/opportunities/${o.id}`, score: matchById.get(o.id)?.score }));
    const pages = PAGES.filter((p) => !term || p.label.toLowerCase().includes(term.toLowerCase())).map((p) => ({ key: p.to, group: "Go to", label: p.label, to: p.to, icon: p.icon }));
    const all = [...opps, ...pages];
    if (term) all.push({ key: "search-all", group: "Search", label: `Search all opportunities for "${term}"`, to: `/explore?q=${encodeURIComponent(term)}`, icon: Search });
    return all;
  }, [q, opportunities, matchById]);

  useEffect(() => {
    if (!open) return undefined;
    setQ("");
    setActive(0);
    const previous = document.activeElement;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const go = (item) => {
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + items.length) % items.length); }
    else if (e.key === "Enter" && items[active]) { e.preventDefault(); go(items[active]); }
    else if (e.key === "Tab") e.preventDefault(); // keep focus inside the palette
  };

  let lastGroup = null;
  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Search NextOpp" className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-pop)] ring-1 ring-black/5">
        <div className="flex items-center gap-3 border-b border-stone-200 px-4">
          <Search className="size-5 shrink-0 text-stone-400" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
            aria-label="Search opportunities and pages"
            placeholder="Search internships, scholarships, hackathons..."
            style={{ outline: "none" }}
            className="h-14 flex-1 bg-transparent text-[15px] text-stone-900 placeholder:text-stone-400"
          />
          <kbd className="hidden rounded border border-stone-200 px-1.5 py-0.5 text-[11px] font-medium text-stone-500 sm:block">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {items.map((item, i) => {
            const header = item.group !== lastGroup;
            lastGroup = item.group;
            const Icon = item.icon;
            return (
              <li key={item.key} role="presentation">
                {header && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{item.group}</p>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cx("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5", i === active ? "bg-brand-50" : "")}
                >
                  {Icon ? <Icon className="size-4 shrink-0 text-stone-500" aria-hidden /> : <span className="size-4 shrink-0 rounded bg-stone-200" aria-hidden />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-stone-900">{item.label}</span>
                    {item.sub && <span className="block truncate text-xs text-stone-500">{item.sub}</span>}
                  </span>
                  {item.score !== undefined && <span className="text-xs font-semibold tabular-nums text-green-700">{item.score}%</span>}
                  {i === active && <CornerDownLeft className="size-4 text-stone-400" aria-hidden />}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-stone-100 bg-stone-50 px-4 py-2 text-xs text-stone-500">↑ ↓ to move · Enter to open · Esc to close</p>
      </div>
    </div>
  );
}
