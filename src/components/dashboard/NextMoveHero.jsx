import { ArrowRight, CalendarClock, Check, Send } from "lucide-react";
import { LinkButton, Button } from "../common/Button";
import MatchRing from "../opportunities/MatchRing";
import { deadlineLabel } from "../../utils/dates";

/** The single most useful thing to do today, with the reasoning shown. Dark surface = the focal point of the page. */
export default function NextMoveHero({ opportunity: o, match, why, onQuickApply }) {
  return (
    <section aria-labelledby="hero-h" className="relative overflow-hidden rounded-2xl bg-ink-900 p-6 text-white shadow-[var(--shadow-card)] sm:p-8">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">Your next best move</p>
          <h2 id="hero-h" className="font-display mt-3 text-[28px] font-bold leading-tight tracking-tight !text-white sm:text-[32px]">{o.title}</h2>
          <p className="mt-1 text-slate-300">{o.organization} · {o.type} · {o.mode}</p>

          <ul className="mt-4 space-y-1.5">
            {match.reasons.slice(0, 2).map((r) => (
              <li key={r} className="flex gap-2 text-sm text-slate-200"><Check className="mt-0.5 size-4 shrink-0 text-green-400" aria-hidden />{r}</li>
            ))}
          </ul>

          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
            <CalendarClock className="size-4" aria-hidden /> {deadlineLabel(o.deadline)}
          </p>
          <p className="mt-2 text-xs text-slate-400">{why}</p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <LinkButton to={`/opportunities/${o.id}`} size="lg" className="bg-white !text-ink-900 hover:bg-stone-100">View details <ArrowRight /></LinkButton>
            <Button size="lg" variant="ghost" className="border border-white/25 !text-white hover:bg-white/10" onClick={() => onQuickApply(o)}><Send /> Quick apply</Button>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 md:pr-4">
          <MatchRing score={match.score} size={112} dark />
          <span className="text-xs font-medium text-slate-300">rule-based match</span>
        </div>
      </div>
    </section>
  );
}
