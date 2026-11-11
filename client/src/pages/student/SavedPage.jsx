import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { savedAPI, applicationsAPI } from '../../api';
import {
  Bookmark, Trash2, ExternalLink, Calendar, MapPin, DollarSign,
  ArrowRight, Search, PlusCircle, AlertCircle, Briefcase, Filter
} from 'lucide-react';
import {
  getCategoryDisplay, deadlineDisplay, getWorkModeDisplay, formatDate
} from '../../utils/helpers';
import { PageSkeleton, EmptyState, Pagination, ConfirmDialog } from '../../components/ui/SharedComponents';
import toast from 'react-hot-toast';

export default function SavedPage() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Application track modal
  const [trackOpp, setTrackOpp] = useState(null);
  const [trackNotes, setTrackNotes] = useState('');
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    fetchSaved();
  }, [page, selectedCategory]);

  async function fetchSaved() {
    setLoading(true);
    try {
      const res = await savedAPI.list({
        page,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
      });
      if (res.success) {
        setSavedItems(res.saved || []);
        setPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load saved items');
    } finally {
      setLoading(false);
    }
  }

  const handleUnsave = async () => {
    if (!itemToDelete) return;
    try {
      await savedAPI.unsave(itemToDelete.opportunity._id);
      setSavedItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleTrackApplication = async (e) => {
    e.preventDefault();
    if (!trackOpp) return;
    setTracking(true);
    try {
      await applicationsAPI.create({
        opportunityId: trackOpp._id,
        notes: trackNotes,
        appliedAt: new Date().toISOString(),
      });
      toast.success('Application added to your Tracker!');
      setTrackOpp(null);
      setTrackNotes('');
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

  // Client-side quick search filtering
  const filteredItems = savedItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const opp = item.opportunity;
    return (
      opp?.title?.toLowerCase().includes(q) ||
      opp?.organization?.toLowerCase().includes(q) ||
      opp?.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#E8E3D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
              Student Bookmarks
            </p>
            <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
              Saved Opportunities
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Keep track of roles and deadlines you are planning to apply for.
            </p>
          </div>
          <div className="text-sm text-charcoal-500 font-medium">
            {total} {total === 1 ? 'bookmark' : 'bookmarks'} saved
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in saved..."
              className="w-full pl-9 pr-3 py-2 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-charcoal-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-charcoal-800 font-medium focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="internship">Internships</option>
              <option value="job">Jobs</option>
              <option value="scholarship">Scholarships</option>
              <option value="hackathon">Hackathons</option>
              <option value="fellowship">Fellowships</option>
              <option value="research">Research</option>
              <option value="competition">Competitions</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <PageSkeleton count={6} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title={savedItems.length === 0 ? "You haven't saved any opportunities yet" : "No matching bookmarks"}
            description={
              savedItems.length === 0
                ? "Browse opportunities and click the bookmark icon to save roles you're interested in for later."
                : "Try clearing your search query or switching categories."
            }
            action={
              savedItems.length === 0 ? (
                <Link to="/explore" className="btn-primary mt-3 inline-flex items-center gap-2">
                  Explore Opportunities <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const opp = item.opportunity;
              if (!opp) return null;
              const category = getCategoryDisplay(opp.category);
              const deadline = deadlineDisplay(opp.deadline);
              const workMode = getWorkModeDisplay(opp.workMode);

              return (
                <div
                  key={item._id}
                  className="card-hover p-5 flex flex-col justify-between gap-4 border border-[#E8E3D8] bg-[#FEFCF8] rounded-xl relative"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category + Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`badge border ${category.className}`}>
                        {category.emoji} {category.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-charcoal-400 hover:text-red-600 rounded transition"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Organization */}
                    <div>
                      <Link
                        to={`/opportunities/${opp._id}`}
                        className="text-sm font-semibold text-charcoal-900 hover:text-rust-600 line-clamp-2 leading-snug transition"
                      >
                        {opp.title}
                      </Link>
                      <p className="text-xs text-charcoal-500 font-medium mt-0.5">
                        {opp.organization}
                      </p>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-charcoal-600 pt-1 border-t border-[#F0EBE1]">
                      {opp.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                        <span className={item.isExpired ? 'text-red-500 font-bold' : deadline.color}>
                          {item.isExpired ? 'Deadline Expired' : deadline.text}
                        </span>
                      </div>
                      {opp.compensation && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-charcoal-400" />
                          <span className="font-semibold text-charcoal-800">{opp.compensation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-[#F0EBE1] flex items-center gap-2">
                    <Link
                      to={`/opportunities/${opp._id}`}
                      className="btn-outline flex-1 text-center text-xs py-1.5"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => setTrackOpp(opp)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      title="Add to application tracker"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Track
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        )}

        {/* Confirmation Dialog for Unsave */}
        <ConfirmDialog
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleUnsave}
          title="Remove Bookmark?"
          message={`Are you sure you want to remove "${itemToDelete?.opportunity?.title}" from your saved opportunities?`}
          confirmLabel="Remove"
          danger={true}
        />

        {/* Track Application Modal */}
        {trackOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTrackOpp(null)} />
            <div className="relative card p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
              <h3 className="text-lg font-serif text-charcoal-900">
                Track Application
              </h3>
              <p className="text-xs text-charcoal-500">
                Move <strong>{trackOpp.title}</strong> at <strong>{trackOpp.organization}</strong> to your Application Tracker.
              </p>

              <form onSubmit={handleTrackApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={trackNotes}
                    onChange={(e) => setTrackNotes(e.target.value)}
                    placeholder="e.g. Applied today with updated resume, waiting for callback..."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrackOpp(null)}
                    className="btn-outline flex-1 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={tracking}
                    className="btn-primary flex-1 text-xs"
                  >
                    {tracking ? 'Saving…' : 'Add to Tracker'}
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

