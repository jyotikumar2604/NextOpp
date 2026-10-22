import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { daysUntil, deadlineLabel } from "../utils/dates";

/**
 * Notifications are derived from the student's real (mock) data rather than hard-coded,
 * so they stay consistent with saved items, deadlines and profile completeness.
 * With a backend, replace this with GET /notifications and keep the same item shape:
 * { id, kind, title, body, to, read }
 */
export default function useNotifications() {
  const { savedIds, opportunityById, appByOpportunity, matchById, completion, readNotificationIds } = useApp();

  return useMemo(() => {
    const read = new Set(readNotificationIds);
    const items = [];

    for (const id of savedIds) {
      const o = opportunityById.get(id);
      if (!o || appByOpportunity.has(id)) continue;
      const d = daysUntil(o.deadline);
      if (d !== null && d >= 0 && d <= 3) {
        items.push({ id: `deadline:${id}`, kind: "deadline", title: o.title, body: `${deadlineLabel(o.deadline)} · saved by you`, to: `/opportunities/${id}` });
      }
    }

    const topMatch = [...opportunityById.values()]
      .filter((o) => !savedIds.includes(o.id) && !appByOpportunity.has(o.id) && (daysUntil(o.deadline) ?? 0) >= 0)
      .map((o) => ({ o, score: matchById.get(o.id)?.score ?? 0 }))
      .sort((a, b) => b.score - a.score)[0];
    if (topMatch && topMatch.score >= 85) {
      items.push({ id: `match:${topMatch.o.id}`, kind: "match", title: `Strong match: ${topMatch.o.title}`, body: `${topMatch.score}% match · ${topMatch.o.organization}`, to: `/opportunities/${topMatch.o.id}` });
    }

    if (completion.percent < 100 && completion.missing[0]) {
      items.push({ id: `profile:${completion.percent}`, kind: "profile", title: `Your profile is ${completion.percent}% complete`, body: `${completion.missing[0].label} to improve your matches.`, to: "/profile" });
    }

    return items.map((n) => ({ ...n, read: read.has(n.id) }));
  }, [savedIds, opportunityById, appByOpportunity, matchById, completion, readNotificationIds]);
}
