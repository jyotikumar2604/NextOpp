import { Check } from "lucide-react";
import Badge from "../common/Badge";

/**
 * Most-requested skills across open listings. Bar length = number of listings that mention the skill
 * (solid = required, light = preferred). The text states the same numbers, so nothing relies on color.
 */
export default function DemandBars({ rows, openCount }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <ul className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.skill}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-stone-900">{r.skill}</span>
            {r.have ? <Badge tone="green"><Check className="size-3" aria-hidden /> You have it</Badge> : <Badge tone="amber">Gap</Badge>}
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden>
            <span className="h-full bg-brand-600" style={{ width: `${(r.requiredIn / max) * 100}%` }} />
            <span className="h-full bg-brand-200" style={{ width: `${(r.preferredIn / max) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {r.requiredIn} required · {r.preferredIn} preferred · of {openCount} open listings
          </p>
        </li>
      ))}
    </ul>
  );
}
