import { RotateCcw } from "lucide-react";
import { OPPORTUNITY_TYPES, WORK_MODES } from "../../data/constants";
import { Button } from "../common/Button";

function CheckGroup({ legend, options, selected, counts, onToggle }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-slate-900">{legend}</legend>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} className="size-4 rounded border-slate-300 accent-blue-600" />
            <span className="flex-1">{opt}</span>
            <span className="text-xs tabular-nums text-slate-400">{counts[opt] ?? 0}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Filters for type, work mode and closed listings. Counts reflect the full dataset. */
export default function FilterSidebar({ filters, counts, onChange, onReset, activeCount, compact = false }) {
  const toggle = (key) => (value) =>
    onChange({ ...filters, [key]: filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value] });

  return (
    <div className="space-y-6">
      <div className={compact ? "flex justify-end" : "flex items-center justify-between"}>
        {!compact && <h2 className="text-base font-semibold">Filters</h2>}
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!activeCount} aria-label="Reset all filters">
          <RotateCcw /> Reset
        </Button>
      </div>
      <CheckGroup legend="Type" options={OPPORTUNITY_TYPES} selected={filters.types} counts={counts.types} onToggle={toggle("types")} />
      <CheckGroup legend="Location" options={WORK_MODES} selected={filters.modes} counts={counts.modes} onToggle={toggle("modes")} />
      <fieldset>
        <legend className="mb-2.5 text-sm font-semibold text-slate-900">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={filters.hideClosed} onChange={(e) => onChange({ ...filters, hideClosed: e.target.checked })} className="size-4 rounded border-slate-300 accent-blue-600" />
          Hide closed listings
        </label>
      </fieldset>
    </div>
  );
}
