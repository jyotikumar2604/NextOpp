import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import FilterSidebar from "../components/opportunities/FilterSidebar";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { SORT_OPTIONS } from "../data/constants";
import { filterOpportunities } from "../utils/filters";

/** Filters live in the URL (?q=&type=&mode=&sort=&hideClosed=1) so views are shareable and the back button works. */
export default function Explore() {
  const { profile, opportunities, matchById, savedSet, appByOpportunity, toggleSave, requestApply } = useApp();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const haveSkills = useMemo(() => profile.skills.map((s) => s.name), [profile.skills]);

  const filters = {
    q: params.get("q") ?? "",
    types: params.getAll("type"),
    modes: params.getAll("mode"),
    hideClosed: params.get("hideClosed") === "1",
    strongOnly: params.get("fit") === "1",
    sort: params.get("sort") ?? "match",
  };

  const update = (next) => {
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    next.types.forEach((t) => p.append("type", t));
    next.modes.forEach((m) => p.append("mode", m));
    if (next.hideClosed) p.set("hideClosed", "1");
    if (next.strongOnly) p.set("fit", "1");
    if (next.sort !== "match") p.set("sort", next.sort);
    setParams(p, { replace: true });
  };

  const results = useMemo(() => filterOpportunities(opportunities, filters, matchById), [opportunities, matchById, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const types = {};
    const modes = {};
    for (const o of opportunities) {
      types[o.type] = (types[o.type] ?? 0) + 1;
      modes[o.mode] = (modes[o.mode] ?? 0) + 1;
    }
    return { types, modes };
  }, [opportunities]);

  const activeCount = filters.types.length + filters.modes.length + (filters.hideClosed ? 1 : 0) + (filters.strongOnly ? 1 : 0);
  const anyActive = activeCount > 0 || !!filters.q;
  const reset = () => update({ ...filters, q: "", types: [], modes: [], hideClosed: false, strongOnly: false });
  const chips = [
    ...filters.types.map((v) => ({ key: `t-${v}`, label: v, remove: () => update({ ...filters, types: filters.types.filter((x) => x !== v) }) })),
    ...filters.modes.map((v) => ({ key: `m-${v}`, label: v, remove: () => update({ ...filters, modes: filters.modes.filter((x) => x !== v) }) })),
    ...(filters.strongOnly ? [{ key: "fit", label: "60%+ matches", remove: () => update({ ...filters, strongOnly: false }) }] : []),
    ...(filters.hideClosed ? [{ key: "hc", label: "Hide closed", remove: () => update({ ...filters, hideClosed: false }) }] : []),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight sm:text-[32px]">Explore opportunities</h1>
        <p className="mt-1 text-stone-500">Internships, hackathons, scholarships, fellowships and competitions in one place.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
            <FilterSidebar filters={filters} counts={counts} onChange={update} onReset={reset} activeCount={activeCount} />
          </div>
        </aside>

        <section className="min-w-0" aria-label="Results">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -transtone-y-1/2 text-stone-400" aria-hidden />
              <input
                type="search"
                value={filters.q}
                onChange={(e) => update({ ...filters, q: e.target.value })}
                placeholder="Search by title, company, skill or category"
                aria-label="Search opportunities"
                className="input h-11 pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="h-11 lg:hidden" onClick={() => setDrawer(true)}>
                <SlidersHorizontal /> Filters{activeCount ? ` (${activeCount})` : ""}
              </Button>
              <select aria-label="Sort by" value={filters.sort} onChange={(e) => update({ ...filters, sort: e.target.value })} className="input h-11 w-auto min-w-44 flex-1 sm:flex-none">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-stone-700" aria-live="polite">{results.length} {results.length === 1 ? "opportunity" : "opportunities"}</p>
            {chips.map((c) => (
              <button key={c.key} type="button" onClick={c.remove} aria-label={`Remove filter ${c.label}`} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100">
                {c.label} <X className="size-3" aria-hidden />
              </button>
            ))}
            {anyActive && <button type="button" onClick={reset} className="text-xs font-medium text-stone-500 underline hover:text-stone-800">Clear all</button>}
          </div>

          <div className="mt-4 space-y-4">
            {results.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No opportunities match your filters"
                description="Try a broader search term or remove a filter."
                action={<Button variant="secondary" onClick={reset}>Clear all filters</Button>}
              />
            ) : (
              results.map((o) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  match={matchById.get(o.id)}
                  saved={savedSet.has(o.id)}
                  application={appByOpportunity.get(o.id)}
                  haveSkills={haveSkills}
                  onToggleSave={toggleSave}
                  onQuickApply={requestApply}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filters" footer={<Button onClick={() => setDrawer(false)}>Show {results.length} results</Button>}>
        <FilterSidebar compact filters={filters} counts={counts} onChange={update} onReset={reset} activeCount={activeCount} />
      </Modal>
    </div>
  );
}
