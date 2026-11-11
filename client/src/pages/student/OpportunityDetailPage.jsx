import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { opportunitiesAPI, savedAPI, applicationsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  getCategoryDisplay, deadlineDisplay, scoreDisplay,
  getWorkModeDisplay, formatDate
} from '../../utils/helpers';
import { ScoreRing, ConfirmDialog } from '../../components/ui/SharedComponents';
import {
  ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Calendar,
  MapPin, DollarSign, Clock, ShieldCheck, CheckCircle2, XCircle,
  AlertCircle, Sparkles, Brain, PlusCircle, Check, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [opp, setOpp] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Application tracker modal state
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackNotes, setTrackNotes] = useState('');
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    async function fetchOpportunity() {
      setLoading(true);
      try {
        const res = await opportunitiesAPI.get(id);
        if (res.success && res.opportunity) {
          setOpp(res.opportunity);
          setIsSaved(res.opportunity.isSaved || false);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load opportunity');
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunity();
  }, [id]);

  // Fetch match and AI explanation if authenticated
  useEffect(() => {
    if (!isAuthenticated || !opp) return;

    async function fetchMatchAndAi() {
      setAiLoading(true);
      try {
        // Fetch AI explanation & deterministic match concurrently
        const res = await opportunitiesAPI.explain(id);
        if (res.success) {
          setMatchData(res.match);
          setAiData({
            explanation: res.explanation,
            skillGap: res.skillGap,
          });
        }
      } catch (err) {
        // If explain fails or profile not complete, try standard match
        try {
          const matchRes = await opportunitiesAPI.getMatch(id);
          if (matchRes.success) {
            setMatchData(matchRes.match);
          }
        } catch {
          // Ignore if profile incomplete
        }
      } finally {
        setAiLoading(false);
      }
    }

    fetchMatchAndAi();
  }, [id, isAuthenticated, opp]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save opportunities');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await savedAPI.unsave(id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await savedAPI.save(id);
        setIsSaved(true);
        toast.success('Saved to your bookmarks');
      }
    } catch (err) {
      toast.error(err.message || 'Could not update saved status');
    } finally {
      setSaving(false);
    }
  };

  const handleTrackApplication = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setTracking(true);
    try {
      await applicationsAPI.create({
        opportunityId: id,
        notes: trackNotes,
        appliedAt: new Date().toISOString(),
      });
      toast.success('Application added to your Tracker!');
      setShowTrackModal(false);
    } catch (err) {
      if (err.status === 409) {
        toast.error('You are already tracking an application for this opportunity');
      } else {
        toast.error(err.message || 'Failed to track application');
      }
    } finally {
      setTracking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opp?.title,
        text: `Check out this opportunity: ${opp?.title} at ${opp?.organization}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-charcoal-300 border-t-rust-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-charcoal-600">Loading opportunity details…</p>
        </div>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="min-h-screen bg-cream py-16 px-4 text-center">
        <div className="max-w-md mx-auto card p-8 space-y-4">
          <h2 className="text-xl font-serif text-charcoal-900">Opportunity Not Found</h2>
          <p className="text-sm text-charcoal-500">
            This opportunity listing may have expired or been removed by an administrator.
          </p>
          <Link to="/explore" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const category = getCategoryDisplay(opp.category);
  const deadline = deadlineDisplay(opp.deadline);
  const workMode = getWorkModeDisplay(opp.workMode);
  const matchScore = matchData?.overallScore ?? opp.matchScore;

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-charcoal-900 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-charcoal-500 hover:text-charcoal-800 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg transition"
              title="Share Opportunity"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-800 hover:border-rust-500 transition"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-rust-600" />
                  <span className="text-rust-700">Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-charcoal-500" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-[#FEFCF8] rounded-2xl border border-[#E8E3D8] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge border ${category.className}`}>
                  {category.emoji} {category.label}
                </span>
                {opp.readinessLevel && (
                  <span className={`badge border text-xs ${
                    opp.readinessLevel.includes('Beginner') || opp.readinessLevel.includes('First-Year') || opp.readinessLevel.includes('Freshers')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      : 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
                  }`}>
                    🌱 {opp.readinessLevel}
                  </span>
                )}
                {opp.requiresCoding === false ? (
                  <span className="badge bg-amber-50 text-amber-800 border-amber-200 font-semibold text-xs">
                    💡 Non-Coding / Ideas Only
                  </span>
                ) : (
                  <span className="badge bg-blue-50 text-blue-800 border-blue-200 text-xs">
                    💻 Prototype / Code
                  </span>
                )}
                {opp.regionCluster && opp.regionCluster !== 'National' && opp.regionCluster !== 'Remote' && (
                  <span className="badge bg-rust-50 text-rust-800 border-rust-200 font-medium text-xs">
                    📍 {opp.regionCluster}
                  </span>
                )}
                {opp.workMode && (
                  <span className={`badge bg-charcoal-100 ${workMode.color} font-medium text-xs`}>
                    {workMode.label}
                  </span>
                )}
                {opp.isVerified && (
                  <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {opp.status !== 'published' && (
                  <span className="badge bg-amber-100 text-amber-800 uppercase font-bold text-2xs">
                    {opp.status}
                  </span>
                )}
              </div>

              {/* Title & Organization */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 leading-tight">
                  {opp.title}
                </h1>
                <p className="text-base text-charcoal-600 font-medium mt-1">
                  {opp.organization}
                </p>
              </div>

              {/* Quick Metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[#F0EBE1] text-xs">
                {opp.location && (
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <MapPin className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                    <span>{opp.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-charcoal-600">
                  <Calendar className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                  <span className={deadline.urgent ? 'text-red-600 font-semibold' : ''}>
                    {deadline.text}
                  </span>
                </div>
                {opp.compensation && (
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <DollarSign className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                    <span className="font-semibold text-charcoal-900">{opp.compensation}</span>
                  </div>
                )}
                {opp.duration && (
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <Clock className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                    <span>{opp.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match Ring & Primary CTA Column */}
            <div className="lg:w-72 flex-shrink-0 flex flex-col sm:flex-row lg:flex-col items-center justify-between p-5 bg-[#FAF7F0] border border-[#DDD8CC] rounded-xl gap-4">
              <div className="flex items-center gap-4">
                {matchScore != null ? (
                  <ScoreRing score={matchScore} size={64} />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-charcoal-300 flex items-center justify-center text-xs text-charcoal-400 font-medium">
                    No score
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-wider text-charcoal-500 font-bold">
                    Fit Assessment
                  </div>
                  <div className="text-sm font-semibold text-charcoal-900">
                    {matchScore != null ? scoreDisplay(matchScore).label : 'Log in to assess'}
                  </div>
                  {matchData?.eligibility && (
                    <div className="text-2xs font-medium mt-0.5">
                      {matchData.eligibility.status === 'eligible' && (
                        <span className="text-emerald-700">✓ Satisfies eligibility</span>
                      )}
                      {matchData.eligibility.status === 'ineligible' && (
                        <span className="text-red-700">⚠️ Eligibility issue</span>
                      )}
                      {matchData.eligibility.status === 'unknown' && (
                        <span className="text-amber-700">Profile incomplete</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2">
                {opp.applicationUrl ? (
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Apply on Official Site
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed text-sm">
                    Applications Closed
                  </button>
                )}

                <button
                  onClick={() => setShowTrackModal(true)}
                  className="btn-outline w-full text-center flex items-center justify-center gap-2 text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add to Application Tracker
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid: Main Details & Intelligence Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description & Requirements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-serif text-charcoal-900 border-b border-[#F0EBE1] pb-3">
                About the Opportunity
              </h2>
              <div className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                {opp.description || 'No detailed description provided for this opportunity.'}
              </div>
            </div>

            {/* Responsibilities */}
            {opp.responsibilities?.length > 0 && (
              <div className="card p-6 space-y-4">
                <h2 className="text-lg font-serif text-charcoal-900 border-b border-[#F0EBE1] pb-3">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {opp.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-charcoal-700 leading-relaxed">
                      <span className="text-rust-600 mt-1 font-bold text-xs">▪</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Breakdown */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-serif text-charcoal-900 border-b border-[#F0EBE1] pb-3">
                Skills & Technologies
              </h2>

              {/* Required Skills */}
              {opp.requiredSkills?.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-charcoal-500 mb-2.5">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opp.requiredSkills.map((skill) => {
                      const isMatched = matchData?.components?.requiredSkills?.matched?.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
                          }`}
                        >
                          {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preferred Skills */}
              {opp.preferredSkills?.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-charcoal-500 mb-2.5">
                    Preferred & Bonus Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opp.preferredSkills.map((skill) => {
                      const isMatched = matchData?.components?.preferredSkills?.matched?.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                            isMatched
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-[#FAF7F0] text-charcoal-600 border-[#DDD8CC]'
                          }`}
                        >
                          {isMatched && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility & Criteria */}
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-serif text-charcoal-900 border-b border-[#F0EBE1] pb-3">
                Eligibility & Qualifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {opp.eligibility?.academicYears?.length > 0 && (
                  <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#E8E3D8]">
                    <span className="text-charcoal-400 block mb-1">Eligible Academic Years</span>
                    <span className="font-semibold text-charcoal-800">
                      {opp.eligibility.academicYears.join(', ')}
                    </span>
                  </div>
                )}
                {opp.eligibility?.minGPA != null && (
                  <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#E8E3D8]">
                    <span className="text-charcoal-400 block mb-1">Minimum GPA / CGPA</span>
                    <span className="font-semibold text-charcoal-800">
                      {opp.eligibility.minGPA} (Scale: {opp.eligibility.gpaScale || 10})
                    </span>
                  </div>
                )}
                {(opp.eligibility?.graduationYearMin || opp.eligibility?.graduationYearMax) && (
                  <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#E8E3D8]">
                    <span className="text-charcoal-400 block mb-1">Graduation Year Window</span>
                    <span className="font-semibold text-charcoal-800">
                      {opp.eligibility.graduationYearMin || 'Any'} – {opp.eligibility.graduationYearMax || 'Any'}
                    </span>
                  </div>
                )}
                {opp.benefits?.length > 0 && (
                  <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#E8E3D8]">
                    <span className="text-charcoal-400 block mb-1">Key Perks & Benefits</span>
                    <span className="font-semibold text-charcoal-800">
                      {opp.benefits.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Ineligibility alerts */}
              {matchData?.eligibility?.failures?.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 space-y-1">
                    <p className="font-bold">Eligibility Notice</p>
                    {matchData.eligibility.failures.map((f, i) => (
                      <p key={i}>• {f}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: NextOpp Match & AI Advisor */}
          <div className="space-y-6">
            {/* Source & Verification card */}
            <div className="card p-5 space-y-3 bg-[#FEFCF8]">
              <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-serif text-sm font-semibold text-charcoal-900">Source & Verification</h3>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-2xs font-semibold capitalize">
                  {opp.verificationStatus || 'verified'}
                </span>
              </div>
              <div className="space-y-2 text-xs text-charcoal-600">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-400">Source Platform:</span>
                  <span className="font-medium text-charcoal-800">{opp.sourceName || 'NextOpp Curated'}</span>
                </div>
                {opp.dataFreshness && (
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-400">Freshness:</span>
                    <span className="font-medium text-charcoal-800">{opp.dataFreshness}</span>
                  </div>
                )}
                {opp.lastVerifiedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-400">Last Verified:</span>
                    <span className="font-medium text-charcoal-800">{formatDate(opp.lastVerifiedAt)}</span>
                  </div>
                )}
                <p className="text-2xs text-charcoal-400 pt-1 border-t border-[#F0EBE1]">
                  Official application is hosted directly on the provider portal. NextOpp does not charge fees or intermediate applications.
                </p>
              </div>
            </div>

            {/* NextOpp Intelligence: 7 Core Questions Answered */}
            {matchData?.keyQuestions && (
              <div className="card p-5 space-y-4 bg-gradient-to-br from-[#FEFCF8] to-[#FBF8F1] border-rust-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rust-600" />
                    <h3 className="font-serif text-sm font-semibold text-charcoal-900">
                      7 Core Decision Questions
                    </h3>
                  </div>
                  <span className="text-3xs font-bold uppercase tracking-wider text-rust-700 bg-rust-50 px-2 py-0.5 rounded border border-rust-200">
                    NextOpp Brief
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-charcoal-800 block text-2xs uppercase tracking-wider text-charcoal-400">
                      1. Suitability Verdict
                    </span>
                    <p className="text-charcoal-700 mt-0.5 leading-relaxed">
                      {matchData.keyQuestions.suitability}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-charcoal-800 block text-2xs uppercase tracking-wider text-charcoal-400">
                      2. Why am I a match?
                    </span>
                    <p className="text-charcoal-700 mt-0.5 leading-relaxed">
                      {matchData.keyQuestions.matchReason}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-charcoal-800 block text-2xs uppercase tracking-wider text-charcoal-400">
                      3. Beginner participation?
                    </span>
                    <p className="text-charcoal-700 mt-0.5 leading-relaxed">
                      {matchData.keyQuestions.canBeginnerParticipate}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-charcoal-800 block text-2xs uppercase tracking-wider text-charcoal-400">
                      4. Coding vs. Ideas & Research?
                    </span>
                    <p className="text-charcoal-700 mt-0.5 leading-relaxed">
                      {matchData.keyQuestions.requiresCodingOrIdeas}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-charcoal-800 block text-2xs uppercase tracking-wider text-charcoal-400">
                      5. Location & Commute Suitability
                    </span>
                    <p className="text-charcoal-700 mt-0.5 leading-relaxed">
                      {matchData.keyQuestions.locationVerdict}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-charcoal-800 block text-2xs uppercase tracking-wider text-charcoal-400">
                      6. Paid vs. Exposure Value
                    </span>
                    <p className="text-charcoal-700 mt-0.5 leading-relaxed">
                      {matchData.keyQuestions.compensationVerdict}
                    </p>
                  </div>

                  <div className="p-3 bg-rust-50/70 border border-rust-200 rounded-lg">
                    <span className="font-bold text-rust-800 block text-2xs uppercase tracking-wider">
                      7. Your Concrete Next Move
                    </span>
                    <p className="text-rust-900 mt-0.5 font-medium leading-relaxed">
                      {matchData.keyQuestions.nextAction}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Deterministic Match Breakdown */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-rust-600" />
                <h3 className="font-serif text-base text-charcoal-900">Deterministic Match Breakdown</h3>
              </div>
              <p className="text-xs text-charcoal-500">
                Calculated strictly by NextOpp's multi-variable matching algorithm.
              </p>

              {matchData ? (
                <div className="space-y-3 pt-2 text-xs">
                  {/* Required Skills (40%) */}
                  <div>
                    <div className="flex justify-between font-medium text-charcoal-700 mb-1">
                      <span>Required Skills (40% wt)</span>
                      <span>{matchData.components?.requiredSkills?.score ?? 0}%</span>
                    </div>
                    <div className="w-full bg-[#E8E3D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rust-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${matchData.components?.requiredSkills?.score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Preferred Skills (15%) */}
                  <div>
                    <div className="flex justify-between font-medium text-charcoal-700 mb-1">
                      <span>Preferred Skills (15% wt)</span>
                      <span>{matchData.components?.preferredSkills?.score ?? 0}%</span>
                    </div>
                    <div className="w-full bg-[#E8E3D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${matchData.components?.preferredSkills?.score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Education (15%) */}
                  <div>
                    <div className="flex justify-between font-medium text-charcoal-700 mb-1">
                      <span>Education & Year Fit (15% wt)</span>
                      <span>{matchData.components?.education?.score ?? 0}%</span>
                    </div>
                    <div className="w-full bg-[#E8E3D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${matchData.components?.education?.score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Career Alignment (10%) */}
                  <div>
                    <div className="flex justify-between font-medium text-charcoal-700 mb-1">
                      <span>Career Interest Alignment (10% wt)</span>
                      <span>{matchData.components?.careerAlignment?.score ?? 0}%</span>
                    </div>
                    <div className="w-full bg-[#E8E3D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${matchData.components?.careerAlignment?.score ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Location & Mode (10%) */}
                  <div>
                    <div className="flex justify-between font-medium text-charcoal-700 mb-1">
                      <span>Location & Work Mode (10% wt)</span>
                      <span>{matchData.components?.locationWorkMode?.score ?? 0}%</span>
                    </div>
                    <div className="w-full bg-[#E8E3D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${matchData.components?.locationWorkMode?.score ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-cream-100 rounded-lg text-center text-xs text-charcoal-500">
                  {isAuthenticated ? (
                    <Link to="/profile" className="text-rust-600 font-semibold hover:underline">
                      Complete your student profile to view your match breakdown.
                    </Link>
                  ) : (
                    <Link to="/login" className="text-rust-600 font-semibold hover:underline">
                      Sign in to see how your profile matches this role.
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* AI Advisor / Skill Gap Analysis */}
            <div className="card p-6 space-y-4 border-rust-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rust-600" />
                  <h3 className="font-serif text-base text-charcoal-900">NextOpp Advisor</h3>
                </div>
                {aiData?.explanation?.source && (
                  <span
                    className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      aiData.explanation.source === 'ai'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-charcoal-100 text-charcoal-700'
                    }`}
                  >
                    {aiData.explanation.source === 'ai' ? 'Claude 3 AI' : 'Rule Engine'}
                  </span>
                )}
              </div>

              {aiLoading ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-rust-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-charcoal-400">Analyzing skills & generating advice…</p>
                </div>
              ) : aiData ? (
                <div className="space-y-4 text-xs text-charcoal-700 leading-relaxed">
                  {/* Match Explanation */}
                  <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E3D8]">
                    <div className="font-bold text-charcoal-900 mb-1.5">Fit Assessment</div>
                    <div className="whitespace-pre-line text-charcoal-700">
                      {aiData.explanation?.text || 'Good alignment with listed requirements.'}
                    </div>
                  </div>

                  {/* Skill Gap & Roadmap */}
                  {aiData.skillGap?.text && (
                    <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E3D8]">
                      <div className="font-bold text-charcoal-900 mb-1.5">Skill Gap Analysis & Next Steps</div>
                      <div className="whitespace-pre-line text-charcoal-700">
                        {aiData.skillGap.text}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-charcoal-500">
                  Log in with a completed profile to unlock custom AI advice and gap-closing project recommendations.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Add to Tracker */}
        {showTrackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowTrackModal(false)}
            />
            <div className="relative card p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
              <h3 className="text-lg font-serif text-charcoal-900">
                Track Application
              </h3>
              <p className="text-xs text-charcoal-500">
                Add <strong>{opp.title}</strong> at <strong>{opp.organization}</strong> to your Application Tracker.
              </p>

              <form onSubmit={handleTrackApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Application Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={trackNotes}
                    onChange={(e) => setTrackNotes(e.target.value)}
                    placeholder="e.g. Applied via referral, submitted portfolio link, awaiting HR email..."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTrackModal(false)}
                    className="btn-outline flex-1 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={tracking}
                    className="btn-primary flex-1 text-xs"
                  >
                    {tracking ? 'Tracking…' : 'Add to Tracker'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

