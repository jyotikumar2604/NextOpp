import { useState } from 'react';
import { Link } from 'react-router-dom';

// Skeleton loading component
export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-20 rounded-full" />
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="skeleton h-10 w-10 rounded-full ml-3" />
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-5/6" />
      <div className="flex gap-1.5">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="flex justify-between pt-2 border-t border-[#E8E3D8]">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
  );
}

export function PageSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Empty state component
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="w-16 h-16 bg-charcoal-100 rounded-2xl flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-charcoal-400" />
        </div>
      )}
      <h3 className="text-lg font-serif text-charcoal-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-charcoal-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// Error state
export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="empty-state">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-3xl">⚠️</span>
      </div>
      <h3 className="text-lg font-serif text-charcoal-800 mb-2">Unable to load</h3>
      <p className="text-sm text-charcoal-500 mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline">
          Try again
        </button>
      )}
    </div>
  );
}

// Stat card
export function StatCard({ label, value, icon: Icon, color = 'text-charcoal-900', trend, to, onClick, subtitle }) {
  const inner = (
    <div className={`card p-5 transition-all duration-200 group relative overflow-hidden ${to || onClick ? 'cursor-pointer hover:border-charcoal-400 hover:shadow-md hover:-translate-y-0.5' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-[#E8E3D8] flex items-center justify-center text-charcoal-600 group-hover:text-rust-600 group-hover:border-rust-300 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className={`text-3xl font-serif font-bold ${color}`}>{value}</div>
        {subtitle && <span className="text-xs text-charcoal-400 font-medium">{subtitle}</span>}
      </div>
      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
          {trend}
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{inner}</Link>;
  }
  return <div onClick={onClick}>{inner}</div>;
}

// Score ring
export function ScoreRing({ score, size = 64 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E8E3D8"
        strokeWidth="5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90"
        style={{ transform: `rotate(90deg) translate(0px, -${size}px)`, fontSize: size < 50 ? '10px' : '13px', fontWeight: '700', fill: color }}
      >
        {score}
      </text>
    </svg>
  );
}

// Confirm dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 max-w-sm w-full shadow-modal animate-scale-in">
        <h3 className="text-base font-semibold text-charcoal-900 mb-2">{title}</h3>
        <p className="text-sm text-charcoal-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 btn ${danger ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tag input
export function TagInput({ tags = [], onChange, placeholder = 'Add tag...' }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const t = input.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-[#DDD8CC] rounded-lg bg-[#FEFCF8] min-h-[42px]">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-charcoal-100 text-charcoal-700 text-xs rounded-full">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-charcoal-400 hover:text-charcoal-700 leading-none">×</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
        }}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-24 text-xs outline-none bg-transparent text-charcoal-900 placeholder-charcoal-400"
      />
    </div>
  );
}

// Pagination
export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="btn-outline btn-sm disabled:opacity-40">
        ← Prev
      </button>
      <span className="text-sm text-charcoal-500">
        Page {page} of {pages}
      </span>
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="btn-outline btn-sm disabled:opacity-40">
        Next →
      </button>
    </div>
  );
}


