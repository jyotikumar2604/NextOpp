import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { opportunitiesAPI } from '../../api';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { PageSkeleton, EmptyState, Pagination } from '../../components/ui/SharedComponents';
import { CATEGORY_MAP } from '../../utils/helpers';
import {
  Search, SlidersHorizontal, X, Briefcase, Filter, ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'internship', label: 'Internships', emoji: '💼' },
  { id: 'job', label: 'Full-time Jobs', emoji: '🏢' },
  { id: 'scholarship', label: 'Scholarships', emoji: '🎓' },
  { id: 'hackathon', label: 'Hackathons', emoji: '⚡' },
  { id: 'fellowship', label: 'Fellowships', emoji: '🔬' },
  { id: 'research', label: 'Research', emoji: '📊' },
  { id: 'competition', label: 'Competitions', emoji: '🏆' },
];

const WORK_MODES = [
  { id: '', label: 'All Modes' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on-site', label: 'On-site' },
];

const DEADLINE_OPTIONS = [
  { id: '', label: 'Any Deadline' },
  { id: 'week', label: 'Closing this week' },
  { id: 'month', label: 'Closing this month' },
  { id: 'active', label: 'Active only' },
];

const SOURCES = [
  { id: '', label: 'All Sources' },
  { id: 'Unstop', label: 'Unstop' },
  { id: 'Internshala', label: 'Internshala' },
  { id: 'AICTE Internship Portal', label: 'AICTE Portal' },
  { id: 'Company Career Portal', label: 'Company Portal' },
  { id: 'NextOpp Curated', label: 'NextOpp Curated' },
];

const REGIONS = [
  { id: '', label: 'All Locations' },
  { id: 'Delhi NCR', label: 'Delhi NCR' },
  { id: 'Bengaluru', label: 'Bengaluru' },
  { id: 'Mumbai MMR', label: 'Mumbai MMR' },
  { id: 'Pune', label: 'Pune' },
  { id: 'Hyderabad', label: 'Hyderabad' },
  { id: 'Remote', label: 'Remote Only' },
];

const READINESS_LEVELS = [
  { id: '', label: 'All Readiness Levels' },
  { id: 'beginner', label: '🌱 Beginner Friendly (All)' },
  { id: 'First-Year Friendly', label: 'First-Year Friendly' },
  { id: 'Open to Freshers', label: 'Open to Freshers' },
  { id: 'Student Projects Accepted', label: 'Student Projects Accepted' },
  { id: 'Skills Preferred', label: 'Skills Preferred' },
  { id: 'Advanced / Experienced Candidates', label: 'Advanced Candidates' },
];

const TRACK_FORMATS = [
  { id: '', label: 'All Tracks' },
  { id: 'ideathon', label: '💡 Ideathons & Idea Challenges' },
  { id: 'business-case-competition', label: '📈 Case Competitions' },
  { id: 'open-innovation', label: '🌱 Open Innovation' },
  { id: 'product-case-competition', label: '🎨 Product & UI Challenges' },
  { id: 'coding-hackathon', label: '⚡ Coding Hackathons' },
  { id: 'research-internship', label: '🔬 Research Fellowships' },
  { id: 'tech-internship', label: '💼 Tech Internships' },
];

const SORT_OPTIONS = [
  { id: '', label: 'Featured & Relevant' },
  { id: 'newest', label: 'Recently Added' },
  { id: 'deadline', label: 'Deadline: Soonest' },
  { id: 'compensation', label: 'Highest Compensation' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const workModeParam = searchParams.get('workMode') || '';
  const isPaidParam = searchParams.get('isPaid') || '';
  const deadlineParam = searchParams.get('deadline') || '';
  const sourceParam = searchParams.get('source') || '';
  const sortParam = searchParams.get('sort') || '';
  const regionParam = searchParams.get('regionCluster') || '';
  const readinessParam = searchParams.get('readinessLevel') || '';
  const trackParam = searchParams.get('trackFormat') || '';
  const codingParam = searchParams.get('requiresCoding') || '';
  const mentorshipParam = searchParams.get('mentorship') || '';
  const ppoParam = searchParams.get('ppo') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local state
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync input when URL param changes
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Update query params helper
  const updateFilters = useCallback(
    (newParams) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      // Reset page to 1 when any filter other than page changes
      if (!('page' in newParams)) {
        next.set('page', '1');
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pageParam,
        limit: 12,
        ...(queryParam && { q: queryParam }),
        ...(categoryParam && { category: categoryParam }),
        ...(workModeParam && { workMode: workModeParam }),
        ...(isPaidParam && { isPaid: isPaidParam }),
        ...(deadlineParam && { deadline: deadlineParam }),
        ...(sourceParam && { sourceName: sourceParam }),
        ...(sortParam && { sort: sortParam }),
        ...(regionParam && { regionCluster: regionParam }),
        ...(readinessParam && { readinessLevel: readinessParam }),
        ...(trackParam && { trackFormat: trackParam }),
        ...(codingParam && { requiresCoding: codingParam }),
        ...(mentorshipParam && { mentorship: mentorshipParam }),
        ...(ppoParam && { ppo: ppoParam }),
      };

      const res = await opportunitiesAPI.list(params);
      if (res.success) {
        setOpportunities(res.opportunities || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [
    pageParam, queryParam, categoryParam, workModeParam,
    isPaidParam, deadlineParam, sourceParam, sortParam,
    regionParam, readinessParam, trackParam, codingParam,
    mentorshipParam, ppoParam
  ]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: searchTerm.trim() });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [
    categoryParam,
    workModeParam,
    isPaidParam,
    deadlineParam,
    sourceParam,
    queryParam,
    regionParam,
    readinessParam,
    trackParam,
    codingParam,
    mentorshipParam,
    ppoParam,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#E8E3D8] pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
                Opportunity Discovery
              </p>
              <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
                Explore Opportunities
              </h1>
              <p className="text-sm text-charcoal-500 mt-1 max-w-2xl">
                Discover internships, full-time roles, scholarships, hackathons, and fellowships curated and matched for you.
              </p>
            </div>
            <div className="text-sm text-charcoal-500 font-medium self-start md:self-end">
              {loading ? 'Searching opportunities…' : `${pagination.total} opportunities found`}
            </div>
          </div>
        </div>

        {/* Search & Top Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role, company, skills (e.g. React, Machine Learning, Google)..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500 shadow-sm transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  updateFilters({ q: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortParam}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="appearance-none bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl px-4 py-2.5 pr-8 text-sm text-charcoal-800 font-medium focus:outline-none focus:border-rust-500 shadow-sm cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl text-sm font-medium text-charcoal-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-rust-600 text-white rounded-full text-2xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills (Horizontal scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = categoryParam === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilters({ category: cat.id })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-charcoal-900 text-cream-100 border-charcoal-900 shadow-sm'
                    : 'bg-[#FEFCF8] text-charcoal-700 border-[#DDD8CC] hover:bg-charcoal-100'
                }`}
              >
                {cat.emoji ? `${cat.emoji} ${cat.label}` : cat.label}
              </button>
            );
          })}
        </div>

        {/* Region & Location Quick Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-3xs uppercase tracking-wider text-charcoal-400 font-bold px-1 whitespace-nowrap">Location:</span>
          {REGIONS.map((reg) => {
            const active = regionParam === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => updateFilters({ regionCluster: reg.id })}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-rust-700 text-white border-rust-700 shadow-sm'
                    : 'bg-[#FEFCF8] text-charcoal-600 border-[#E8E3D8] hover:border-charcoal-400'
                }`}
              >
                {reg.id === 'Delhi NCR' ? '📍 Delhi NCR' : reg.label}
              </button>
            );
          })}

          <span className="text-charcoal-300">|</span>

          {/* Non-coding ideas-only toggle */}
          <button
            onClick={() => updateFilters({ requiresCoding: codingParam === 'false' ? '' : 'false' })}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 ${
              codingParam === 'false'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400'
            }`}
          >
            💡 Non-Coding / Ideas Only
          </button>
        </div>

        {/* Filter Toolbar (Desktop & expanded mobile) */}
        <div
          className={`${
            showFiltersMobile ? 'flex' : 'hidden'
          } sm:flex flex-wrap items-center justify-between gap-3 bg-[#FEFCF8] p-3.5 rounded-xl border border-[#E8E3D8] text-xs`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-charcoal-400 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Readiness Level */}
            <select
              value={readinessParam}
              onChange={(e) => updateFilters({ readinessLevel: e.target.value })}
              className="bg-cream-100 border border-[#DDD8CC] rounded-lg px-2.5 py-1.5 text-charcoal-800 font-medium focus:outline-none"
            >
              {READINESS_LEVELS.map((rl) => (
                <option key={rl.id} value={rl.id}>
                  {rl.label}
                </option>
              ))}
            </select>

            {/* Track Format */}
            <select
              value={trackParam}
              onChange={(e) => updateFilters({ trackFormat: e.target.value })}
              className="bg-cream-100 border border-[#DDD8CC] rounded-lg px-2.5 py-1.5 text-charcoal-800 font-medium focus:outline-none"
            >
              {TRACK_FORMATS.map((tf) => (
                <option key={tf.id} value={tf.id}>
                  {tf.label}
                </option>
              ))}
            </select>

            {/* Work Mode */}
            <select
              value={workModeParam}
              onChange={(e) => updateFilters({ workMode: e.target.value })}
              className="bg-cream-100 border border-[#DDD8CC] rounded-lg px-2.5 py-1.5 text-charcoal-800 font-medium focus:outline-none"
            >
              {WORK_MODES.map((wm) => (
                <option key={wm.id} value={wm.id}>
                  {wm.label}
                </option>
              ))}
            </select>

            {/* Paid / Unpaid */}
            <select
              value={isPaidParam}
              onChange={(e) => updateFilters({ isPaid: e.target.value })}
              className="bg-cream-100 border border-[#DDD8CC] rounded-lg px-2.5 py-1.5 text-charcoal-800 font-medium focus:outline-none"
            >
              <option value="">Compensation: All</option>
              <option value="true">Paid Only</option>
              <option value="false">Unpaid / Open</option>
            </select>

            {/* Mentorship filter */}
            <button
              onClick={() => updateFilters({ mentorship: mentorshipParam === 'true' ? '' : 'true' })}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                mentorshipParam === 'true'
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'bg-cream-100 text-charcoal-700 border-[#DDD8CC]'
              }`}
            >
              Mentorship
            </button>

            {/* PPO filter */}
            <button
              onClick={() => updateFilters({ ppo: ppoParam === 'true' ? '' : 'true' })}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                ppoParam === 'true'
                  ? 'bg-charcoal-900 text-white border-charcoal-900'
                  : 'bg-cream-100 text-charcoal-700 border-[#DDD8CC]'
              }`}
            >
              PPO Potential
            </button>

            {/* Deadline */}
            <select
              value={deadlineParam}
              onChange={(e) => updateFilters({ deadline: e.target.value })}
              className="bg-cream-100 border border-[#DDD8CC] rounded-lg px-2.5 py-1.5 text-charcoal-800 font-medium focus:outline-none"
            >
              {DEADLINE_OPTIONS.map((dl) => (
                <option key={dl.id} value={dl.id}>
                  {dl.label}
                </option>
              ))}
            </select>

            {/* Source */}
            <select
              value={sourceParam}
              onChange={(e) => updateFilters({ source: e.target.value })}
              className="bg-cream-100 border border-[#DDD8CC] rounded-lg px-2.5 py-1.5 text-charcoal-800 font-medium focus:outline-none"
            >
              {SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active filter count & clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-rust-600 hover:text-rust-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all filters ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Opportunity Grid */}
        {loading ? (
          <PageSkeleton count={6} />
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description="We couldn't find any opportunities matching your current filters. Try relaxing your search terms or clearing filters."
            action={
              activeFilterCount > 0 && (
                <button onClick={handleClearFilters} className="btn-primary mt-2">
                  Clear all filters
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                showMatch={true}
                onSaveToggle={(id, savedState) => {
                  setOpportunities((prev) =>
                    prev.map((o) => (o._id === id ? { ...o, isSaved: savedState } : o))
                  );
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(newPage) => updateFilters({ page: newPage })}
          />
        )}
      </div>
    </div>
  );
}

