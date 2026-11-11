import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/helpers';
import { Pagination } from '../../components/ui/SharedComponents';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await adminAPI.logs({
        page: pagination.page,
        limit: 25,
      });
      if (res.success) {
        setLogs(res.logs || []);
        setPagination((prev) => ({
          ...prev,
          total: res.pagination?.total || 0,
        }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  function getActionBadge(action) {
    if (action.includes('created')) {
      return <span className="badge bg-emerald-100 text-emerald-800 text-2xs">Created</span>;
    }
    if (action.includes('updated')) {
      return <span className="badge bg-blue-100 text-blue-800 text-2xs">Updated</span>;
    }
    if (action.includes('deleted') || action.includes('deactivated')) {
      return <span className="badge bg-red-100 text-red-800 text-2xs">Removed</span>;
    }
    return <span className="badge bg-charcoal-100 text-charcoal-700 text-2xs">{action}</span>;
  }

  const pages = Math.ceil(pagination.total / 25) || 1;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E8E3D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
            Compliance & Security
          </p>
          <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
            Moderation Audit Logs
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Immutable record of all administrative actions, content updates, and permission changes.
          </p>
        </div>

        <div className="text-xs text-charcoal-500 font-medium">
          {pagination.total} audit events recorded
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#E8E3D8] text-charcoal-600 font-semibold uppercase tracking-wider text-2xs">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Details / Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-charcoal-400">
                    Loading audit trail…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-charcoal-400">
                    No administrative actions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF7F0]/60 transition">
                    <td className="py-3 px-4 text-charcoal-500 whitespace-nowrap">
                      {formatDate(log.createdAt, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-charcoal-900">
                      {log.admin?.name || 'System Admin'}
                      <div className="text-2xs text-charcoal-400 font-normal">
                        {log.admin?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 font-mono text-charcoal-600 uppercase text-2xs">
                      {log.targetType}
                    </td>
                    <td className="py-3 px-4 text-charcoal-700 max-w-md">
                      {log.note || (
                        <div className="text-2xs font-mono text-charcoal-500 truncate">
                          {log.before && `Before: ${JSON.stringify(log.before)} `}
                          {log.after && `→ After: ${JSON.stringify(log.after)}`}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pages}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      )}
    </div>
  );
}

