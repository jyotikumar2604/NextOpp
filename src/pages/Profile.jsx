import { useMemo, useState } from "react";
import Field from "../components/common/Field";
import ProgressRing from "../components/common/ProgressRing";
import { Button } from "../components/common/Button";
import TagEditor from "../components/profile/TagEditor";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { INTEREST_SUGGESTIONS, OPPORTUNITY_TYPES, SKILL_SUGGESTIONS, WORK_MODES, YEARS_OF_STUDY } from "../data/constants";
import { cx, initials, profileCompletion, validateProfile } from "../utils/profile";

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function PillGroup({ legend, options, selected, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-stone-800">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <label key={o} className={cx("cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600", on ? "border-brand-600 bg-brand-50 font-medium text-brand-700" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50")}>
              <input type="checkbox" className="sr-only" checked={on} onChange={() => onChange(on ? selected.filter((x) => x !== o) : [...selected, o])} />
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Profile() {
  const { profile, updateProfile } = useApp();
  const toast = useToast();
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(profile), [draft, profile]);
  const live = useMemo(() => profileCompletion(draft), [draft]); // completion updates as you type
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const setVal = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please fix the highlighted fields.");
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setSaving(true);
    const cleaned = { ...draft, name: draft.name.trim(), email: draft.email.trim(), github: draft.github.trim(), yearOfStudy: Number(draft.yearOfStudy) || null, graduationYear: Number(draft.graduationYear) };
    const ok = await updateProfile(cleaned);
    setSaving(false);
    if (ok) setDraft(cleaned);
  };

  return (
    <div>
      {/* Header */}
      <section className="mb-6 flex flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white" aria-hidden>{initials(draft.name)}</span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{draft.name || "Your profile"}</h1>
          <p className="text-stone-500">{[draft.major, draft.university].filter(Boolean).join(" · ") || "Add your major and university"}</p>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing value={live.percent} size={72} stroke={8} />
          <div className="text-sm">
            <p className="font-semibold text-stone-900">Profile strength</p>
            <p className="max-w-48 text-stone-500">{live.missing[0] ? `Next: ${live.missing[0].label.toLowerCase()}.` : "All sections complete."}</p>
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <Section title="Basic information" description="Used for your account and to check eligibility.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}><input className="input" value={draft.name} onChange={set("name")} autoComplete="name" /></Field>
            <Field label="Email" required error={errors.email}><input className="input" type="email" value={draft.email} onChange={set("email")} autoComplete="email" /></Field>
            <Field label="Major / field of study" required error={errors.major}><input className="input" value={draft.major} onChange={set("major")} /></Field>
            <Field label="University"><input className="input" value={draft.university} onChange={set("university")} /></Field>
            <Field label="Year of study">
              <select className="input" value={draft.yearOfStudy ?? ""} onChange={set("yearOfStudy")}>
                <option value="">Select year</option>
                {YEARS_OF_STUDY.map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </Field>
            <Field label="Expected graduation year" required error={errors.graduationYear}><input className="input" type="number" inputMode="numeric" value={draft.graduationYear ?? ""} onChange={set("graduationYear")} /></Field>
            <Field label="Location" hint="City and country. Helps with on-site and hybrid listings." className="sm:col-span-2"><input className="input" value={draft.location} onChange={set("location")} /></Field>
          </div>
        </Section>

        <Section title="Skills" description="Skills you list are compared with each opportunity's requirements.">
          <TagEditor label="Add a skill" items={draft.skills} onChange={setVal("skills")} suggestions={SKILL_SUGGESTIONS} withLevel placeholder="e.g. React, Python, Figma" error={errors.skills} />
        </Section>

        <Section title="Interests and preferences">
          <TagEditor label="Interests" items={draft.interests} onChange={setVal("interests")} suggestions={INTEREST_SUGGESTIONS} placeholder="e.g. Open Source, Data Science" />
          <PillGroup legend="Preferred opportunity categories" options={OPPORTUNITY_TYPES} selected={draft.preferredTypes} onChange={setVal("preferredTypes")} />
          <PillGroup legend="Preferred work modes" options={WORK_MODES} selected={draft.preferredModes} onChange={setVal("preferredModes")} />
        </Section>

        <Section title="Career goals and links">
          <Field label="Career goals" hint="A sentence or two about what you want to do next. Max 400 characters.">
            <textarea className="input" rows={3} maxLength={400} value={draft.careerGoals} onChange={set("careerGoals")} />
          </Field>
          <Field label="GitHub or portfolio link" hint="Optional. Must start with https://" error={errors.github}>
            <input className="input" type="url" value={draft.github} onChange={set("github")} placeholder="https://github.com/username" />
          </Field>
        </Section>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <span className="mr-auto text-sm text-stone-500" aria-live="polite">{dirty ? "You have unsaved changes." : "All changes saved."}</span>
          <Button variant="secondary" disabled={!dirty || saving} onClick={() => { setDraft(profile); setErrors({}); }}>Discard</Button>
          <Button type="submit" disabled={!dirty || saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </div>
      </form>
    </div>
  );
}
