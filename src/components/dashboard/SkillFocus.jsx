import { ArrowRight, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { basisText } from "../../utils/skills";

/** The one skill worth learning next, with the counting behind the suggestion. */
export default function SkillFocus({ gap, openCount }) {
  return (
    <section aria-labelledby="focus-h" className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 id="focus-h" className="flex items-center gap-2 text-lg font-semibold"><Target className="size-5 text-brand-600" aria-hidden /> Skill focus</h2>
      {gap ? (
        <>
          <p className="font-display mt-3 text-2xl font-bold text-stone-900">{gap.skill}</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {gap.unlocks > 0
              ? `It's the only required skill missing for ${gap.unlocks} open ${gap.unlocks === 1 ? "listing" : "listings"}.`
              : `Asked for by ${gap.total} open ${gap.total === 1 ? "listing" : "listings"}.`}
          </p>
          <p className="mt-1 text-xs text-stone-500">Basis: {basisText(gap, openCount)}.</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-stone-600">No skill gaps found across open listings. Nice work.</p>
      )}
      <Link to="/skills" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">See full skill gap analysis <ArrowRight className="size-4" aria-hidden /></Link>
    </section>
  );
}
