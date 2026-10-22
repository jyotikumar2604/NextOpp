import { Check } from "lucide-react";
import Badge from "../common/Badge";

/**
 * Skill chips. Skills you already have are highlighted green; others are neutral.
 * `max` truncates the list with a "+N" overflow chip (use on cards, omit on detail pages).
 */
export default function SkillTags({ skills, have = [], max }) {
  const haveSet = new Set(have.map((s) => s.toLowerCase()));
  const shown = max ? skills.slice(0, max) : skills;
  if (!skills.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Skills">
      {shown.map((s) => {
        const owned = haveSet.has(s.toLowerCase());
        return (
          <li key={s}>
            <Badge tone={owned ? "green" : "slate"}>
              {owned && <Check className="size-3" aria-label="You have this skill" />}
              {s}
            </Badge>
          </li>
        );
      })}
      {max && skills.length > max && (
        <li>
          <Badge tone="slate" aria-label={`${skills.length - max} more skills`}>+{skills.length - max}</Badge>
        </li>
      )}
    </ul>
  );
}
