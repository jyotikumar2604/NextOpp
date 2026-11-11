import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI, opportunitiesAPI } from '../../api';
import { formatDate, getCategoryDisplay, deadlineDisplay } from '../../utils/helpers';
import { ConfirmDialog, Pagination } from '../../components/ui/SharedComponents';
import {
  PlusCircle, Search, Edit3, Trash2, CheckCircle2,
  XCircle, Archive, ExternalLink, Filter, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: '', label: 'All Listings' },
  { id: 'published', label: 'Published' },
  { id: 'pending_review', label: 'Pending Review' },
  { id: 'draft', label: 'Drafts' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'archived', label: 'Archived' },
];

export default function AdminOpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';

  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [oppToDelete, setOppToDelete] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, [statusParam, pagination.page]);

  async function fetchOpportunities() {
    setLoading(true);
    try {
      const res = await adminAPI.opportunities({
        page: pagination.page,
        limit: 15,
        ...(statusParam && { status: statusParam }),
        ...(searchQuery.trim() && { q: searchQuery.trim() }),
      });
      if (res.success) {
        setOpportunities(res.opportunities || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await opportunitiesAPI.update(id, { status: newStatus });
      if (res.success) {
        setOpportunities((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
        );
        toast.success(`Listing status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!oppToDelete) return;
    try {
      await opportunitiesAPI.delete(oppToDelete._id);
      setOpportunities((prev) => prev.filter((o) => o._id !== oppToDelete._id));
      toast.success('Opportunity deleted permanently');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setOppToDelete(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchOpportunities();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E3D8] pb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
            Moderation & Content
          </p>
          <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
            Manage Opportunities
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Review submissions, approve published listings, or archive expired entries.
          </p>
        </div>

        <Link
          to="/admin/opportunities/new"
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E8E3D8]">
        {STATUS_TABS.map((tab) => {
          const active = statusParam === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSearchParams(tab.id ? { status: tab.id } : {});
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-4 py-2 rounded-t-lg text-xs font-semibold transition border-b-2 whitespace-nowrap ${
                active
                  ? 'border-rust-600 text-rust-600 bg-[#FEFCF8]'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="flex gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or organization..."
            className="w-full pl-9 pr-3 py-2 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#E8E3D8] text-charcoal-600 font-semibold uppercase tracking-wider text-2xs">
              <tr>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-400">
                    Loading opportunities…
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-400">
                    No opportunities found in this category.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => {
                  const category = getCategoryDisplay(opp.category);
                  const deadline = deadlineDisplay(opp.deadline);
                  return (
                    <tr key={opp._id} className="hover:bg-[#FAF7F0]/60 transition">
                      <td className="py-3 px-4 font-semibold text-charcoal-900">
                        <Link
                          to={`/opportunities/${opp._id}`}
                          className="hover:text-rust-600 transition"
                        >
                          {opp.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-charcoal-600">{opp.organization}</td>
                      <td className="py-3 px-4">
                        <span className={`badge border ${category.className}`}>
                          {category.emoji} {category.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal-600">
                        <span className={deadline.urgent ? 'text-red-600 font-semibold' : ''}>
                          {deadline.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge text-2xs font-bold uppercase ${
                            opp.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : opp.status === 'pending_review'
                              ? 'bg-amber-100 text-amber-800'
                              : opp.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-charcoal-100 text-charcoal-700'
                          }`}
                        >
                          {opp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve / Publish */}
                          {opp.status !== 'published' && (
                            <button
                              onClick={() => handleStatusChange(opp._id, 'published')}
                              className="p-1 text-emerald-600 hover:text-emerald-800"
                              title="Publish / Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject */}
                          {opp.status === 'pending_review' && (
                            <button
                              onClick={() => handleStatusChange(opp._id, 'rejected')}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive */}
                          {opp.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(opp._id, 'archived')}
                              className="p-1 text-charcoal-400 hover:text-charcoal-700"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Form */}
                          <Link
                            to={`/admin/opportunities/${opp._id}/edit`}
                            className="p-1 text-charcoal-400 hover:text-charcoal-800"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => setOppToDelete(opp)}
                            className="p-1 text-charcoal-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!oppToDelete}
        onClose={() => setOppToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Opportunity?"
        message={`Are you sure you want to permanently delete "${oppToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger={true}
      />
    </div>
  );
}

