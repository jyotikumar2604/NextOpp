import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, opportunitiesAPI } from '../../api';
import {
  formatDate, getStatusDisplay
} from '../../utils/helpers';
import { ConfirmDialog, StatCard } from '../../components/ui/SharedComponents';
import {
  Kanban, List, Plus, Search, Calendar, Clock,
  Edit3, Trash2, CheckCircle2, Filter, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'border-blue-400 bg-blue-50/40 text-blue-800' },
  { id: 'assessment', label: 'Assessment', color: 'border-amber-400 bg-amber-50/40 text-amber-800' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-violet-400 bg-violet-50/40 text-violet-800' },
  { id: 'offer', label: 'Offer 🎉', color: 'border-emerald-400 bg-emerald-50/40 text-emerald-800' },
  { id: 'rejected', label: 'Rejected', color: 'border-red-300 bg-red-50/30 text-red-700' },
  { id: 'withdrawn', label: 'Withdrawn', color: 'border-gray-300 bg-gray-50/30 text-gray-700' },
];

export default function TrackerPage() {
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Modals
  const [editingApp, setEditingApp] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add modal state
  const [availableOpps, setAvailableOpps] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit form state
  const [editStatus, setEditStatus] = useState('applied');
  const [editNotes, setEditNotes] = useState('');
  const [editInterviewDate, setEditInterviewDate] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await applicationsAPI.list({ limit: 100 });
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await applicationsAPI.stats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch {
      // ignore
    }
  }

  async function openAddModal() {
    setShowAddModal(true);
    try {
      const res = await opportunitiesAPI.list({ limit: 50 });
      if (res.success) {
        // Exclude opportunities already applied to
        const appliedOppIds = new Set(applications.map((a) => a.opportunity?._id));
        const filtered = (res.opportunities || []).filter((o) => !appliedOppIds.has(o._id));
        setAvailableOpps(filtered);
        if (filtered.length > 0) setSelectedOppId(filtered[0]._id);
      }
    } catch {
      toast.error('Failed to load opportunities');
    }
  }

  async function handleAddApplication(e) {
    e.preventDefault();
    if (!selectedOppId) return;
    setAdding(true);
    try {
      const res = await applicationsAPI.create({
        opportunityId: selectedOppId,
        notes: newNotes,
        appliedAt: new Date().toISOString(),
      });
      if (res.success) {
        toast.success('Application added!');
        setShowAddModal(false);
        setNewNotes('');
        fetchApplications();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add application');
    } finally {
      setAdding(false);
    }
  }

  function handleOpenEdit(app) {
    setEditingApp(app);
    setEditStatus(app.status || 'applied');
    setEditNotes(app.notes || '');
    setEditInterviewDate(app.interviewDate ? app.interviewDate.split('T')[0] : '');
    setEditFollowUpDate(app.followUpDate ? app.followUpDate.split('T')[0] : '');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingApp) return;
    setSavingEdit(true);
    try {
      const payload = {
        status: editStatus,
        notes: editNotes,
        interviewDate: editInterviewDate || null,
        followUpDate: editFollowUpDate || null,
      };
      const res = await applicationsAPI.update(editingApp._id, payload);
      if (res.success) {
        toast.success('Application updated');
        setEditingApp(null);
        fetchApplications();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update application');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleQuickStatusChange(appId, newStatus) {
    try {
      await applicationsAPI.update(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      fetchStats();
      toast.success(`Moved to ${getStatusDisplay(newStatus).label}`);
    } catch (err) {
      toast.error(err.message || 'Could not move stage');
    }
  }

  async function handleDeleteApplication() {
    if (!appToDelete) return;
    try {
      await applicationsAPI.delete(appToDelete._id);
      setApplications((prev) => prev.filter((a) => a._id !== appToDelete._id));
      toast.success('Application removed');
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setAppToDelete(null);
    }
  }

  // Filter applications by search and stage
  const filteredApps = applications.filter((app) => {
    const opp = app.opportunity;
    const matchSearch =
      !searchQuery.trim() ||
      opp?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp?.organization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStage = !stageFilter || app.status === stageFilter;
    return matchSearch && matchStage;
  });

  const activeCount =
    (stats?.byStatus?.applied || 0) +
    (stats?.byStatus?.assessment || 0) +
    (stats?.byStatus?.interviewing || 0);

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#E8E3D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
              Career Pipeline
            </p>
            <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
              Application Tracker
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Manage your applications across stages, record interview dates, and track outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center bg-[#FAF7F0] border border-[#DDD8CC] rounded-xl p-1">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  view === 'kanban'
                    ? 'bg-charcoal-900 text-cream-100 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" /> Board
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  view === 'list'
                    ? 'bg-charcoal-900 text-cream-100 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Plus className="w-4 h-4" /> Track Opportunity
            </button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Tracked"
            value={stats?.total ?? applications.length}
            icon={Building2}
          />
          <StatCard
            label="Active Pipeline"
            value={activeCount}
            color="text-rust-600"
            icon={Clock}
          />
          <StatCard
            label="Interviews / Assessments"
            value={(stats?.byStatus?.interviewing || 0) + (stats?.byStatus?.assessment || 0)}
            color="text-violet-700"
            icon={Calendar}
          />
          <StatCard
            label="Offers Received"
            value={stats?.byStatus?.offer || 0}
            color="text-emerald-700"
            icon={CheckCircle2}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company or role..."
              className="w-full pl-9 pr-3 py-2 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-charcoal-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-charcoal-800 font-medium focus:outline-none"
            >
              <option value="">All Stages</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode: Kanban */}
        {view === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageApps = filteredApps.filter((a) => a.status === stage.id);
              return (
                <div
                  key={stage.id}
                  className="bg-[#FAF7F0] border border-[#E8E3D8] rounded-xl p-3 min-w-[240px] flex flex-col gap-3 min-h-[400px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E3D8]">
                    <span className="text-xs font-bold text-charcoal-800">
                      {stage.label}
                    </span>
                    <span className="text-2xs font-semibold px-2 py-0.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-full text-charcoal-600">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 flex-1">
                    {stageApps.length === 0 ? (
                      <div className="py-8 text-center text-2xs text-charcoal-400 border border-dashed border-[#DDD8CC] rounded-lg">
                        No applications
                      </div>
                    ) : (
                      stageApps.map((app) => {
                        const opp = app.opportunity;
                        return (
                          <div
                            key={app._id}
                            className="bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl p-3.5 shadow-sm space-y-2.5 hover:border-rust-400 transition"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="badge text-2xs bg-charcoal-100 text-charcoal-600 font-medium">
                                {opp?.category || 'role'}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(app)}
                                  className="text-charcoal-400 hover:text-charcoal-800 p-1"
                                  title="Edit details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setAppToDelete(app)}
                                  className="text-charcoal-400 hover:text-red-600 p-1"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <Link
                                to={`/opportunities/${opp?._id}`}
                                className="text-xs font-semibold text-charcoal-900 hover:text-rust-600 line-clamp-1 transition"
                              >
                                {opp?.title || 'Unknown Opportunity'}
                              </Link>
                              <p className="text-2xs text-charcoal-500 font-medium mt-0.5">
                                {opp?.organization}
                              </p>
                            </div>

                            {/* Dates */}
                            <div className="text-2xs text-charcoal-500 space-y-1 pt-1 border-t border-[#F0EBE1]">
                              <div className="flex items-center justify-between">
                                <span>Applied:</span>
                                <span className="font-medium text-charcoal-700">
                                  {formatDate(app.appliedAt)}
                                </span>
                              </div>
                              {app.interviewDate && (
                                <div className="flex items-center justify-between text-violet-700 font-semibold">
                                  <span>Interview:</span>
                                  <span>{formatDate(app.interviewDate)}</span>
                                </div>
                              )}
                              {app.followUpDate && (
                                <div className="flex items-center justify-between text-amber-700 font-semibold">
                                  <span>Follow-up:</span>
                                  <span>{formatDate(app.followUpDate)}</span>
                                </div>
                              )}
                            </div>

                            {/* Quick Stage Change Dropdown */}
                            <div className="pt-2 border-t border-[#F0EBE1]">
                              <select
                                value={app.status}
                                onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                                className="w-full text-2xs bg-[#FAF7F0] border border-[#DDD8CC] rounded-lg py-1 px-1.5 text-charcoal-700 font-medium focus:outline-none"
                              >
                                {STAGES.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    Move to {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode: Table List */
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F0] border-b border-[#E8E3D8] text-charcoal-600 font-semibold uppercase tracking-wider text-2xs">
                  <tr>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Next Event</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-charcoal-400">
                        No applications match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const opp = app.opportunity;
                      const statusInfo = getStatusDisplay(app.status);
                      return (
                        <tr key={app._id} className="hover:bg-[#FAF7F0]/60 transition">
                          <td className="py-3 px-4 font-semibold text-charcoal-900">
                            <Link
                              to={`/opportunities/${opp?._id}`}
                              className="hover:text-rust-600 transition"
                            >
                              {opp?.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-charcoal-600">
                            {opp?.organization}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge border ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-charcoal-500">
                            {formatDate(app.appliedAt)}
                          </td>
                          <td className="py-3 px-4">
                            {app.interviewDate ? (
                              <span className="text-violet-700 font-semibold">
                                Interview: {formatDate(app.interviewDate)}
                              </span>
                            ) : app.followUpDate ? (
                              <span className="text-amber-700 font-semibold">
                                Follow-up: {formatDate(app.followUpDate)}
                              </span>
                            ) : (
                              <span className="text-charcoal-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(app)}
                                className="p-1 text-charcoal-400 hover:text-charcoal-800"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setAppToDelete(app)}
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
        )}

        {/* Modal: Track Existing Opportunity */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="relative card p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
              <h3 className="text-lg font-serif text-charcoal-900">
                Track Application
              </h3>

              <form onSubmit={handleAddApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Select Opportunity
                  </label>
                  {availableOpps.length > 0 ? (
                    <select
                      value={selectedOppId}
                      onChange={(e) => setSelectedOppId(e.target.value)}
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500"
                    >
                      {availableOpps.map((o) => (
                        <option key={o._id} value={o._id}>
                          {o.title} — {o.organization}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-charcoal-400">
                      No untracked opportunities found.{' '}
                      <Link to="/explore" className="text-rust-600 font-semibold underline">
                        Explore opportunities
                      </Link>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Applied via official website, referral by John..."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-xs text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline flex-1 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || !selectedOppId}
                    className="btn-primary flex-1 text-xs"
                  >
                    {adding ? 'Adding…' : 'Start Tracking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Application */}
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingApp(null)} />
            <div className="relative card p-6 max-w-lg w-full shadow-modal animate-scale-in space-y-4">
              <h3 className="text-lg font-serif text-charcoal-900">
                Update Application: {editingApp.opportunity?.title}
              </h3>
              <p className="text-xs text-charcoal-500">
                {editingApp.opportunity?.organization}
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                {/* Status */}
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Stage</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 font-medium focus:outline-none focus:border-rust-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Interview Date</label>
                    <input
                      type="date"
                      value={editInterviewDate}
                      onChange={(e) => setEditInterviewDate(e.target.value)}
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={editFollowUpDate}
                      onChange={(e) => setEditFollowUpDate(e.target.value)}
                      className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Application Notes</label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Interview feedback, next interview round topics, questions to ask..."
                    className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
                  />
                </div>

                {/* Status History */}
                {editingApp.statusHistory?.length > 0 && (
                  <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#E8E3D8] space-y-1.5">
                    <span className="font-semibold text-charcoal-700 block">Stage History:</span>
                    <div className="space-y-1 text-2xs text-charcoal-500">
                      {editingApp.statusHistory.map((h, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="font-medium text-charcoal-800 capitalize">{h.status}</span>
                          <span>{formatDate(h.changedAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="btn-primary flex-1"
                  >
                    {savingEdit ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!appToDelete}
          onClose={() => setAppToDelete(null)}
          onConfirm={handleDeleteApplication}
          title="Remove from Tracker?"
          message={`Are you sure you want to delete your application record for "${appToDelete?.opportunity?.title}"?`}
          confirmLabel="Delete"
          danger={true}
        />
      </div>
    </div>
  );
}

