import { useState } from "react";
import { BookOpen, Check, GraduationCap, Plus } from "lucide-react";
import Badge from "../common/Badge";
import { Button } from "../common/Button";
import { SKILL_LEVELS } from "../../data/constants";
import { guideFor } from "../../data/skillGuides";
import { basisText } from "../../utils/skills";

/** One ranked skill to learn, with the counting behind the ranking and general first steps. */
export default function SkillPriorityCard({ row, rank, openCount, learning, onToggleLearning, onAdd }) {
  const [level, setLevel] = useState("Beginner");
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-base font-bold text-white" aria-label={`Priority ${rank}`}>{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{row.skill}</h3>
            {learning && <Badge tone="purple"><GraduationCap className="size-3" aria-hidden /> Learning</Badge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.requiredIn > 0 && <Badge tone="orange">Required in {row.requiredIn}</Badge>}
            {row.preferredIn > 0 && <Badge tone="slate">Preferred in {row.preferredIn}</Badge>}
            {row.savedDemand > 0 && <Badge tone="brand">{row.savedDemand} on your shortlist</Badge>}
          </div>
          {row.unlocks > 0 && (
            <p className="mt-3 flex gap-2 text-sm font-medium text-green-700"><Check className="mt-0.5 size-4 shrink-0" aria-hidden /> Learning this completes the required skills for {row.unlocks} open {row.unlocks === 1 ? "listing" : "listings"}.</p>
          )}
          <p className="mt-2 text-xs text-stone-500">Why it ranks here: {basisText(row, openCount)}.</p>

          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"><BookOpen className="size-4" aria-hidden /> How to start</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-600">{guideFor(row.skill).map((s) => <li key={s}>{s}</li>)}</ol>
            <p className="mt-2 text-xs text-stone-500">General starter steps, not a personalised course.</p>
          </details>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
            <Button variant={learning ? "soft" : "secondary"} size="sm" aria-pressed={learning} onClick={() => onToggleLearning(row.skill)}>
              <GraduationCap /> {learning ? "Learning" : "Mark as learning"}
            </Button>
            <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:block" aria-hidden />
            <label className="sr-only" htmlFor={`lvl-${row.skill}`}>Proficiency for {row.skill}</label>
            <select id={`lvl-${row.skill}`} value={level} onChange={(e) => setLevel(e.target.value)} className="input h-8 w-auto py-0 text-[13px]">
              {SKILL_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <Button size="sm" onClick={() => onAdd(row.skill, level)}><Plus /> I have this skill</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
