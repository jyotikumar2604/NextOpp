import { Link } from "react-router-dom";

/** Four headline numbers in one band. Each links to where the number can be acted on. */
export default function PulseStrip({ items }) {
  return (
    <section aria-label="Overview" className="grid grid-cols-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[var(--shadow-card)] lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value, hint, to, tone }, i) => (
        <Link
          key={label}
          to={to}
          className={`group flex items-center gap-3.5 p-4 transition-colors hover:bg-stone-50 sm:p-5 ${i % 2 === 1 ? "border-l border-stone-200" : ""} ${i > 1 ? "border-t border-stone-200 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
        >
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-lg sm:flex" style={{ backgroundColor: `${tone}14`, color: tone }}><Icon className="size-5" aria-hidden /></span>
          <span className="min-w-0">
            <span className="font-display block text-3xl font-bold leading-none tabular-nums text-stone-900">{value}</span>
            <span className="mt-1.5 block text-sm font-medium leading-tight text-stone-700 sm:truncate">{label}</span>
            <span className="block text-xs leading-tight text-stone-500 sm:truncate">{hint}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
