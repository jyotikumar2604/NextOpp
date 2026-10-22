import { cx } from "../../utils/profile";

/** Monogram logo tile. Sample data has no real logos, so we derive one from the org name and color. */
export default function CompanyLogo({ name, color = "#2563eb", className }) {
  return (
    <span
      aria-hidden
      className={cx("flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white", className)}
      style={{ backgroundColor: color }}
    >
      {name.trim()[0]?.toUpperCase()}
    </span>
  );
}
