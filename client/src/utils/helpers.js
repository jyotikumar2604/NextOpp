// Format date for display
export function formatDate(date, opts = {}) {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...opts,
    });
  } catch {
    return 'Invalid date';
  }
}

// Days until deadline
export function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Deadline display with urgency
export function deadlineDisplay(date) {
  const days = daysUntil(date);
  if (days === null) return { text: 'No deadline', color: 'text-charcoal-400', urgent: false };
  if (days < 0) return { text: 'Expired', color: 'text-red-500', urgent: false };
  if (days === 0) return { text: 'Closes today!', color: 'text-red-600', urgent: true };
  if (days === 1) return { text: 'Closes tomorrow', color: 'text-red-500', urgent: true };
  if (days <= 7) return { text: `${days} days left`, color: 'text-amber-600', urgent: true };
  if (days <= 30) return { text: `${days} days left`, color: 'text-charcoal-600', urgent: false };
  return { text: formatDate(date), color: 'text-charcoal-500', urgent: false };
}

// Score color and label
export function scoreDisplay(score) {
  if (score >= 75) return { label: 'Strong match', className: 'score-high', color: '#059669' };
  if (score >= 50) return { label: 'Moderate match', className: 'score-medium', color: '#D97706' };
  if (score >= 25) return { label: 'Low match', className: 'score-low', color: '#DC2626' };
  return { label: 'Weak match', className: 'score-low', color: '#DC2626' };
}

// Category display
export const CATEGORY_MAP = {
  internship: { label: 'Internship', className: 'cat-internship', emoji: '💼' },
  job: { label: 'Job', className: 'cat-job', emoji: '🏢' },
  scholarship: { label: 'Scholarship', className: 'cat-scholarship', emoji: '🎓' },
  hackathon: { label: 'Hackathon', className: 'cat-hackathon', emoji: '⚡' },
  fellowship: { label: 'Fellowship', className: 'cat-fellowship', emoji: '🔬' },
  research: { label: 'Research', className: 'cat-research', emoji: '📊' },
  competition: { label: 'Competition', className: 'cat-competition', emoji: '🏆' },
};

export function getCategoryDisplay(category) {
  return CATEGORY_MAP[category] || { label: category, className: 'badge-category', emoji: '📌' };
}

// Work mode display
export function getWorkModeDisplay(workMode) {
  const map = {
    remote: { label: 'Remote', color: 'text-emerald-700' },
    hybrid: { label: 'Hybrid', color: 'text-blue-700' },
    'on-site': { label: 'On-site', color: 'text-violet-700' },
    flexible: { label: 'Flexible', color: 'text-amber-700' },
  };
  return map[workMode] || { label: workMode, color: 'text-charcoal-600' };
}

// Application status display
export const STATUS_MAP = {
  applied: { label: 'Applied', className: 'status-applied', dot: 'bg-blue-500' },
  assessment: { label: 'Assessment', className: 'status-assessment', dot: 'bg-amber-500' },
  interviewing: { label: 'Interviewing', className: 'status-interviewing', dot: 'bg-violet-500' },
  offer: { label: 'Offer 🎉', className: 'status-offer', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', className: 'status-rejected', dot: 'bg-red-400' },
  withdrawn: { label: 'Withdrawn', className: 'status-withdrawn', dot: 'bg-gray-400' },
};

export function getStatusDisplay(status) {
  return STATUS_MAP[status] || { label: status, className: '', dot: 'bg-gray-400' };
}

// Truncate text
export function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Format relative time
export function relativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

// Clamp number
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
