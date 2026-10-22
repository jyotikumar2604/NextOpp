import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { daysUntil, deadlineLabel, deadlineTone, formatDate } from "../../utils/dates";
import { cx } from "../../utils/profile";

const DATE_TONE = { urgent: "border-red-200 bg-red-50 text-red-700", soon: "border-amber-200 bg-amber-50 text-amber-800", neutral: "border-slate-200 bg-slate-50 text-slate-700" };

export default function DeadlineList({ items }) {
  return (
    <section aria-labelledby="deadlines-h" className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 id="deadlines-h" className="text-lg font-semibold">Upcoming deadlines</h2>
      <p className="mt-0.5 text-sm text-slate-500">From your saved opportunities.</p>
      {items.length === 0 ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <CalendarCheck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
          Nothing closing in the next two weeks. Save listings to track their deadlines here.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((o) => {
            const tone = deadlineTone(o.deadline);
            return (
              <li key={o.id}>
                <Link to={`/opportunities/${o.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                  <span className={cx("flex w-12 shrink-0 flex-col items-center rounded-lg border py-1", DATE_TONE[tone] ?? DATE_TONE.neutral)} aria-hidden>
                    <span className="text-[10px] font-semibold uppercase leading-none">{formatDate(o.deadline, { month: "short" })}</span>
                    <span className="text-lg font-semibold leading-tight tabular-nums">{formatDate(o.deadline, { day: "numeric" })}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{o.title}</span>
                    <span className="block truncate text-xs text-slate-500">{o.organization}</span>
                  </span>
                  <span className={cx("shrink-0 text-xs", tone === "urgent" ? "font-semibold text-red-600" : tone === "soon" ? "font-medium text-amber-700" : "text-slate-500")}>
                    {daysUntil(o.deadline) === 0 ? "Today" : deadlineLabel(o.deadline).replace("Closes ", "")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
