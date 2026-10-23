import { cx } from "../../utils/profile";

const tones = {
  slate: "bg-stone-100 text-stone-700 ring-stone-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-100",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  green: "bg-green-50 text-green-700 ring-green-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
};

/** Small status/label chip. `tone` picks one of the restrained palette colors. */
export default function Badge({ tone = "slate", className, children, ...props }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}

export const TYPE_TONE = { Internship: "blue", Hackathon: "purple", Scholarship: "green", Fellowship: "orange", Competition: "amber" };
