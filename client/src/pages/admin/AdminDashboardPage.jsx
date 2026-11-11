import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/helpers';
import { StatCard } from '../../components/ui/SharedComponents';
import {
  Users, ListChecks, ClipboardList, Bookmark, AlertCircle,
  PlusCircle, ArrowRight, BarChart3, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await adminAPI.stats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load admin metrics');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-2 border-charcoal-700 border-t-rust-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Format data for Recharts
  const categoryData = stats?.byCategory
    ? Object.entries(stats.byCategory).map(([key, count]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        count,
      }))
    : [];

  const appStatusData = stats?.applications?.byStatus
    ? Object.entries(stats.applications.byStatus).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))
    : [];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E3D8] pb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
            System Administration
          </p>
          <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
            Platform Overview
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Real-time telemetry, moderation status, and student engagement data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/opportunities/new"
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Create Opportunity
          </Link>
        </div>
      </div>

      {/* Pending moderation alert banner if any */}
      {stats?.opportunities?.pending > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">{stats.opportunities.pending} opportunities</span> are pending review and moderation.
            </div>
          </div>
          <Link
            to="/admin/opportunities?status=pending_review"
            className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
          >
            Review Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={stats?.users?.total ?? 0}
          icon={Users}
          trend={`${stats?.users?.students ?? 0} active students`}
        />
        <StatCard
          label="Published Opportunities"
          value={stats?.opportunities?.published ?? 0}
          icon={ListChecks}
          color="text-emerald-700"
          trend={`${stats?.opportunities?.total ?? 0} total in database`}
        />
        <StatCard
          label="Student Applications"
          value={stats?.applications?.total ?? 0}
          icon={ClipboardList}
          color="text-rust-600"
        />
        <StatCard
          label="Saved Bookmarks"
          value={stats?.saved ?? 0}
          icon={Bookmark}
          color="text-violet-700"
        />
      </div>

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rust-600" />
              <h3 className="font-serif text-sm font-semibold text-charcoal-900">
                Opportunities by Category
              </h3>
            </div>
            <span className="text-2xs text-charcoal-400 font-medium">Published Listings</span>
          </div>

          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No published opportunities to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#787878' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#787878' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      color: '#FEFCF8',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#C45C2E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Application Pipeline Status */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="font-serif text-sm font-semibold text-charcoal-900">
                Application Pipeline Breakdown
              </h3>
            </div>
            <span className="text-2xs text-charcoal-400 font-medium">Student Progress</span>
          </div>

          <div className="h-64 w-full">
            {appStatusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                No student applications recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                  <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#787878' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#787878' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      color: '#FEFCF8',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#383838" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registered Users */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
          <h3 className="font-serif text-sm font-semibold text-charcoal-900">
            Recently Registered Users
          </h3>
          <Link
            to="/admin/users"
            className="text-xs text-rust-600 hover:text-rust-700 font-semibold inline-flex items-center gap-1"
          >
            View All Users <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] text-charcoal-600 font-semibold text-2xs uppercase">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {(stats?.recentUsers || []).map((u) => (
                <tr key={u._id} className="hover:bg-[#FAF7F0]/60 transition">
                  <td className="py-2.5 px-3 font-medium text-charcoal-900">{u.name}</td>
                  <td className="py-2.5 px-3 text-charcoal-600">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="badge text-2xs bg-charcoal-100 text-charcoal-800 capitalize font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-charcoal-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

