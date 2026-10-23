// Skill-gap analysis: plain counting over the opportunity dataset. No prediction involved.
// Every number below can be explained as "N of M open listings".

import { isClosed } from "./dates";

const norm = (s) => s.trim().toLowerCase();

/**
 * Returns demand + gap information for every skill named in an OPEN listing.
 *  requiredIn / preferredIn  how many open listings ask for it
 *  unlocks                   open listings where this is your ONLY missing required skill
 *  savedDemand               how many of your saved or tracked open listings ask for it
 */
export function analyseSkills(opportunities, profile, { savedIds = [], trackedIds = [] } = {}) {
  const open = opportunities.filter((o) => !isClosed(o.deadline));
  const have = new Map((profile.skills ?? []).map((s) => [norm(s.name), s]));
  const mine = new Set([...savedIds, ...trackedIds]);
  const inMotion = new Set(trackedIds); // already applied: not counted as something a new skill "unlocks"
  const table = new Map();

  const row = (name) => {
    if (!table.has(name)) table.set(name, { skill: name, requiredIn: 0, preferredIn: 0, unlocks: 0, savedDemand: 0 });
    return table.get(name);
  };

  for (const o of open) {
    const missingRequired = o.requiredSkills.filter((s) => !have.has(norm(s)));
    for (const s of o.requiredSkills) {
      const r = row(s);
      r.requiredIn += 1;
      if (mine.has(o.id)) r.savedDemand += 1;
      if (!inMotion.has(o.id) && missingRequired.length === 1 && missingRequired[0] === s) r.unlocks += 1;
    }
    for (const s of o.preferredSkills) {
      const r = row(s);
      r.preferredIn += 1;
      if (mine.has(o.id)) r.savedDemand += 1;
    }
  }

  const all = [...table.values()].map((r) => ({
    ...r,
    total: r.requiredIn + r.preferredIn,
    have: have.has(norm(r.skill)),
    level: have.get(norm(r.skill))?.level ?? null,
  }));

  // Priority: unlocks the most listings, then required demand, then your own shortlist, then preferred demand.
  const gaps = all
    .filter((r) => !r.have)
    .sort((a, b) => b.unlocks - a.unlocks || b.requiredIn - a.requiredIn || b.savedDemand - a.savedDemand || b.preferredIn - a.preferredIn || a.skill.localeCompare(b.skill));
  const demand = [...all].sort((a, b) => b.total - a.total || b.requiredIn - a.requiredIn || a.skill.localeCompare(b.skill));

  // Coverage: of all "required skill" slots across open listings, how many you already hold.
  const slots = open.reduce((n, o) => n + o.requiredSkills.length, 0);
  const covered = open.reduce((n, o) => n + o.requiredSkills.filter((s) => have.has(norm(s))).length, 0);

  return { openCount: open.length, gaps, demand, coverage: slots ? Math.round((covered / slots) * 100) : 0, slots, covered };
}

/** Human-readable basis for a gap row. */
export function basisText(row, openCount) {
  const parts = [];
  if (row.requiredIn) parts.push(`required in ${row.requiredIn}`);
  if (row.preferredIn) parts.push(`preferred in ${row.preferredIn}`);
  return `${parts.join(" and ")} of ${openCount} open listings`;
}
