import { useMemo, useState } from "react";
import { Bookmark, SearchX } from "lucide-react";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import EmptyState from "../components/common/EmptyState";
import { Button, LinkButton } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { OPPORTUNITY_TYPES } from "../data/constants";
import { matchesQuery } from "../utils/filters";

export default function Saved() {
  const { profile, savedIds, opportunityById, matchById, savedSet, appByOpportunity, toggleSave, requestApply } = useApp();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const haveSkills = useMemo(() => profile.skills.map((s) => s.name), [profile.skills]);

  const saved = savedIds.map((id) => opportunityById.get(id)).filter(Boolean);
  const visible = saved.filter((o) => matchesQuery(o, q) && (!type || o.type === type));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight sm:text-[32px]">Saved opportunities</h1>
        <p className="mt-1 text-stone-500">{saved.length ? `${saved.length} saved. Most recently saved first.` : "Your shortlist lives here."}</p>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark on any opportunity to keep it here and watch its deadline."
          action={<LinkButton to="/explore">Explore opportunities</LinkButton>}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your saved opportunities" aria-label="Search saved opportunities" className="input h-11 flex-1" />
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type" className="input h-11 sm:w-52">
              <option value="">All types</option>
              {OPPORTUNITY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={SearchX} title="No saved items match" description="Try a different search or type." action={<Button variant="secondary" onClick={() => { setQ(""); setType(""); }}>Clear filters</Button>} />
          ) : (
            <div className="space-y-4">
              {visible.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} match={matchById.get(o.id)} saved={savedSet.has(o.id)} application={appByOpportunity.get(o.id)} haveSkills={haveSkills} onToggleSave={toggleSave} onQuickApply={requestApply} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
