import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Briefcase, CalendarClock, CalendarDays, Sparkles } from "lucide-react";
import PulseStrip from "../components/dashboard/PulseStrip";
import NextMoveHero from "../components/dashboard/NextMoveHero";
import DeadlineRunway from "../components/dashboard/DeadlineRunway";
import ProfileStrength from "../components/dashboard/ProfileStrength";
import SkillFocus from "../components/dashboard/SkillFocus";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import EmptyState from "../components/common/EmptyState";
import { LinkButton } from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { analyseSkills } from "../utils/skills";
import { daysUntil, formatDate, greeting, isClosed } from "../utils/dates";

export default function Dashboard() {
  const { profile, opportunities, matchById, savedSet, savedIds, applications, appByOpportunity, toggleSave, requestApply, upcomingDeadlines, completion } = useApp();
  const haveSkills = profile.skills.map((s) => s.name);

  // Recommended = still open, not already applied to, rule-based score of 60 or more.
  const recommended = useMemo(
    () =>
      opportunities
        .filter((o) => !isClosed(o.deadline) && !appByOpportunity.has(o.id) && (matchById.get(o.id)?.score ?? 0) >= 60)
        .sort((a, b) => matchById.get(b.id).score - matchById.get(a.id).score || daysUntil(a.deadline) - daysUntil(b.deadline)),
    [opportunities, appByOpportunity, matchById],
  );

  // Hero rule (shown to the student): best match closing within a week, otherwise best match overall.
  const closingSoon = recommended.filter((o) => daysUntil(o.deadline) <= 7);
  const hero = closingSoon[0] ?? recommended[0];
  const heroWhy = closingSoon[0] ? "Chosen as your highest match closing within a week." : "Chosen as your highest match overall.";
  const list = recommended.filter((o) => o.id !== hero?.id).slice(0, 4);

  const analysis = useMemo(
    () => analyseSkills(opportunities, profile, { savedIds, trackedIds: applications.map((a) => a.opportunityId) }),
    [opportunities, profile, savedIds, applications],
  );

  const inProgress = applications.filter((a) => a.status === "Applied" || a.status === "Interview").length;
  const thisWeek = upcomingDeadlines(7).length;
  const today = new Date().toISOString();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{greeting()}, {profile.name.split(" ")[0]}!</h1>
          <p className="mt-1 text-stone-500">Everything here is tailored to your skills, interests and eligibility.</p>
        </div>
        <p className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm sm:self-auto">
          <CalendarDays className="size-4 text-brand-600" aria-hidden /> {formatDate(today, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </header>

      {hero ? (
        <NextMoveHero opportunity={hero} match={matchById.get(hero.id)} why={heroWhy} onQuickApply={requestApply} />
      ) : (
        <EmptyState icon={Sparkles} title="No strong matches yet" description="Add skills, interests and preferences to your profile and we'll surface opportunities that fit." action={<LinkButton to="/profile">Complete profile</LinkButton>} />
      )}

      <PulseStrip
        items={[
          { icon: Sparkles, label: "Recommended for you", value: recommended.length, hint: "60%+ match, still open", to: "/explore?fit=1", tone: "#2d47f0" },
          { icon: Bookmark, label: "Saved opportunities", value: savedIds.length, hint: "Your shortlist", to: "/saved", tone: "#a855f7" },
          { icon: Briefcase, label: "Applications in progress", value: inProgress, hint: "Applied or interviewing", to: "/applications", tone: "#16a34a" },
          { icon: CalendarClock, label: "Deadlines this week", value: thisWeek, hint: "Saved, not yet applied", to: "/saved", tone: "#f97316" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <DeadlineRunway items={upcomingDeadlines(14)} />

          <section aria-labelledby="recs-h">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 id="recs-h" className="text-2xl font-semibold tracking-tight">More for you</h2>
                <p className="mt-0.5 text-sm text-stone-500">Rule-based match scores from your profile. Sample listings.</p>
              </div>
              <Link to="/explore" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:underline">View all <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
            <div className="space-y-4">
              {list.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} match={matchById.get(o.id)} saved={savedSet.has(o.id)} application={appByOpportunity.get(o.id)} haveSkills={haveSkills} onToggleSave={toggleSave} onQuickApply={requestApply} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <ProfileStrength completion={completion} />
          <SkillFocus gap={analysis.gaps[0]} openCount={analysis.openCount} />
        </div>
      </div>
    </div>
  );
}
