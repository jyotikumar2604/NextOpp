// Date helpers. All comparisons use whole calendar days in the user's local time zone.

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Whole days from today until `iso` (negative when in the past). null if no date. */
export function daysUntil(iso) {
  if (!iso) return null;
  return Math.round((startOfDay(iso) - startOfDay(new Date())) / 86_400_000);
}

export const isClosed = (iso) => {
  const d = daysUntil(iso);
  return d !== null && d < 0;
};

/** Human label for a deadline, e.g. "Closes in 6 days". */
export function deadlineLabel(iso) {
  const d = daysUntil(iso);
  if (d === null) return "Rolling deadline";
  if (d < 0) return "Closed";
  if (d === 0) return "Closes today";
  if (d === 1) return "Closes tomorrow";
  return `Closes in ${d} days`;
}

/** Urgency tone: red only when 2 days or less, amber within a week. */
export function deadlineTone(iso) {
  const d = daysUntil(iso);
  if (d === null) return "neutral";
  if (d < 0) return "closed";
  if (d <= 2) return "urgent";
  if (d <= 7) return "soon";
  return "neutral";
}

export const formatDate = (iso, opts = { month: "short", day: "numeric", year: "numeric" }) =>
  iso ? new Intl.DateTimeFormat("en-US", opts).format(new Date(iso)) : "—";

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
