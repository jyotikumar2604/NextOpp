import { Circle } from "lucide-react";
import ProgressRing from "../common/ProgressRing";
import { LinkButton } from "../common/Button";

export default function ProfileStrength({ completion }) {
  const next = completion.missing.slice(0, 3);
  return (
    <section aria-labelledby="strength-h" className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 id="strength-h" className="text-lg font-semibold">Your profile strength</h2>
      <div className="mt-4 flex items-center gap-5">
        <ProgressRing value={completion.percent} />
        <p className="text-sm leading-relaxed text-stone-600">
          {completion.percent === 100
            ? "Your profile is complete. Every recommendation uses all of it."
            : "A fuller profile gives you more accurate matches."}
        </p>
      </div>
      {next.length > 0 && (
        <ul className="mt-4 space-y-2">
          {next.map((m) => (
            <li key={m.key} className="flex items-center gap-2 text-sm text-stone-600">
              <Circle className="size-3.5 shrink-0 text-stone-300" aria-hidden />
              <span className="flex-1">{m.label}</span>
              <span className="text-xs font-medium text-brand-600">+{m.weight}%</span>
            </li>
          ))}
        </ul>
      )}
      <LinkButton to="/profile" className="mt-5 w-full">{completion.percent === 100 ? "Review profile" : "Complete profile"}</LinkButton>
    </section>
  );
}
