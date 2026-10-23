import { daysUntil } from "./dates";

const includes = (haystack, needle) => haystack.toLowerCase().includes(needle);

/** Free-text search over title, organization, type, location, skills and interests. */
export function matchesQuery(opp, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [opp.title, opp.organization, opp.type, opp.location, opp.description, ...opp.requiredSkills, ...opp.preferredSkills, ...opp.interests].some(
    (field) => includes(field, needle),
  );
}

/**
 * Filter + sort a list of opportunities.
 * `matchById` is a Map of id -> match result, used for relevance sorting.
 */
export function filterOpportunities(list, { q = "", types = [], modes = [], hideClosed = false, strongOnly = false, sort = "match" }, matchById) {
  const out = list.filter(
    (o) =>
      matchesQuery(o, q) &&
      (!types.length || types.includes(o.type)) &&
      (!modes.length || modes.includes(o.mode)) &&
      (!hideClosed || daysUntil(o.deadline) >= 0) &&
      (!strongOnly || (matchById.get(o.id)?.score ?? 0) >= 60),
  );

  const byDeadline = (a, b) => {
    // Closed items sink to the bottom; otherwise soonest first.
    const da = daysUntil(a.deadline) ?? 9999;
    const db = daysUntil(b.deadline) ?? 9999;
    if ((da < 0) !== (db < 0)) return da < 0 ? 1 : -1;
    return da - db;
  };

  const sorters = {
    match: (a, b) => (matchById.get(b.id)?.score ?? 0) - (matchById.get(a.id)?.score ?? 0) || byDeadline(a, b),
    deadline: byDeadline,
    newest: (a, b) => new Date(b.postedAt) - new Date(a.postedAt),
  };
  return out.sort(sorters[sort] ?? sorters.match);
}
