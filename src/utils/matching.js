// Transparent, rule-based match scoring. This is NOT machine learning.
// Each signal has a fixed weight; signals with no data are skipped and the score is
// normalised over the signals that remain, so missing information never counts against a student.
//
//   required skills   50   preferred skills   15   interests + category fit  20
//   work-mode fit      5   eligibility        10
//
// If the student clearly fails a stated eligibility rule, the score is capped at 60.

export const MATCH_WEIGHTS = { required: 50, preferred: 15, interest: 20, mode: 5, eligibility: 10 };
export const MATCH_CAP_WHEN_INELIGIBLE = 60;
export const TOTAL_SIGNALS = 5;

const norm = (s) => s.trim().toLowerCase();

/** Compare a listing's stated eligibility with the profile. Returns one row per stated rule. */
export function checkEligibility(opp, profile) {
  const rows = [];
  const { years, graduationYears } = opp.eligibility ?? {};

  if (years?.length) {
    const label = `Year of study: ${years.join(", ")}`;
    rows.push({
      key: "years",
      label,
      status: !profile.yearOfStudy ? "unknown" : years.includes(Number(profile.yearOfStudy)) ? "meets" : "fails",
    });
  } else {
    rows.push({ key: "years", label: "Year of study", status: "not-stated" });
  }

  if (graduationYears) {
    const [min, max] = graduationYears;
    const g = Number(profile.graduationYear);
    rows.push({
      key: "grad",
      label: `Graduating between ${min} and ${max}`,
      status: !g ? "unknown" : g >= min && g <= max ? "meets" : "fails",
    });
  } else {
    rows.push({ key: "grad", label: "Graduation year", status: "not-stated" });
  }
  return rows;
}

export function computeMatch(opp, profile) {
  const have = new Set((profile.skills ?? []).map((s) => norm(s.name)));
  const required = opp.requiredSkills ?? [];
  const preferred = opp.preferredSkills ?? [];

  const matchedRequired = required.filter((s) => have.has(norm(s)));
  const missingRequired = required.filter((s) => !have.has(norm(s)));
  const matchedPreferred = preferred.filter((s) => have.has(norm(s)));
  const missingPreferred = preferred.filter((s) => !have.has(norm(s)));

  const signals = [];
  const reasons = [];

  if (required.length) {
    signals.push({ key: "required", weight: MATCH_WEIGHTS.required, ratio: matchedRequired.length / required.length });
    reasons.push(
      matchedRequired.length
        ? `Matches ${matchedRequired.length} of ${required.length} required skills: ${matchedRequired.join(", ")}.`
        : `None of the ${required.length} required skills are on your profile yet.`,
    );
  }
  if (preferred.length) {
    signals.push({ key: "preferred", weight: MATCH_WEIGHTS.preferred, ratio: matchedPreferred.length / preferred.length });
    if (matchedPreferred.length)
      reasons.push(
        required.length
          ? `You also have preferred skills: ${matchedPreferred.join(", ")}.`
          : `You have ${matchedPreferred.length} of the ${preferred.length} skills it mentions: ${matchedPreferred.join(", ")}.`,
      );
  }

  // Interests + category preference: half for the type, half for overlapping interests.
  const sharedInterests = (opp.interests ?? []).filter((i) => (profile.interests ?? []).some((p) => norm(p) === norm(i)));
  const typePreferred = (profile.preferredTypes ?? []).includes(opp.type);
  if ((profile.interests?.length || profile.preferredTypes?.length) && (opp.interests?.length || profile.preferredTypes?.length)) {
    const ratio = (typePreferred ? 0.5 : 0) + (opp.interests?.length ? (sharedInterests.length ? 0.5 : 0) : 0.5 * (typePreferred ? 1 : 0));
    signals.push({ key: "interest", weight: MATCH_WEIGHTS.interest, ratio: Math.min(1, ratio) });
    if (sharedInterests.length) reasons.push(`Fits your interest in ${sharedInterests.join(", ")}.`);
    if (typePreferred) reasons.push(`${opp.type} is a category you prefer.`);
  }

  if (profile.preferredModes?.length) {
    const fits = profile.preferredModes.includes(opp.mode);
    signals.push({ key: "mode", weight: MATCH_WEIGHTS.mode, ratio: fits ? 1 : 0 });
    if (fits) reasons.push(`${opp.mode} work fits your preference.`);
  }

  const eligibility = checkEligibility(opp, profile);
  const known = eligibility.filter((r) => r.status === "meets" || r.status === "fails");
  const fails = eligibility.filter((r) => r.status === "fails");
  if (known.length) {
    signals.push({ key: "eligibility", weight: MATCH_WEIGHTS.eligibility, ratio: (known.length - fails.length) / known.length });
    if (!fails.length) reasons.push("You appear to meet the stated eligibility rules.");
  }
  if (fails.length) reasons.push(`May not meet: ${fails.map((f) => f.label).join("; ")}.`);
  if (missingRequired.length) reasons.push(`Missing required: ${missingRequired.join(", ")}.`);

  const totalWeight = signals.reduce((n, s) => n + s.weight, 0);
  let score = totalWeight ? Math.round((signals.reduce((n, s) => n + s.weight * s.ratio, 0) / totalWeight) * 100) : 0;
  if (fails.length) score = Math.min(score, MATCH_CAP_WHEN_INELIGIBLE);

  return {
    score,
    reasons,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    eligibility,
    ineligible: fails.length > 0,
    signalsUsed: signals.length,
    summary: reasons[0] ?? "Add skills and interests to your profile to see why this fits.",
  };
}
