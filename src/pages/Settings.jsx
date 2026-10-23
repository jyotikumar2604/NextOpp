import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Download, Eye, RotateCcw, UserRound } from "lucide-react";
import Toggle from "../components/common/Toggle";
import Modal from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { isMockApi, resetMockData } from "../services/api";
import { downloadJson } from "../utils/exportData";
import { cx } from "../utils/profile";

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3 border-b border-stone-100 p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="size-5" aria-hidden /></span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-stone-500">{description}</p>}
        </div>
      </div>
      <div className="divide-y divide-stone-100">{children}</div>
    </section>
  );
}

function Row({ title, description, id, control, children }) {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-900">{title}</p>
          <p id={id} className="mt-0.5 text-sm text-stone-500">{description}</p>
        </div>
        {control}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings, profile, savedIds, applications } = useApp();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    downloadJson("nextopp-my-data.json", { exportedAt: new Date().toISOString(), profile, savedOpportunityIds: savedIds, applications, settings });
    toast.success("Your data was downloaded to this device.");
  };

  const select = "input h-9 w-auto min-w-40";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight sm:text-[32px]">Settings</h1>
        <p className="mt-1 text-stone-500">Changes save automatically.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Section icon={Bell} title="Notifications" description="Controls what appears in the bell menu.">
          <Row
            title="Deadline reminders"
            id="d-reminders"
            description="Get a reminder when a saved opportunity you haven't applied to is about to close."
            control={<Toggle checked={settings.deadlineReminders} onChange={(v) => updateSettings({ deadlineReminders: v })} label="Deadline reminders" describedBy="d-reminders" />}
          >
            {settings.deadlineReminders && (
              <div className="mt-3">
                <label htmlFor="lead" className="mb-1 block text-xs font-medium text-stone-500">Remind me when a deadline is within</label>
                <select id="lead" className={select} value={settings.reminderDays} onChange={(e) => updateSettings({ reminderDays: Number(e.target.value) })}>
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                </select>
              </div>
            )}
          </Row>
          <Row
            title="Strong match alerts"
            id="m-alerts"
            description="Tell me when an unsaved opportunity scores above a threshold."
            control={<Toggle checked={settings.matchAlerts} onChange={(v) => updateSettings({ matchAlerts: v })} label="Strong match alerts" describedBy="m-alerts" />}
          >
            {settings.matchAlerts && (
              <div className="mt-3">
                <label htmlFor="thr" className="mb-1 block text-xs font-medium text-stone-500">Alert me at or above</label>
                <select id="thr" className={select} value={settings.matchThreshold} onChange={(e) => updateSettings({ matchThreshold: Number(e.target.value) })}>
                  <option value={75}>75% match</option>
                  <option value={85}>85% match</option>
                  <option value={95}>95% match</option>
                </select>
              </div>
            )}
          </Row>
          <Row
            title="Profile tips"
            id="p-tips"
            description="Suggest the next step that would improve your matches."
            control={<Toggle checked={settings.profileTips} onChange={(v) => updateSettings({ profileTips: v })} label="Profile tips" describedBy="p-tips" />}
          />
          <p className="bg-stone-50 px-5 py-3 text-xs text-stone-500">Notifications appear in the app only. Email and push delivery need the backend and aren't available in demo mode.</p>
        </Section>

        <Section icon={Eye} title="Privacy" description="Who could see your profile once sharing exists.">
          <fieldset className="p-5">
            <legend className="sr-only">Profile visibility</legend>
            {[
              { v: "private", t: "Private", d: "Only you can see your profile." },
              { v: "organizations", t: "Organizations I apply to", d: "Share my profile only with organizations I choose to apply to." },
            ].map((o) => (
              <label key={o.v} className={cx("mb-2 flex cursor-pointer gap-3 rounded-lg border p-3.5 last:mb-0", settings.visibility === o.v ? "border-brand-600 bg-brand-50/50" : "border-stone-200 hover:bg-stone-50")}>
                <input type="radio" name="visibility" value={o.v} checked={settings.visibility === o.v} onChange={() => updateSettings({ visibility: o.v })} className="mt-1 accent-brand-600" />
                <span><span className="block text-sm font-medium text-stone-900">{o.t}</span><span className="block text-sm text-stone-500">{o.d}</span></span>
              </label>
            ))}
            <p className="mt-3 text-xs text-stone-500">Saved on this device. Nothing is shared with anyone in demo mode.</p>
          </fieldset>
        </Section>

        <Section icon={UserRound} title="Account and data">
          <Row title="Account" description={`${profile.name} · ${profile.email}`} control={<Link to="/profile" className="shrink-0 text-sm font-medium text-brand-600 hover:underline">Edit profile</Link>} />
          <Row title="Export my data" description="Download your profile, saved items, applications and settings as a JSON file." control={<Button variant="secondary" size="sm" onClick={exportData}><Download /> Export</Button>} />
          {isMockApi && (
            <Row title="Reset demo data" description="Restore the sample student, saved items and applications. This only affects this browser." control={<Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}><RotateCcw /> Reset</Button>} />
          )}
        </Section>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="Your edits, saved items, applications and settings in this browser will be replaced with the original sample data."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { resetMockData(); window.location.reload(); }}>Reset everything</Button>
          </>
        }
      />
    </div>
  );
}
