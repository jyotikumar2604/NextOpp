import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Briefcase, CalendarClock, CalendarDays, Sparkles, UserRound } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import DeadlineList from "../components/dashboard/DeadlineList";
import ProfileStrength from "../components/dashboard/ProfileStrength";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import EmptyState from "../components/common/EmptyState";
import { LinkButton } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { formatDate, greeting, isClosed, daysUntil } from "../utils/dates";

export default function Dashboard() {
  const { profile, opportunities, matchById, savedSet, savedIds, applications, appByOpportunity, toggleSave, requestApply, upcomingDeadlines, completion } = useApp();
  const haveSkills = profile.skills.map((s) => s.name);

  // Recommended = still open, not already applied to, and a rule-based score of 60 or more.
  const recommended = opportunities
    .filter((o) => !isClosed(o.deadline) && !appByOpportunity.has(o.id) && (matchById.get(o.id)?.score ?? 0) >= 60)
    .sort((a, b) => matchById.get(b.id).score - matchById.get(a.id).score || daysUntil(a.deadline) - daysUntil(b.deadline));

  const inProgress = applications.filter((a) => a.status === "Applied" || a.status === "Interview").length;
  const thisWeek = upcomingDeadlines(7);
  const firstName = profile.name.split(" ")[0];
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{greeting(today)}, {firstName}!</h1>
          <p className="mt-1.5 max-w-xl text-slate-500">Your recommendations are tailored to your skills, interests and eligibility. Here is what to look at today.</p>
          <LinkButton to="/profile" variant="secondary" size="sm" className="mt-4"><UserRound /> {completion.percent === 100 ? "Review profile" : "Update your profile"}</LinkButton>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200" aria-label="Today's date">
          <CalendarDays className="size-8 text-blue-600" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{formatDate(today.toISOString(), { weekday: "long" })}</p>
            <p className="text-lg font-semibold text-slate-900">{formatDate(today.toISOString(), { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Overview" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatsCard icon={Sparkles} tone="blue" label="Recommended for you" value={recommended.length} hint="60%+ match, still open" to="/explore" />
        <StatsCard icon={Bookmark} tone="purple" label="Saved opportunities" value={savedIds.length} hint="Your shortlist" to="/saved" />
        <StatsCard icon={Briefcase} tone="green" label="Applications in progress" value={inProgress} hint="Applied or interviewing" to="/applications" />
        <StatsCard icon={CalendarClock} tone="orange" label="Deadlines this week" value={thisWeek.length} hint="Saved, not yet applied" to="/saved" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Recommended feed */}
        <section aria-labelledby="recs-h" className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="recs-h" className="text-2xl font-semibold tracking-tight">Recommended for you</h2>
              <p className="mt-0.5 text-sm text-slate-500">Rule-based match scores from your profile. Sample listings.</p>
            </div>
            <Link to="/explore" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline">View all <ArrowRight className="size-4" aria-hidden /></Link>
          </div>

          {recommended.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No strong matches yet"
              description="Add skills, interests and preferences to your profile and we'll surface opportunities that fit."
              action={<LinkButton to="/profile">Complete profile</LinkButton>}
            />
          ) : (
            <div className="space-y-4">
              {recommended.slice(0, 5).map((o) => (
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
              ))}
            </div>
          )}
        </section>

        {/* Right rail */}
        <div className="space-y-6">
          <ProfileStrength completion={completion} />
          <DeadlineList items={upcomingDeadlines(14).slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
