import { useState } from "react";
import { Briefcase, Inbox } from "lucide-react";
import ApplicationCard from "../components/applications/ApplicationCard";
import EmptyState from "../components/common/EmptyState";
import { LinkButton } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { APPLICATION_STATUSES } from "../data/constants";
import { cx } from "../utils/profile";

const TABS = ["All", ...APPLICATION_STATUSES];
const STAGE_COLOR = { Applied: "#2d47f0", Interview: "#a855f7", Offered: "#16a34a", Rejected: "#dc2626" };

export default function Applications() {
  const { applications, opportunityById, updateApplication, removeApplication } = useApp();
  const [tab, setTab] = useState("All");

  // Guard against an application pointing at a listing that no longer exists.
  const rows = applications.map((a) => ({ a, o: opportunityById.get(a.opportunityId) })).filter((r) => r.o);
  const counts = Object.fromEntries(TABS.map((t) => [t, t === "All" ? rows.length : rows.filter((r) => r.a.status === t).length]));
  const visible = tab === "All" ? rows : rows.filter((r) => r.a.status === tab);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight sm:text-[32px]">My applications</h1>
        <p className="mt-1 text-stone-500">Track each application from submission to decision. You update the status yourself.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="When you apply to an opportunity and confirm it, it shows up here so you can track every stage."
          action={<LinkButton to="/explore">Find something to apply to</LinkButton>}
        />
      ) : (
        <>
          {/* Pipeline: each stage is a tab; the bar shows how your applications are distributed. */}
          <div role="tablist" aria-label="Filter applications by stage" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                id={`tab-${t}`}
                aria-selected={tab === t}
                aria-controls="app-panel"
                onClick={() => setTab(t)}
                className={cx(
                  "rounded-xl border p-4 text-left transition-colors",
                  tab === t ? "border-brand-600 bg-white shadow-[0_0_0_1px_#2d47f0]" : "border-stone-200 bg-white hover:border-stone-300",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  {t !== "All" && <span className="size-2 rounded-full" style={{ backgroundColor: STAGE_COLOR[t] }} aria-hidden />}
                  {t}
                </span>
                <span className="font-display mt-1 block text-3xl font-bold tabular-nums text-stone-900">{counts[t]}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden>
            {APPLICATION_STATUSES.map((s) => (
              <span key={s} style={{ width: `${(counts[s] / rows.length) * 100}%`, backgroundColor: STAGE_COLOR[s] }} />
            ))}
          </div>

          <div id="app-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5 space-y-4">
            {visible.length === 0 ? (
              <EmptyState icon={Inbox} title={`No ${tab.toLowerCase()} applications`} description="Change an application's status and it will appear under the matching stage." />
            ) : (
              visible.map(({ a, o }) => <ApplicationCard key={a.id} application={a} opportunity={o} onUpdate={updateApplication} onRemove={removeApplication} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
