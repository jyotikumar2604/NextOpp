import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { Pagination, ConfirmDialog } from '../../components/ui/SharedComponents';
import {
  Users, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation modal
  const [targetAction, setTargetAction] = useState(null); // { user, type: 'toggleActive' | 'toggleRole' }

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await adminAPI.users({
        page: pagination.page,
        limit: 15,
        ...(roleFilter && { role: roleFilter }),
        ...(searchQuery.trim() && { q: searchQuery.trim() }),
      });
      if (res.success) {
        setUsers(res.users || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchUsers();
  };

  const handleConfirmAction = async () => {
    if (!targetAction) return;
    const { user, type } = targetAction;

    try {
      if (type === 'toggleActive') {
        const nextActive = !user.isActive;
        await adminAPI.updateUser(user._id, { isActive: nextActive });
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: nextActive } : u))
        );
        toast.success(nextActive ? 'User account reactivated' : 'User account deactivated');
      } else if (type === 'toggleRole') {
        const nextRole = user.role === 'admin' ? 'student' : 'admin';
        await adminAPI.updateUser(user._id, { role: nextRole });
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u))
        );
        toast.success(`User role changed to ${nextRole}`);
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setTargetAction(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E8E3D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
            Access Control
          </p>
          <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
            User Accounts
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Manage student registrations, administrative privileges, and security locks.
          </p>
        </div>

        <div className="text-xs text-charcoal-500 font-medium">
          {pagination.total} registered users
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-rust-500"
          />
        </form>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-charcoal-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="bg-[#FEFCF8] border border-[#DDD8CC] rounded-xl px-3 py-2 text-xs text-charcoal-800 font-medium focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="student">Students Only</option>
            <option value="admin">Administrators Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#E8E3D8] text-charcoal-600 font-semibold uppercase tracking-wider text-2xs">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-400">
                    Loading user records…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u._id === currentAdmin?._id;
                  return (
                    <tr key={u._id} className="hover:bg-[#FAF7F0]/60 transition">
                      <td className="py-3 px-4 font-semibold text-charcoal-900">
                        {u.name} {isSelf && <span className="text-2xs text-rust-600">(You)</span>}
                      </td>
                      <td className="py-3 px-4 text-charcoal-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge text-2xs font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-charcoal-100 text-charcoal-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`badge text-2xs font-bold uppercase ${
                            u.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal-500">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isSelf ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle role */}
                            <button
                              onClick={() => setTargetAction({ user: u, type: 'toggleRole' })}
                              className="btn-outline text-2xs py-1 px-2.5"
                              title="Toggle Administrator Privileges"
                            >
                              {u.role === 'admin' ? 'Demote to Student' : 'Make Admin'}
                            </button>

                            {/* Toggle active */}
                            <button
                              onClick={() => setTargetAction({ user: u, type: 'toggleActive' })}
                              className={`text-2xs py-1 px-2.5 rounded font-semibold border ${
                                u.isActive !== false
                                  ? 'border-red-300 text-red-700 hover:bg-red-50'
                                  : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive !== false ? 'Suspend' : 'Reactivate'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-2xs text-charcoal-400 italic">Self Account</span>
                        )}
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

      {/* Action Dialog */}
      <ConfirmDialog
        isOpen={!!targetAction}
        onClose={() => setTargetAction(null)}
        onConfirm={handleConfirmAction}
        title={
          targetAction?.type === 'toggleRole'
            ? 'Change User Permissions?'
            : targetAction?.user?.isActive !== false
            ? 'Suspend User Account?'
            : 'Reactivate User Account?'
        }
        message={
          targetAction?.type === 'toggleRole'
            ? `Are you sure you want to change permissions for "${targetAction?.user?.name}" to ${
                targetAction?.user?.role === 'admin' ? 'Student' : 'Administrator'
              }?`
            : `Are you sure you want to ${
                targetAction?.user?.isActive !== false ? 'suspend' : 'reactivate'
              } "${targetAction?.user?.name}"?`
        }
        confirmLabel="Confirm Change"
        danger={targetAction?.user?.isActive !== false && targetAction?.type === 'toggleActive'}
      />
    </div>
  );
}

