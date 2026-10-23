import { cx } from "../../utils/profile";

const colorFor = (s) => (s >= 80 ? "#16a34a" : s >= 60 ? "#2d47f0" : "#a8a29e");

/**
 * Circular match indicator. The score is a transparent rule-based estimate (see utils/matching.js),
 * so the tooltip says so rather than implying a prediction.
 */
export default function MatchRing({ score, size = 52, dark = false, className }) {
  const stroke = Math.max(4, Math.round(size / 11));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cx("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${score} percent match`}
      title="Rule-based estimate from your skills, interests and the listing's stated eligibility."
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.14)" : "#e7e5e4"} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "#8fa0ff" : colorFor(score)} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
      </svg>
      <span className={cx("font-display absolute inset-0 flex items-center justify-center font-bold tabular-nums", dark ? "text-white" : "text-stone-900")} style={{ fontSize: size * 0.3 }}>
        {score}
        <span className="font-sans font-medium opacity-60" style={{ fontSize: size * 0.18 }}>%</span>
      </span>
    </div>
  );
}
