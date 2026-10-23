import { Link } from "react-router-dom";
import { cx } from "../../utils/profile";

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

/** Compact metric card. Links to the page where the number can be acted on. */
export default function StatsCard({ icon: Icon, label, value, hint, tone = "blue", to }) {
  return (
    <Link to={to} className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4">
      <span className={cx("flex size-11 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-semibold leading-none tabular-nums text-slate-900">{value}</span>
        <span className="mt-1 block truncate text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="block truncate text-xs text-slate-500">{hint}</span>}
      </span>
    </Link>
  );
}
