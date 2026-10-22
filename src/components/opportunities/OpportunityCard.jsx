import { memo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, CalendarClock, CheckCircle2, Clock, MapPin, Sparkles } from "lucide-react";
import Badge, { TYPE_TONE } from "../common/Badge";
import CompanyLogo from "../common/CompanyLogo";
import { Button, LinkButton } from "../common/Button";
import MatchBadge from "./MatchBadge";
import SkillTags from "./SkillTags";
import { deadlineLabel, deadlineTone, isClosed } from "../../utils/dates";
import { cx } from "../../utils/profile";

const DEADLINE_STYLE = {
  neutral: "text-slate-600",
  soon: "font-medium text-amber-700",
  urgent: "font-semibold text-red-600",
  closed: "font-medium text-slate-500",
};

/**
 * One card used on Dashboard, Explore and Saved so every list reads the same way.
 * Props are plain data + callbacks so the card stays presentational and easy to test.
 */
function OpportunityCard({ opportunity: o, match, saved, application, haveSkills = [], onToggleSave, onQuickApply }) {
  const closed = isClosed(o.deadline);
  const tone = deadlineTone(o.deadline);
  const skills = [...o.requiredSkills, ...o.preferredSkills];

  return (
    <article className={cx("flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md", closed && "opacity-80")}>
      <div className="flex items-start gap-3">
        <CompanyLogo name={o.organization} color={o.color} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-semibold leading-snug text-slate-900">
            <Link to={`/opportunities/${o.id}`} className="hover:text-blue-700 hover:underline">{o.title}</Link>
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span>{o.organization}</span>
            <Badge tone={TYPE_TONE[o.type]}>{o.type}</Badge>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
          {match && !closed && <MatchBadge score={match.score} />}
          <button
            type="button"
            onClick={() => onToggleSave(o)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${o.title} from saved` : `Save ${o.title}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
          >
            <Bookmark className={cx("size-5", saved && "fill-blue-600 text-blue-600")} aria-hidden />
          </button>
        </div>
      </div>

      {match && !closed ? (
        <p className="mt-3 flex gap-2 text-sm leading-relaxed text-slate-600">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
          <span><span className="sr-only">Why it matches: </span>{match.summary}</span>
        </p>
      ) : (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{o.description}</p>
      )}

      {skills.length > 0 && (
        <div className="mt-3">
          <SkillTags skills={skills} have={haveSkills} max={5} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[13px] text-slate-500">
        <span className={cx("inline-flex items-center gap-1.5", DEADLINE_STYLE[tone])}>
          <CalendarClock className="size-4" aria-hidden /> {deadlineLabel(o.deadline)}
        </span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden /> {o.mode}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden /> {o.duration}</span>

        <div className="ml-auto flex items-center gap-2">
          {application ? (
            <Badge tone="green"><CheckCircle2 className="size-3" aria-hidden /> {application.status}</Badge>
          ) : (
            !closed && onQuickApply && <Button variant="secondary" size="sm" onClick={() => onQuickApply(o)}>Quick apply</Button>
          )}
          <LinkButton to={`/opportunities/${o.id}`} size="sm" variant="soft">View details</LinkButton>
        </div>
      </div>
    </article>
  );
}

export default memo(OpportunityCard);
