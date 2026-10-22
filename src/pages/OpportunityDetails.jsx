import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, CalendarClock, Check, CircleHelp, Clock, ExternalLink, Gift, Info, MapPin, Send, X } from "lucide-react";
import Badge, { TYPE_TONE } from "../components/common/Badge";
import CompanyLogo from "../components/common/CompanyLogo";
import EmptyState from "../components/common/EmptyState";
import { Button, LinkButton } from "../components/common/Button";
import MatchBadge from "../components/opportunities/MatchBadge";
import SkillTags from "../components/opportunities/SkillTags";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import { useApp } from "../context/AppContext";
import { TOTAL_SIGNALS } from "../utils/matching";
import { deadlineLabel, deadlineTone, formatDate, isClosed } from "../utils/dates";
import { cx } from "../utils/profile";

const ELIG_BADGE = {
  meets: <Badge tone="green"><Check className="size-3" aria-hidden /> You appear to meet this</Badge>,
  fails: <Badge tone="red"><X className="size-3" aria-hidden /> You may not meet this</Badge>,
  unknown: <Badge tone="amber"><CircleHelp className="size-3" aria-hidden /> Add to your profile</Badge>,
  "not-stated": <Badge tone="slate">Not stated in listing</Badge>,
};

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-slate-900">{children}</dd>
      </div>
    </div>
  );
}

