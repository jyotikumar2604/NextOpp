import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarClock, Sparkles, UserRound } from "lucide-react";
import useNotifications from "../../hooks/useNotifications";
import { useApp } from "../../context/AppContext";
import { cx } from "../../utils/profile";

const ICON = { deadline: CalendarClock, match: Sparkles, profile: UserRound };
const ICON_TONE = { deadline: "bg-orange-50 text-orange-600", match: "bg-green-50 text-green-600", profile: "bg-blue-50 text-blue-600" };

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const notifications = useNotifications();
  const { markNotificationsRead } = useApp();
  const unread = notifications.filter((n) => !n.read);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="size-5" aria-hidden />
        {unread.length > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">{unread.length}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button
              type="button"
              disabled={!unread.length}
              onClick={() => markNotificationsRead(unread.map((n) => n.id))}
              className="text-xs font-medium text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
            >
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">You're all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((n) => {
                const Icon = ICON[n.kind];
                return (
                  <li key={n.id}>
                    <Link
                      to={n.to}
                      onClick={() => {
                        markNotificationsRead([n.id]);
                        setOpen(false);
                      }}
                      className={cx("flex gap-3 px-4 py-3 hover:bg-slate-50", !n.read && "bg-blue-50/40")}
                    >
                      <span className={cx("flex size-8 shrink-0 items-center justify-center rounded-lg", ICON_TONE[n.kind])}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">{n.title}</span>
                        <span className="block text-xs text-slate-500">{n.body}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
