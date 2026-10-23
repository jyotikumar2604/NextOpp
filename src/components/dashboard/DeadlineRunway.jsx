import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import { daysUntil, deadlineLabel, deadlineTone, formatDate } from "../../utils/dates";
import { cx } from "../../utils/profile";

const DOT = { urgent: "bg-red-500 ring-red-200", soon: "bg-amber-500 ring-amber-200", neutral: "bg-brand-600 ring-brand-200" };
const DATE_BOX = { urgent: "border-red-200 bg-red-50 text-red-700", soon: "border-amber-200 bg-amber-50 text-amber-800", neutral: "border-stone-200 bg-stone-50 text-stone-700" };
const RANGE = 14;

/**
 * A 14-day timeline of the deadlines on YOUR shortlist. Position on the line = days from today,
 * so spacing and urgency are visible at a glance. The list below carries the same information as text.
 */
export default function DeadlineRunway({ items }) {
  // Stack dots that would overlap onto extra rows.
  const placed = items.map((o, i) => {
    const d = Math.min(RANGE, Math.max(0, daysUntil(o.deadline)));
    const row = items.slice(0, i).filter((p) => Math.abs(Math.min(RANGE, daysUntil(p.deadline)) - d) < 1.2).length;
    return { o, d, row };
  });

  return (
    <section aria-labelledby="runway-h" className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="runway-h" className="text-xl font-semibold">Deadline runway</h2>
          <p className="mt-0.5 text-sm text-stone-500">Saved opportunities closing in the next {RANGE} days.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
          <CalendarCheck className="mt-0.5 size-4 shrink-0 text-stone-400" aria-hidden />
          Nothing closing soon. Save listings and their deadlines will line up here.
        </p>
      ) : (
        <>
          <div className="relative mx-3 mt-6 hidden h-[88px] sm:block" aria-hidden={false}>
            <div className="absolute inset-x-0 top-3 h-0.5 rounded bg-stone-200" />
            {[0, 7, 14].map((t) => (
              <span key={t} className="absolute top-8 -translate-x-1/2 text-[11px] font-medium text-stone-400" style={{ left: `${(t / RANGE) * 100}%` }}>{t === 0 ? "Today" : `+${t}d`}</span>
            ))}
            {placed.map(({ o, d, row }) => {
              const tone = deadlineTone(o.deadline);
              return (
                <Link
                  key={o.id}
                  to={`/opportunities/${o.id}`}
                  aria-label={`${o.title}, ${deadlineLabel(o.deadline).toLowerCase()}`}
                  title={`${o.title} · ${deadlineLabel(o.deadline)}`}
                  className={cx("absolute size-4 -translate-x-1/2 rounded-full ring-4 transition-transform hover:scale-125", DOT[tone] ?? DOT.neutral)}
                  style={{ left: `${(d / RANGE) * 100}%`, top: `${4 + row * 18}px` }}
                />
              );
            })}
          </div>

          <ul className="mt-4 grid gap-x-6 divide-y divide-stone-100 md:grid-cols-2 md:divide-y-0">
            {items.slice(0, 6).map((o) => {
              const tone = deadlineTone(o.deadline);
              return (
                <li key={o.id} className="border-stone-100 md:border-b">
                  <Link to={`/opportunities/${o.id}`} className="flex items-center gap-3 py-2.5 hover:opacity-80">
                    <span className={cx("flex w-12 shrink-0 flex-col items-center rounded-lg border py-1", DATE_BOX[tone] ?? DATE_BOX.neutral)} aria-hidden>
                      <span className="text-[10px] font-semibold uppercase leading-none">{formatDate(o.deadline, { month: "short" })}</span>
                      <span className="font-display text-lg font-bold leading-tight tabular-nums">{formatDate(o.deadline, { day: "numeric" })}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900">{o.title}</span>
                      <span className="block truncate text-xs text-stone-500">{o.organization}</span>
                    </span>
                    <span className={cx("shrink-0 text-xs", tone === "urgent" ? "font-semibold text-red-600" : tone === "soon" ? "font-medium text-amber-700" : "text-stone-500")}>
                      {daysUntil(o.deadline) === 0 ? "Today" : deadlineLabel(o.deadline).replace("Closes ", "")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