export default function OpportunityDetails() {
  const { id } = useParams();
  const { profile, opportunities, opportunityById, matchById, savedSet, appByOpportunity, toggleSave, requestApply, } = useApp();
  const o = opportunityById.get(id);
  const haveSkills = useMemo(() => profile.skills.map((s) => s.name), [profile.skills]);

  const related = useMemo(() => {
    if (!o) return [];
    const mine = new Set([...o.requiredSkills, ...o.preferredSkills]);
    return opportunities
      .filter((x) => x.id !== o.id && !isClosed(x.deadline))
      .map((x) => ({ x, shared: [...x.requiredSkills, ...x.preferredSkills].filter((s) => mine.has(s)).length + (x.type === o.type ? 1 : 0) }))
      .filter((r) => r.shared > 0)
      .sort((a, b) => b.shared - a.shared || (matchById.get(b.x.id)?.score ?? 0) - (matchById.get(a.x.id)?.score ?? 0))
      .slice(0, 2)
      .map((r) => r.x);
  }, [o, opportunities, matchById]);

  if (!o) {
    return (
      <EmptyState
        icon={Info}
        title="Opportunity not found"
        description="It may have been removed, or the link is incorrect."
        action={<LinkButton to="/explore">Back to Explore</LinkButton>}
      />
    );
  }

  const match = matchById.get(o.id);
  const closed = isClosed(o.deadline);
  const saved = savedSet.has(o.id);
  const application = appByOpportunity.get(o.id);
  const tone = deadlineTone(o.deadline);

  // Concrete next steps, each derived from the match result (nothing invented).
  const nextSteps = [];
  if (closed) nextSteps.push("This listing has closed. Save similar opportunities to be ready next time.");
  else {
    if (match.missingRequired.length) nextSteps.push(`Build or add the missing required skill${match.missingRequired.length > 1 ? "s" : ""}: ${match.missingRequired.join(", ")}.`);
    if (match.ineligible) nextSteps.push("Confirm eligibility directly with the organizer before applying.");
    if (match.eligibility.some((r) => r.status === "unknown")) nextSteps.push("Add your year of study and graduation year to your profile for a firmer eligibility check.");
    nextSteps.push(`Apply on the official page before ${formatDate(o.deadline)}.`);
  }

  return (
    <div>
      <Link to="/explore" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" aria-hidden /> Back to Explore</Link>

      {/* Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <CompanyLogo name={o.organization} color={o.color} className="size-14 text-xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={TYPE_TONE[o.type]}>{o.type}</Badge>
                {closed && <Badge tone="slate">Closed</Badge>}
                <Badge tone="slate">Sample listing</Badge>
              </div>
              <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{o.title}</h1>
              <p className="mt-1 text-slate-500">{o.organization}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="secondary" size="lg" onClick={() => toggleSave(o)} aria-pressed={saved}>
              <Bookmark className={cx(saved && "fill-blue-600 text-blue-600")} /> {saved ? "Saved" : "Save"}
            </Button>
            {application ? (
              <LinkButton to="/applications" size="lg" variant="soft"><Check /> {application.status}. View tracker</LinkButton>
            ) : (
              <Button size="lg" disabled={closed} onClick={() => requestApply(o)}><Send /> {closed ? "Applications closed" : "Apply Now"}</Button>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={CalendarClock} label="Deadline">
            {formatDate(o.deadline)}
            <span className={cx("block text-xs font-normal", tone === "urgent" ? "text-red-600" : tone === "soon" ? "text-amber-700" : "text-slate-500")}>{deadlineLabel(o.deadline)}</span>
          </Fact>
          <Fact icon={Clock} label="Duration">{o.duration}</Fact>
          <Fact icon={MapPin} label="Location">{o.mode}<span className="block text-xs font-normal text-slate-500">{o.location}</span></Fact>
          <Fact icon={Gift} label="Compensation">{o.compensation}</Fact>
        </dl>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold">About this opportunity</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-slate-600">{o.description}</p>

            <h3 className="mt-6 text-lg font-semibold">Requirements</h3>
            <ul className="mt-3 space-y-2">
              {o.requirements.map((r) => (
                <li key={r} className="flex gap-2.5 text-slate-600"><Check className="mt-1 size-4 shrink-0 text-blue-600" aria-hidden />{r}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]" aria-labelledby="skills-h">
            <h2 id="skills-h" className="text-xl font-semibold">Skills</h2>
            {o.requiredSkills.length + o.preferredSkills.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">This listing doesn't state specific skills.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {o.requiredSkills.length > 0 && (
                  <div><p className="mb-2 text-sm font-medium text-slate-700">Required</p><SkillTags skills={o.requiredSkills} have={haveSkills} /></div>
                )}
                {o.preferredSkills.length > 0 && (
                  <div><p className="mb-2 text-sm font-medium text-slate-700">Preferred</p><SkillTags skills={o.preferredSkills} have={haveSkills} /></div>
                )}
                <p className="text-xs text-slate-500">Green means the skill is on your profile.</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]" aria-labelledby="elig-h">
            <h2 id="elig-h" className="text-xl font-semibold">Eligibility</h2>
            <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {match.eligibility.map((r) => (
                <li key={r.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="text-slate-700">{r.label}</span>
                  {ELIG_BADGE[r.status]}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex gap-2 text-xs text-slate-500"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />"Not stated" means the listing didn't say, not that there is no rule. Always confirm eligibility on the official page.</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold">Source</h2>
            {o.sourceUrl ? (
              <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
                View the original listing <ExternalLink className="size-4" aria-hidden />
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No source link is available for this sample listing.</p>
            )}
          </section>
        </div>

        {/* Match explanation */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]" aria-labelledby="match-h">
            <div className="flex items-center justify-between gap-2">
              <h2 id="match-h" className="text-lg font-semibold">Why this matches you</h2>
              <MatchBadge score={match.score} size="lg" />
            </div>
            <ul className="mt-4 space-y-2.5">
              {match.reasons.map((r) => <li key={r} className="flex gap-2 text-sm text-slate-600"><Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />{r}</li>)}
            </ul>

            {(match.matchedRequired.length > 0 || match.missingRequired.length > 0 || match.missingPreferred.length > 0) && (
              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                {match.matchedRequired.length + match.matchedPreferred.length > 0 && (
                  <div><p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Matching skills</p>
                    <div className="flex flex-wrap gap-1.5">{[...match.matchedRequired, ...match.matchedPreferred].map((s) => <Badge key={s} tone="green"><Check className="size-3" aria-hidden />{s}</Badge>)}</div></div>
                )}
                {match.missingRequired.length + match.missingPreferred.length > 0 && (
                  <div><p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Missing skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missingRequired.map((s) => <Badge key={s} tone="orange">{s} · required</Badge>)}
                      {match.missingPreferred.map((s) => <Badge key={s} tone="slate">{s} · preferred</Badge>)}
                    </div></div>
                )}
              </div>
            )}

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">Your next step</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">{nextSteps.map((s) => <li key={s}>{s}</li>)}</ol>
            </div>

            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Rule-based estimate using {match.signalsUsed} of {TOTAL_SIGNALS} signals with data. It is a guide, not a prediction, and is not AI-generated.
            </p>
          </section>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-h">
          <h2 id="related-h" className="mb-4 text-2xl font-semibold tracking-tight">Related opportunities</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {related.map((r) => (
              <OpportunityCard key={r.id} opportunity={r} match={matchById.get(r.id)} saved={savedSet.has(r.id)} application={appByOpportunity.get(r.id)} haveSkills={haveSkills} onToggleSave={toggleSave} onQuickApply={requestApply} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
