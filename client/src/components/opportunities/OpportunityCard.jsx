import { getCategoryDisplay, deadlineDisplay, scoreDisplay, getWorkModeDisplay, getInitials } from '../../utils/helpers';
import { Bookmark, BookmarkCheck, MapPin, Calendar, DollarSign, Users, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { savedAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SOURCE_STYLES = {
  'Unstop': 'bg-violet-50 text-violet-700 border-violet-200',
  'Internshala': 'bg-blue-50 text-blue-700 border-blue-200',
  'AICTE Portal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'AICTE Internship Portal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Company Career Portal': 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
  'NextOpp Curated': 'bg-rust-50 text-rust-700 border-rust-200',
};

export default function OpportunityCard({ opportunity, onSaveToggle, showMatch = false }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(opportunity.isSaved || false);
  const [savingInProgress, setSavingInProgress] = useState(false);

  const category = getCategoryDisplay(opportunity.category);
  const deadline = deadlineDisplay(opportunity.deadline);
  const workMode = getWorkModeDisplay(opportunity.workMode);
  const match = opportunity.matchScore;
  const sourceName = opportunity.sourceName;
  const sourceStyle = SOURCE_STYLES[sourceName] || 'bg-charcoal-100 text-charcoal-500 border-charcoal-200';

  const slug = opportunity.title
    ? opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : '';
  const detailUrl = slug ? `/opportunities/${opportunity._id}/${slug}` : `/opportunities/${opportunity._id}`;

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Log in to save opportunities');
      navigate('/login');
      return;
    }
    setSavingInProgress(true);
    try {
      if (isSaved) {
        await savedAPI.unsave(opportunity._id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await savedAPI.save(opportunity._id);
        setIsSaved(true);
        toast.success('Saved!');
      }
      onSaveToggle?.(opportunity._id, !isSaved);
    } catch (err) {
      if (err.status === 409) {
        setIsSaved(true);
        toast.error('Already saved');
      } else {
        toast.error(err.message || 'Could not save');
      }
    } finally {
      setSavingInProgress(false);
    }
  };

  return (
    <div
      className="card-hover p-5 flex flex-col gap-3 animate-fade-in cursor-pointer"
      onClick={() => navigate(detailUrl)}
      role="article"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Category + Work mode + Source + Readiness & Non-coding Badges */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={`badge border ${category.className}`}>
              {category.emoji} {category.label}
            </span>
            {opportunity.readinessLevel && (
              <span className={`badge border text-2xs ${
                opportunity.readinessLevel.includes('Beginner') || opportunity.readinessLevel.includes('First-Year') || opportunity.readinessLevel.includes('Freshers')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                  : 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
              }`}>
                {opportunity.readinessLevel}
              </span>
            )}
            {opportunity.requiresCoding === false && (
              <span className="badge bg-amber-50 text-amber-800 border-amber-200 text-2xs font-semibold">
                💡 Ideas / Non-Coding
              </span>
            )}
            {opportunity.regionCluster && opportunity.regionCluster !== 'National' && opportunity.regionCluster !== 'Remote' && (
              <span className="badge bg-rust-50 text-rust-800 border-rust-200 text-2xs font-medium">
                📍 {opportunity.regionCluster}
              </span>
            )}
            {opportunity.workMode && (
              <span className={`text-xs font-medium ${workMode.color}`}>
                {workMode.label}
              </span>
            )}
            {sourceName && (
              <span className={`badge border text-2xs ${sourceStyle}`}>
                {opportunity.verificationStatus === 'verified' && (
                  <ShieldCheck className="w-2.5 h-2.5 inline mr-0.5" />
                )}
                {sourceName}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-charcoal-900 line-clamp-2 leading-snug mb-1">
            {opportunity.title}
          </h3>
          <p className="text-xs text-charcoal-500 font-medium">{opportunity.organization}</p>
        </div>

        {/* Match score */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {match != null && (
            <div className={`match-score text-sm ${scoreDisplay(match).className}`}>
              {match}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={savingInProgress}
            className="p-1.5 text-charcoal-400 hover:text-rust-600 transition-base rounded"
            aria-label={isSaved ? 'Unsave opportunity' : 'Save opportunity'}
          >
            {isSaved
              ? <BookmarkCheck className="w-4 h-4 text-rust-600" />
              : <Bookmark className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* Description */}
      {opportunity.description && (
        <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>
      )}

      {/* Skills */}
      {opportunity.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.requiredSkills.slice(0, 4).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-charcoal-100 text-charcoal-600 text-2xs rounded-full font-medium">
              {skill}
            </span>
          ))}
          {opportunity.requiredSkills.length > 4 && (
            <span className="text-2xs text-charcoal-400">+{opportunity.requiredSkills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E8E3D8] mt-1">
        <div className="flex items-center gap-3">
          {opportunity.location && (
            <span className="flex items-center gap-1 text-xs text-charcoal-400">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </span>
          )}
          {opportunity.compensation && (
            <span className="flex items-center gap-1 text-xs text-charcoal-500 font-medium">
              {opportunity.compensation}
            </span>
          )}
        </div>

        <span className={`text-xs font-medium ${deadline.color}`}>
          {deadline.urgent && '⏰ '}
          {deadline.text}
        </span>
      </div>
    </div>
  );
}
