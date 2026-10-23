import { memo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import Badge, { TYPE_TONE } from "../common/Badge";
import CompanyLogo from "../common/CompanyLogo";
import { Button, LinkButton } from "../common/Button";
import MatchRing from "./MatchRing";
import FitBar from "./FitBar";
import SkillTags from "./SkillTags";
import { TYPE_COLORS } from "../../data/constants";
import { daysUntil, deadlineTone, formatDate, isClosed } from "../../utils/dates";
import { cx } from "../../utils/profile";

const COUNT_TONE = { neutral: "text-stone-900", soon: "text-amber-600", urgent: "text-red-600", closed: "text-stone-400" };

/** Big countdown numeral for the action rail. */
function Countdown({ deadline }) {
  const d = daysUntil(deadline);
  const tone = deadlineTone(deadline);
  let big;
  let small;
  if (d === null) { big = "Open"; small = "rolling deadline"; }
  else if (d < 0) { big = "Closed"; small = formatDate(deadline); }
  else if (d === 0) { big = "Today"; small = "last day to apply"; }
  else { big = d; small = d === 1 ? "day left" : "days left"; }
  return (
    <div>
      <p className={cx("font-display text-[32px] font-bold leading-none tabular-nums", COUNT_TONE[tone], typeof big === "string" && "text-2xl")}>{big}</p>
      <p className="mt-1 text-xs text-stone-500">{small}</p>
      {d !== null && d >= 0 && <p className="text-xs font-medium text-stone-700">{formatDate(deadline, { month: "short", day: "numeric" })}</p>}
    </div>
  );
}

/**
 * One card used on Dashboard, Explore and Saved. The left column explains the fit;
 * the right rail carries the deadline and the actions so decisions happen in one glance.
 */
function OpportunityCard({ opportunity: o, match, saved, application, haveSkills = [], onToggleSave, onQuickApply }) {
  const closed = isClosed(o.deadline);
  const skills = [...o.requiredSkills, ...o.preferredSkills];

  return (
    <article className={cx("flex overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-md", closed && "opacity-75")}>
      <span className="w-1.5 shrink-0" style={{ backgroundColor: TYPE_COLORS[o.type] }} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col md:flex-row">
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-start gap-3">
            <CompanyLogo name={o.organization} color={o.color} className="size-10 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-stone-500">
                <span className="font-medium text-stone-700">{o.organization}</span>
                <Badge tone={TYPE_TONE[o.type]}>{o.type}</Badge>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden /> {o.mode} · {o.duration}</span>
              </p>
              <h3 className="mt-1 text-lg font-semibold leading-snug">
                <Link to={`/opportunities/${o.id}`} className="hover:text-brand-700 hover:underline">{o.title}</Link>
              </h3>
            </div>
            {match && !closed && <MatchRing score={match.score} />}
          </div>

          {match && !closed ? (
            <p className="mt-3 flex gap-2 text-sm leading-relaxed text-stone-600">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              <span><span className="sr-only">Why it matches: </span>{match.summary}</span>
            </p>
          ) : (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600">{o.description}</p>
          )}

          {match && !closed && <div className="mt-3"><FitBar match={match} required={o.requiredSkills} /></div>}
          {skills.length > 0 && <div className="mt-3"><SkillTags skills={skills} have={haveSkills} max={5} /></div>}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-stone-200 bg-stone-50/70 p-4 md:w-48 md:flex-col md:items-stretch md:justify-between md:border-l md:border-t-0">
          <Countdown deadline={o.deadline} />
          <div className="flex flex-col gap-2">
            {application ? (
              <Badge tone="green" className="justify-center py-1"><CheckCircle2 className="size-3" aria-hidden /> {application.status}</Badge>
            ) : (
              !closed && onQuickApply && <Button size="sm" onClick={() => onQuickApply(o)}>Quick apply</Button>
            )}
            <div className="flex gap-2">
              <LinkButton to={`/opportunities/${o.id}`} size="sm" variant="secondary" className="flex-1">View details</LinkButton>
              <button
                type="button"
                onClick={() => onToggleSave(o)}
                aria-pressed={saved}
                aria-label={saved ? `Remove ${o.title} from saved` : `Save ${o.title}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-500 hover:bg-stone-50 hover:text-brand-600"
              >
                <Bookmark className={cx("size-4", saved && "fill-brand-600 text-brand-600")} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(OpportunityCard);
