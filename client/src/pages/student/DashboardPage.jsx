import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { opportunitiesAPI, applicationsAPI, savedAPI, notificationsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, Bookmark, BookmarkCheck, ExternalLink,
  Clock, CheckCircle2, AlertCircle, TrendingUp,
  Calendar, Briefcase, BarChart3, ClipboardList, Target,
  Sparkles, ShieldCheck, Compass, Zap, MapPin, DollarSign
} from 'lucide-react';
import {
  getCategoryDisplay, deadlineDisplay, scoreDisplay,
  formatDate, getInitials, relativeTime, CATEGORY_MAP, getWorkModeDisplay
} from '../../utils/helpers';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { CardSkeleton, StatCard, EmptyState, ErrorState, ScoreRing } from '../../components/ui/SharedComponents';
import toast from 'react-hot-toast';
import { savedAPI as savedApiShortcut } from '../../api';

const QUICK_EXPLORE_LINKS = [
  { label: 'All Opportunities', to: '/explore', icon: Compass },
  { label: 'Internships', to: '/explore?category=internship', emoji: '💼' },
  { label: 'Hackathons', to: '/explore?category=hackathon', emoji: '⚡' },
  { label: 'Scholarships', to: '/explore?category=scholarship', emoji: '🎓' },
  { label: 'Fellowships', to: '/explore?category=fellowship', emoji: '🔬' },
  { label: 'Remote Only', to: '/explore?workMode=remote', emoji: '🏠' },
  { label: 'Closing This Week', to: '/explore?deadline=week', emoji: '⏰' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    topMatch: null,
    isPersonalized: false,
    recommendedMessage: '',
    recommended: [],
    beginnerOpportunities: [],
    first30DaysJourney: [],
    applications: [],
    appStats: null,
    saved: [],
    notifications: [],
    upcomingDeadlines: [],
  });
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [recMessage, setRecMessage] = useState(null);
  const [savingTop, setSavingTop] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [recData, appData, savedData, notifData, appStats] = await Promise.allSettled([
        opportunitiesAPI.recommended(),
        applicationsAPI.list({ limit: 5, sort: 'newest' }),
        savedAPI.list({ limit: 3 }),
        notificationsAPI.list({ limit: 5, unread: 'true' }),
        applicationsAPI.stats(),
      ]);

      const recValue = recData.status === 'fulfilled' ? recData.value : {};
      const recommended = recValue.opportunities || [];
      const isPersonalized = recValue.isPersonalized || false;
      const topMatch = recValue.topMatch || (isPersonalized ? recommended[0] : null) || null;
      const recommendedMessage = recValue.message || '';
      const beginnerOpportunities = recValue.beginnerOpportunities || [];
      const first30DaysJourney = recValue.first30DaysJourney || [];
      const applications = appData.status === 'fulfilled' ? appData.value.applications || [] : [];
      const saved = savedData.status === 'fulfilled' ? savedData.value.saved || [] : [];
      const notifications = notifData.status === 'fulfilled' ? notifData.value.notifications || [] : [];
      const stats = appStats.status === 'fulfilled' ? appStats.value.stats : null;

      // Upcoming deadlines = applications with future deadlines sorted
      const upcoming = applications
        .filter((a) => a.opportunity?.deadline && new Date(a.opportunity.deadline) > new Date())
        .sort((a, b) => new Date(a.opportunity.deadline) - new Date(b.opportunity.deadline))
        .slice(0, 5);

      setData({
        topMatch,
        isPersonalized,
        recommendedMessage,
        recommended: recommended.slice(0, 6),
        beginnerOpportunities,
        first30DaysJourney,
        applications,
        appStats: stats,
        saved,
        notifications,
        upcomingDeadlines: upcoming
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTop() {
    if (!data.topMatch) return;
    setSavingTop(true);
    try {
      if (data.topMatch.isSaved) {
        await savedApiShortcut.unsave(data.topMatch._id);
        setData((d) => ({ ...d, topMatch: { ...d.topMatch, isSaved: false } }));
        toast.success('Removed from saved');
      } else {
        await savedApiShortcut.save(data.topMatch._id);
        setData((d) => ({ ...d, topMatch: { ...d.topMatch, isSaved: true } }));
        toast.success('Opportunity saved!');
      }
    } catch (err) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSavingTop(false);
    }
  }

  const stats = [
    {
      label: 'Active Applications',
      value: data.appStats?.byStatus ? Object.values(data.appStats.byStatus).reduce((a, b) => a + b, 0) : '0',
      icon: ClipboardList,
      color: 'text-charcoal-900',
      to: '/tracker',
      subtitle: 'in pipeline',
      trend: 'Manage stages & notes →',
    },
    {
      label: 'Saved Opportunities',
      value: data.saved?.length || '0',
      icon: Bookmark,
      color: 'text-charcoal-900',
      to: '/saved',
      subtitle: 'bookmarked',
      trend: 'View saved list →',
    },
    {
      label: 'Upcoming Deadlines',
      value: data.upcomingDeadlines.length,
      icon: Clock,
      color: data.upcomingDeadlines.length > 0 ? 'text-amber-600' : 'text-charcoal-900',
      to: '/explore?deadline=week',
      subtitle: 'closing soon',
      trend: data.upcomingDeadlines.length > 0 ? '⏰ Action required' : 'Explore opportunities →',
    },
    {
      label: 'Success Rate',
      value: data.appStats?.successRate != null ? `${data.appStats.successRate}%` : '—',
      icon: TrendingUp,
      color: 'text-charcoal-900',
      to: '/tracker',
      subtitle: 'offer conversion',
      trend: 'View analytics in tracker →',
    },
  ];

  if (error) return (
    <div className="p-8 max-w-4xl mx-auto">
      <ErrorState message={error} onRetry={fetchDashboardData} />
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Editorial Greeting Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E3D8] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold">{today}</span>
              <span className="text-charcoal-300">•</span>
              <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Matching Active
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 tracking-tight leading-tight">
              {greeting}, <span className="text-rust-600 italic font-normal">{firstName}</span>
            </h1>
            <p className="text-charcoal-500 text-sm mt-1 max-w-xl">
              "Find the role. Fix the gaps. Make your move." Here is your daily career intelligence brief.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm bg-white"
            >
              Update Profile & Skills
            </Link>
            <Link
              to="/explore"
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              Explore All Roles
            </Link>
          </div>
        </div>

        {/* Quick Discovery Bar (Intuitive & User-Friendly URLs) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-2xs uppercase tracking-widest text-charcoal-400 font-bold">Quick Role Discovery</span>
            <Link to="/explore" className="text-xs text-rust-600 hover:text-rust-700 font-medium flex items-center gap-1">
              Explore with advanced filters <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {QUICK_EXPLORE_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap bg-[#FEFCF8] border border-[#DDD8CC] text-charcoal-800 hover:border-charcoal-500 hover:shadow-sm transition-all"
                >
                  {link.emoji ? <span>{link.emoji}</span> : Icon && <Icon className="w-3.5 h-3.5 text-rust-600" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Move hero */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-xl text-charcoal-900">Today's Move</h2>
                <Link to="/explore" className="text-sm text-rust-600 hover:text-rust-700 flex items-center gap-1">
                  Browse all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="card p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="skeleton h-5 w-40" />
                    <div className="skeleton h-7 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-20 w-full" />
                    <div className="flex gap-3">
                      <div className="skeleton h-10 flex-1" />
                      <div className="skeleton h-10 w-10" />
                    </div>
                  </div>
                </div>
              ) : !data.isPersonalized ? (
                <div className="bg-charcoal-900 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rust-600 translate-x-20 -translate-y-20" />
                  </div>
                  <div className="relative">
                    <Target className="w-10 h-10 text-charcoal-500 mb-4" />
                    <h3 className="font-serif text-xl text-cream-100 mb-2">Your personalized match is waiting</h3>
                    <p className="text-charcoal-400 text-sm mb-1">
                      {data.recommendedMessage || 'Complete your profile to unlock skill-matched opportunities, gap analysis, and your daily "Today\'s Move" pick.'}
                    </p>
                    <ul className="text-charcoal-500 text-xs space-y-1 mb-6 mt-3">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-charcoal-600" /> Skill-match scoring on every opportunity</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-charcoal-600" /> Gap analysis — know exactly what to learn</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-charcoal-600" /> Personalized daily recommendation</li>
                    </ul>
                    <Link to="/profile" className="inline-flex items-center gap-2 btn bg-rust-600 text-cream-100 hover:bg-rust-700 border-0">
                      Complete your profile <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : data.topMatch ? (
                <TodaysMoveCard
                  opportunity={data.topMatch}
                  onSave={handleSaveTop}
                  savingInProgress={savingTop}
                />
              ) : (
                <div className="card p-8 text-center">
                  <Target className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-600 font-medium mb-2">No personalized matches yet</p>
                  <p className="text-sm text-charcoal-400 mb-4">
                    Complete your profile to get match scores.
                  </p>
                  <Link to="/profile" className="btn-primary btn-sm inline-flex">Complete profile</Link>
                </div>
              )}
            </div>

            {/* Recommended opportunities */}
            {!loading && data.recommended.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif text-xl text-charcoal-900">Recommended for you</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.recommended.map((opp) => (
                    <OpportunityCard key={opp._id} opportunity={opp} showMatch />
                  ))}
                </div>
              </div>
            )}

            {/* "Start From Where You Are" — Beginner & Non-Coding Opportunities */}
            {!loading && data.beginnerOpportunities?.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌱</span>
                      <h2 className="font-serif text-xl text-charcoal-900 font-semibold">Start From Where You Are</h2>
                      <span className="badge bg-emerald-50 text-emerald-800 border-emerald-200 text-2xs font-semibold">
                        No Resume Required
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      First-year friendly Ideathons, case competitions, and innovation challenges where ideas and problem-solving matter more than prior experience.
                    </p>
                  </div>
                  <Link
                    to="/explore?readinessLevel=beginner"
                    className="text-xs text-rust-600 hover:text-rust-700 font-medium whitespace-nowrap self-start sm:self-auto flex items-center gap-1"
                  >
                    All beginner roles <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.beginnerOpportunities.slice(0, 4).map((opp) => (
                    <OpportunityCard key={opp._id} opportunity={opp} showMatch />
                  ))}
                </div>
              </div>
            )}

            {/* "Your First 30 Days on NextOpp" — Guided Journey */}
            {!loading && data.first30DaysJourney?.length > 0 && (
              <div className="card p-6 bg-gradient-to-br from-[#FEFCF8] to-[#F7F4EB] border-[#E8E3D8] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rust-50 border border-rust-200 flex items-center justify-center text-rust-600">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base text-charcoal-900 font-semibold">
                        Your First 30 Days on NextOpp
                      </h3>
                      <p className="text-2xs text-charcoal-500">
                        Tailored milestone roadmap to build momentum without overwhelm.
                      </p>
                    </div>
                  </div>
                  <span className="text-2xs font-bold text-rust-700 bg-rust-50 px-2.5 py-1 rounded-full border border-rust-200">
                    Step-by-Step
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  {data.first30DaysJourney.map((step, idx) => (
                    <div
                      key={step.day}
                      className="p-3.5 bg-white rounded-xl border border-[#E8E3D8] flex flex-col justify-between space-y-2 hover:border-charcoal-400 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-3xs uppercase tracking-wider font-bold text-rust-600 bg-rust-50 px-2 py-0.5 rounded-full border border-rust-200">
                            {step.day}
                          </span>
                          <span className="text-3xs text-charcoal-400 font-semibold">Phase {idx + 1}</span>
                        </div>
                        <h4 className="text-xs font-bold text-charcoal-900 leading-snug">{step.title}</h4>
                        <p className="text-2xs text-charcoal-500 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                      <Link
                        to={step.link}
                        className="text-xs text-rust-600 hover:text-rust-700 font-semibold flex items-center gap-1 pt-1"
                      >
                        {step.action} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Career Readiness Pulse */}
            <div className="card p-5 border-[#E8E3D8] bg-[#FEFCF8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rust-50 border border-rust-200 flex items-center justify-center text-rust-600">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Career Readiness</h3>
                </div>
                <span className="text-2xs font-bold text-rust-700 bg-rust-50 px-2 py-0.5 rounded-full border border-rust-200">
                  Profile Pulse
                </span>
              </div>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Keep your technical skills and certifications up-to-date to ensure top placement in NextOpp's matching algorithm.
              </p>
              <div className="pt-1 flex gap-2">
                <Link
                  to="/profile"
                  className="flex-1 btn-outline text-2xs py-2 justify-center font-medium bg-white"
                >
                  Edit Profile
                </Link>
                <Link
                  to="/explore?deadline=week"
                  className="flex-1 btn bg-charcoal-900 text-cream-100 hover:bg-charcoal-800 text-2xs py-2 justify-center font-medium"
                >
                  Closing Soon
                </Link>
              </div>
            </div>

            {/* Upcoming deadlines */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-charcoal-400" />
                  Upcoming Deadlines
                </h3>
                <Link to="/explore?deadline=week" className="text-2xs text-rust-600 hover:underline font-medium">
                  Week Filter →
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton h-4 w-4 rounded" />
                      <div className="flex-1 space-y-1">
                        <div className="skeleton h-3 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingDeadlines.map((app) => {
                    const dl = deadlineDisplay(app.opportunity?.deadline);
                    return (
                      <div key={app._id} className="flex items-start gap-3">
                        <div className={`mt-0.5 status-dot ${dl.urgent ? 'bg-amber-500' : 'bg-charcoal-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-charcoal-800 line-clamp-1">{app.opportunity?.title}</p>
                          <p className={`text-2xs ${dl.color}`}>{dl.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <Link to="/tracker" className="text-xs text-rust-600 hover:text-rust-700 font-medium flex items-center gap-1 pt-1">
                    View tracker <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-charcoal-400">No upcoming deadlines. Keep tracking!</p>
              )}
            </div>

            {/* Recent applications */}
            <div className="card p-5">
              <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-charcoal-400" />
                Recent Applications
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded" />)}
                </div>
              ) : data.applications.length > 0 ? (
                <div className="space-y-2">
                  {data.applications.slice(0, 4).map((app) => (
                    <div key={app._id} className="flex items-center gap-3 py-1.5">
                      <div className={`badge text-2xs capitalize ${
                        app.status === 'offer' ? 'badge-green' :
                        app.status === 'interviewing' ? 'badge bg-violet-50 text-violet-700 border-violet-200' :
                        app.status === 'rejected' ? 'badge-red' :
                        'badge-category'
                      }`}>
                        {app.status}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-charcoal-800 line-clamp-1">
                          {app.opportunity?.title || 'Opportunity'}
                        </p>
                        <p className="text-2xs text-charcoal-400">{relativeTime(app.appliedAt)}</p>
                      </div>
                    </div>
                  ))}
                  <Link to="/tracker" className="text-xs text-rust-600 hover:text-rust-700 font-medium flex items-center gap-1 pt-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-charcoal-400 mb-2">No applications yet</p>
                  <Link to="/explore" className="text-xs text-rust-600 hover:text-rust-700 font-medium">Find opportunities →</Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            {data.notifications.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-charcoal-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {data.notifications.map((notif) => (
                    <div key={notif._id} className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-rust-600 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-charcoal-800">{notif.title}</p>
                        <p className="text-2xs text-charcoal-400">{relativeTime(notif.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <Link to="/notifications" className="text-xs text-rust-600 hover:text-rust-700 font-medium flex items-center gap-1">
                    All notifications <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Today's Move Card ─────────────────────────────────────────────────────────
function TodaysMoveCard({ opportunity, onSave, savingInProgress }) {
  const navigate = useNavigate();
  const category = getCategoryDisplay(opportunity.category);
  const deadline = deadlineDisplay(opportunity.deadline);
  const workMode = getWorkModeDisplay(opportunity.workMode);
  const score = opportunity.matchScore || 0;
  const scoreMeta = scoreDisplay(score);

  const slug = opportunity.title
    ? opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : '';
  const detailUrl = slug ? `/opportunities/${opportunity._id}/${slug}` : `/opportunities/${opportunity._id}`;

  const handleApply = (e) => {
    e.stopPropagation();
    if (opportunity.applicationUrl) {
      window.open(opportunity.applicationUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(detailUrl);
    }
  };

  const isHighMatch = score >= 75;

  return (
    <div className="bg-gradient-to-br from-charcoal-900 via-[#1F1F1F] to-charcoal-950 rounded-2xl p-6 sm:p-8 text-cream-100 border border-charcoal-700/80 shadow-2xl relative overflow-hidden group">
      {/* Subtle radial ambient background light */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rust-600/10 rounded-full blur-3xl pointer-events-none -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none translate-y-20 -translate-x-20" />

      <div className="relative space-y-6">
        {/* Top Header Label */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs uppercase tracking-widest font-bold bg-rust-500/20 text-rust-300 border border-rust-500/30">
              <Sparkles className="w-3 h-3 text-rust-400" />
              Today's Signature Move
            </span>
            <span className={`badge border ${category.className} text-xs`}>
              {category.emoji} {category.label}
            </span>
            {opportunity.sourceName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs bg-charcoal-800 text-charcoal-300 border border-charcoal-700">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {opportunity.sourceName}
              </span>
            )}
          </div>

          {deadline.urgent && (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Closes soon
            </span>
          )}
        </div>

        {/* Title, Organization & Score Ring */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-cream-100 font-semibold leading-tight tracking-tight">
              {opportunity.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-charcoal-400 font-medium flex-wrap">
              <span className="text-cream-200">{opportunity.organization}</span>
              {opportunity.location && (
                <>
                  <span className="text-charcoal-600">•</span>
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
                    {opportunity.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Match Score Display */}
          <div className="flex items-center sm:flex-col items-end sm:items-center justify-between sm:justify-center p-3.5 sm:p-4 rounded-xl bg-charcoal-800/80 border border-charcoal-700 flex-shrink-0">
            <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 ${
              isHighMatch
                ? 'border-emerald-400/80 bg-emerald-950/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : score >= 50
                  ? 'border-amber-400/80 bg-amber-950/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'border-charcoal-600 bg-charcoal-800 text-charcoal-400'
            }`}>
              <span className="text-2xl font-bold font-serif leading-none">{score}</span>
              <span className="text-3xs uppercase tracking-wider font-semibold opacity-80 mt-0.5">Match</span>
            </div>
            <span className="text-2xs font-semibold text-charcoal-300 mt-2 sm:block hidden">
              {scoreMeta.label}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-charcoal-800/40 p-4 rounded-xl border border-charcoal-800">
          <div>
            <span className="text-2xs uppercase tracking-wider text-charcoal-500 font-bold block mb-1">Work Mode</span>
            <span className={`font-medium capitalize ${workMode.color || 'text-cream-200'}`}>
              {opportunity.workMode || 'Unspecified'}
            </span>
          </div>
          <div>
            <span className="text-2xs uppercase tracking-wider text-charcoal-500 font-bold block mb-1">Compensation</span>
            <span className="font-semibold text-emerald-400">
              {opportunity.compensation || 'Unspecified / Free'}
            </span>
          </div>
          <div>
            <span className="text-2xs uppercase tracking-wider text-charcoal-500 font-bold block mb-1">Deadline</span>
            <span className={`font-medium ${deadline.urgent ? 'text-amber-400 font-semibold' : 'text-cream-200'}`}>
              {deadline.text}
            </span>
          </div>
          <div>
            <span className="text-2xs uppercase tracking-wider text-charcoal-500 font-bold block mb-1">Eligibility</span>
            <span className="font-medium text-cream-200">
              {opportunity.eligibilityStatus === 'eligible'
                ? '✓ Qualified'
                : opportunity.eligibilityStatus === 'ineligible'
                  ? '⚠️ Check Criteria'
                  : 'Open to All'}
            </span>
          </div>
        </div>

        {/* Match Intelligence — 7 Core Questions Answered */}
        {opportunity.keyQuestions && (
          <div className="p-4 bg-charcoal-800/60 rounded-xl border border-charcoal-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal-700 pb-2">
              <span className="text-2xs uppercase tracking-wider font-bold text-rust-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rust-400" /> Match Intelligence: 7 Core Questions Answered
              </span>
              <span className="text-3xs text-charcoal-400 font-mono">Algorithm v2.0</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-3xs uppercase tracking-wider text-charcoal-400 font-bold block">1. Why am I a match?</span>
                <p className="text-charcoal-200 text-xs leading-relaxed">{opportunity.keyQuestions.suitability || opportunity.keyQuestions.matchReason}</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xs uppercase tracking-wider text-charcoal-400 font-bold block">2. Coding vs. Ideas / Research?</span>
                <p className="text-charcoal-200 text-xs leading-relaxed">{opportunity.keyQuestions.requiresCodingOrIdeas}</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xs uppercase tracking-wider text-charcoal-400 font-bold block">3. Can beginners participate?</span>
                <p className="text-charcoal-200 text-xs leading-relaxed">{opportunity.keyQuestions.canBeginnerParticipate}</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xs uppercase tracking-wider text-charcoal-400 font-bold block">4. Location & Travel Suitability</span>
                <p className="text-charcoal-200 text-xs leading-relaxed">{opportunity.keyQuestions.locationVerdict}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-charcoal-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs">
              <span className="text-charcoal-300">
                <strong className="text-cream-100">Recommended Next Move:</strong> {opportunity.keyQuestions.nextAction}
              </span>
              <span className="text-emerald-400 font-medium">
                {opportunity.keyQuestions.compensationVerdict}
              </span>
            </div>
          </div>
        )}

        {/* Skills Alignment Intelligence */}
        <div className="space-y-3 pt-1">
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Matched Skills */}
            <div className="p-3.5 bg-charcoal-800/50 rounded-xl border border-charcoal-700/60 space-y-2">
              <div className="flex items-center justify-between text-2xs uppercase tracking-wider font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Matched In Your Profile
                </span>
                <span className="text-charcoal-400">{opportunity.matchedSkills?.length || 0} skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.matchedSkills?.length > 0 ? (
                  opportunity.matchedSkills.slice(0, 5).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-2xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-charcoal-500 italic">Add your skills to see match overlap</span>
                )}
              </div>
            </div>

            {/* Target Gaps to Close */}
            <div className="p-3.5 bg-charcoal-800/50 rounded-xl border border-charcoal-700/60 space-y-2">
              <div className="flex items-center justify-between text-2xs uppercase tracking-wider font-bold">
                <span className="text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Skill Gaps To Bridge
                </span>
                <span className="text-charcoal-400">{opportunity.missingSkills?.length || 0} gaps</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.missingSkills?.length > 0 ? (
                  opportunity.missingSkills.slice(0, 5).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-2xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/60">
                      + {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 italic">No major skill gaps identified!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 min-w-[200px] btn bg-cream-100 text-charcoal-900 hover:bg-cream-200 justify-center font-semibold text-sm shadow-md py-3"
          >
            Apply on Official Portal
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>
          <Link
            to={detailUrl}
            className="btn border border-charcoal-600 text-charcoal-200 hover:bg-charcoal-800 px-4 py-3 text-sm font-medium"
          >
            Deep Match & AI Roadmap
          </Link>
          <button
            onClick={onSave}
            disabled={savingInProgress}
            className={`btn border px-3.5 py-3 transition-colors ${
              opportunity.isSaved
                ? 'border-rust-500 bg-rust-950/40 text-rust-400'
                : 'border-charcoal-600 text-charcoal-300 hover:bg-charcoal-800'
            }`}
            title={opportunity.isSaved ? 'Remove from saved' : 'Save opportunity'}
          >
            {opportunity.isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-rust-400" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
