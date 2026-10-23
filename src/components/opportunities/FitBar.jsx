import { cx } from "../../utils/profile";

/**
 * Skill-fit meter: one segment per REQUIRED skill, filled when you have it.
 * Listings with no required skills show a neutral note instead of an empty bar.
 */
export default function FitBar({ match, required }) {
  if (!required.length) return <p className="text-xs text-stone-500">No required skills listed</p>;
  const missing = match.missingRequired;
  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`${required.length - missing.length} of ${required.length} required skills matched`}>
        {required.map((s) => (
          <span key={s} title={s} className={cx("h-1.5 flex-1 rounded-full", missing.includes(s) ? "bg-stone-200" : "bg-green-500")} />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-stone-500">
        <span className="font-medium text-stone-700">{required.length - missing.length}/{required.length} required skills</span>
        {missing.length > 0 && <span className="text-amber-700"> · gap: {missing.join(", ")}</span>}
      </p>
    </div>
  );
}
