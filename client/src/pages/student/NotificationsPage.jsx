import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../api';
import { formatDate } from '../../utils/helpers';
import { EmptyState, Pagination } from '../../components/ui/SharedComponents';
import {
  Bell, CheckCircle2, Clock, Calendar, ArrowRight,
  Trash2, Check, ExternalLink, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page, filterUnread]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await notificationsAPI.list({
        page,
        limit: 15,
        ...(filterUnread && { unread: 'true' }),
      });
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
        setPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  }

  async function handleDelete(id) {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to remove notification');
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'deadline_reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'interview_reminder':
        return <Calendar className="w-4 h-4 text-violet-600" />;
      case 'application_update':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-rust-600" />;
    }
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#E8E3D8] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
              Activity & Reminders
            </p>
            <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Timely alerts for impending deadlines, status updates, and next actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterUnread(false);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !filterUnread
                ? 'bg-charcoal-900 text-cream-100'
                : 'bg-[#FEFCF8] text-charcoal-600 border border-[#DDD8CC]'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => {
              setFilterUnread(true);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterUnread
                ? 'bg-charcoal-900 text-cream-100'
                : 'bg-[#FEFCF8] text-charcoal-600 border border-[#DDD8CC]'
            }`}
          >
            Unread Only
            {unreadCount > 0 && (
              <span className="w-4 h-4 bg-rust-600 text-white rounded-full text-2xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filterUnread ? 'No unread notifications' : 'Your notification box is clear'}
            description="You will receive alerts here when deadlines approach for your saved opportunities or applications."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`card p-4 transition flex items-start gap-4 ${
                  !notif.isRead
                    ? 'border-rust-300 bg-[#FEFCF8] shadow-sm'
                    : 'bg-[#FAF7F0]/80 opacity-80'
                }`}
              >
                {/* Type Icon */}
                <div className="w-9 h-9 rounded-xl bg-charcoal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-charcoal-900 leading-snug">
                      {notif.title}
                    </h3>
                    <span className="text-2xs text-charcoal-400 whitespace-nowrap">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Actions row */}
                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#F0EBE1] text-xs">
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                        className="text-rust-600 hover:text-rust-700 font-semibold inline-flex items-center gap-1"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif._id)}
                        className="text-charcoal-500 hover:text-charcoal-800 font-medium"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(notif._id)}
                      className="text-charcoal-400 hover:text-red-600 ml-auto"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

