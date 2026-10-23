import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Info, PartyPopper, Plus, Target } from "lucide-react";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { LinkButton } from "../components/common/Button";
import SkillPriorityCard from "../components/skills/SkillPriorityCard";
import DemandBars from "../components/skills/DemandBars";
import MatchRing from "../components/opportunities/MatchRing";
import { useApp } from "../context/AppContext";
import { analyseSkills } from "../utils/skills";
import { isClosed } from "../utils/dates";

export default function SkillGap() {
  const { profile, opportunities, opportunityById, savedIds, applications, matchById, addSkill, toggleLearning } = useApp();
  const [showAll, setShowAll] = useState(false);

  const analysis = useMemo(
    () => analyseSkills(opportunities, profile, { savedIds, trackedIds: applications.map((a) => a.opportunityId) }),
    [opportunities, profile, savedIds, applications],
  );

  const open = opportunities.filter((o) => !isClosed(o.deadline));
  const savedOpen = savedIds.map((id) => opportunityById.get(id)).filter((o) => o && !isClosed(o.deadline));
  const [selected, setSelected] = useState(savedOpen[0]?.id ?? open[0]?.id ?? "");
  const sel = opportunityById.get(selected);
  const selMatch = sel ? matchById.get(sel.id) : null;

  const learning = new Set(profile.learning ?? []);
  const shownGaps = showAll ? analysis.gaps : analysis.gaps.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight sm:text-[32px]">Skill gap analysis</h1>
        <p className="mt-1 max-w-2xl text-stone-500">What open opportunities ask for, compared with what is on your profile. Every number is a count of listings, not a prediction.</p>
      </div>

      {profile.skills.length === 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="size-5 shrink-0" aria-hidden />
          <p className="flex-1">Your profile has no skills yet, so every skill below shows as a gap.</p>
          <LinkButton to="/profile" size="sm" variant="secondary">Add skills</LinkButton>
        </div>
      )}

      {/* Summary */}
      <section aria-label="Summary" className="grid grid-cols-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[var(--shadow-card)] sm:grid-cols-3">
        {[
          { v: `${analysis.coverage}%`, l: "Required-skill coverage", h: `${analysis.covered} of ${analysis.slots} required-skill slots across ${analysis.openCount} open listings` },
          { v: profile.skills.length, l: "Skills on your profile", h: `${learning.size} marked as learning` },
          { v: analysis.gaps.length, l: "Skills you could add", h: "Mentioned by open listings, not on your profile" },
        ].map((s, i) => (
          <div key={s.l} className={`p-5 ${i > 0 ? "border-t border-stone-200 sm:border-l sm:border-t-0" : ""}`}>
            <p className="font-display text-3xl font-bold tabular-nums text-stone-900">{s.v}</p>
            <p className="mt-1.5 text-sm font-medium text-stone-700">{s.l}</p>
            <p className="text-xs text-stone-500">{s.h}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="learn-h" className="min-w-0">
          <h2 id="learn-h" className="text-2xl font-semibold tracking-tight">Learn next</h2>
          <p className="mb-4 mt-0.5 text-sm text-stone-500">Ranked by how many listings the skill unlocks, then how often it is required, then your shortlist.</p>
          {analysis.gaps.length === 0 ? (
            <EmptyState icon={PartyPopper} title="No skill gaps found" description="Your profile covers every skill named in the open sample listings." />
          ) : (
            <div className="space-y-4">
              {shownGaps.map((row, i) => (
                <SkillPriorityCard key={row.skill} row={row} rank={i + 1} openCount={analysis.openCount} learning={learning.has(row.skill)} onToggleLearning={toggleLearning} onAdd={addSkill} />
              ))}
              {analysis.gaps.length > 5 && (
                <button type="button" onClick={() => setShowAll((s) => !s)} className="text-sm font-medium text-brand-600 hover:underline">
                  {showAll ? "Show top 5 only" : `Show all ${analysis.gaps.length} skills`}
                </button>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="demand-h" className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 id="demand-h" className="text-lg font-semibold">Most requested skills</h2>
            <p className="mb-4 mt-0.5 text-xs text-stone-500">Across {analysis.openCount} open sample listings.</p>
            <DemandBars rows={analysis.demand.slice(0, 10)} openCount={analysis.openCount} />
          </section>
        </aside>
      </div>

      {/* Per-opportunity check */}
      <section aria-labelledby="check-h" className="mt-10 rounded-xl border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 id="check-h" className="flex items-center gap-2 text-xl font-semibold"><Target className="size-5 text-brand-600" aria-hidden /> Check a specific opportunity</h2>
        <div className="mt-4 max-w-xl">
          <label htmlFor="opp-select" className="mb-1.5 block text-sm font-medium text-stone-800">Opportunity</label>
          <select id="opp-select" value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
            {savedOpen.length > 0 && (
              <optgroup label="Your saved">{savedOpen.map((o) => <option key={o.id} value={o.id}>{o.title} · {o.organization}</option>)}</optgroup>
            )}
            <optgroup label="All open">{open.map((o) => <option key={o.id} value={o.id}>{o.title} · {o.organization}</option>)}</optgroup>
          </select>
        </div>

        {sel && selMatch && (
          <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-4 md:flex-col md:items-start">
              <MatchRing score={selMatch.score} size={84} />
              <Link to={`/opportunities/${sel.id}`} className="text-sm font-medium text-brand-600 hover:underline">Open full details</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-stone-900">You have</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[...selMatch.matchedRequired, ...selMatch.matchedPreferred].map((s) => <Badge key={s} tone="green"><Check className="size-3" aria-hidden />{s}</Badge>)}
                  {selMatch.matchedRequired.length + selMatch.matchedPreferred.length === 0 && <p className="text-sm text-stone-500">None of the listed skills yet.</p>}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-stone-900">You're missing</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selMatch.missingRequired.map((s) => <Badge key={s} tone="orange"><Plus className="size-3" aria-hidden />{s} · required</Badge>)}
                  {selMatch.missingPreferred.map((s) => <Badge key={s} tone="slate"><Plus className="size-3" aria-hidden />{s} · preferred</Badge>)}
                  {selMatch.missingRequired.length + selMatch.missingPreferred.length === 0 && <p className="text-sm text-stone-500">Nothing. You cover every listed skill.</p>}
                </div>
              </div>
              <p className="text-xs text-stone-500 sm:col-span-2">
                Rule-based, using {selMatch.signalsUsed} of 5 signals. {sel.requiredSkills.length === 0 && sel.preferredSkills.length === 0 ? "This listing doesn't state specific skills." : ""}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
