import { Sparkles } from "lucide-react";
import { cx } from "../../utils/profile";

const tone = (s) => (s >= 80 ? "bg-green-50 text-green-700 ring-green-200" : s >= 60 ? "bg-blue-50 text-blue-700 ring-blue-100" : "bg-slate-100 text-slate-600 ring-slate-200");

/** Match percentage chip. The score is a transparent rule-based estimate, not an AI prediction. */
export default function MatchBadge({ score, size = "md", className }) {
  return (
    <span
      title="Rule-based estimate from your skills, interests and the listing's stated eligibility."
      className={cx(
        "inline-flex items-center gap-1 rounded-lg font-semibold tabular-nums ring-1 ring-inset",
        size === "lg" ? "px-3 py-1.5 text-base" : "px-2 py-1 text-xs",
        tone(score),
        className,
      )}
    >
      <Sparkles className={size === "lg" ? "size-4" : "size-3"} aria-hidden />
      {score}% match
    </span>
  );
}
