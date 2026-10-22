import { useState } from "react";
import { Briefcase, Inbox } from "lucide-react";
import ApplicationCard from "../components/applications/ApplicationCard";
import EmptyState from "../components/common/EmptyState";
import { LinkButton } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { APPLICATION_STATUSES } from "../data/constants";
import { cx } from "../utils/profile";

const TABS = ["All", ...APPLICATION_STATUSES];

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
        <p className="mt-1 text-slate-500">Track each application from submission to decision. Statuses are updated by you.</p>
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
          <div role="tablist" aria-label="Filter applications by status" className="-mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-slate-200 px-4 sm:mx-0 sm:px-0">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                id={`tab-${t}`}
                aria-selected={tab === t}
                aria-controls="app-panel"
                onClick={() => setTab(t)}
                className={cx(
                  "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                  tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800",
                )}
              >
                {t}
                <span className={cx("rounded-full px-2 text-xs tabular-nums", tab === t ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600")}>{counts[t]}</span>
              </button>
            ))}
          </div>

          <div id="app-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4">
            {visible.length === 0 ? (
              <EmptyState icon={Inbox} title={`No ${tab.toLowerCase()} applications`} description="Change an application's status and it will appear under the matching tab." />
            ) : (
              visible.map(({ a, o }) => <ApplicationCard key={a.id} application={a} opportunity={o} onUpdate={updateApplication} onRemove={removeApplication} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
