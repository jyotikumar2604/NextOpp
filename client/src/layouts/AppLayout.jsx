import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Compass, Bookmark, ClipboardList,
  User, Bell, Settings, LogOut, Menu, X, ChevronRight,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../api';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: "Today's Move" },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/tracker', icon: ClipboardList, label: 'Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsAPI.list({ limit: 1 })
      .then((d) => setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const initials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#FEFCF8] border-r border-[#E8E3D8] fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#E8E3D8]">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-charcoal-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-cream-100" />
            </div>
            <div>
              <span className="font-serif text-lg text-charcoal-900 leading-none">NextOpp</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base group
                  ${isActive
                    ? 'bg-charcoal-900 text-cream-100'
                    : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E3D8] space-y-0.5">
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base
                ${isActive ? 'bg-charcoal-900 text-cream-100' : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900'}`
              }
            >
              <Bell className="w-4 h-4" />
              Notifications
              {unread > 0 && (
                <span className="ml-auto bg-rust-600 text-white text-2xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base
                ${isActive ? 'bg-charcoal-900 text-cream-100' : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900'}`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rust-700 hover:bg-rust-50 transition-base"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Panel
              </NavLink>
            )}
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-[#E8E3D8]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-charcoal-900 rounded-full flex items-center justify-center text-cream-100 text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-900 truncate">{user?.name}</p>
              <p className="text-xs text-charcoal-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-base rounded" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#FEFCF8] border-b border-[#E8E3D8] px-4 h-14 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-charcoal-900 rounded-lg flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-cream-100" />
          </div>
          <span className="font-serif text-base text-charcoal-900">NextOpp</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <NavLink to="/notifications" className="relative p-2 text-charcoal-600 hover:text-charcoal-900">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rust-600 rounded-full" />}
          </NavLink>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-charcoal-600">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#FEFCF8] border-r border-[#E8E3D8] p-4 pt-16 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-0.5 mb-6">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base
                    ${isActive ? 'bg-charcoal-900 text-cream-100' : 'text-charcoal-600 hover:bg-charcoal-100'}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-charcoal-600 hover:text-charcoal-900 w-full">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0 pb-20 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FEFCF8]/95 backdrop-blur-md border-t border-[#E8E3D8] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-rust-600 font-semibold'
                  : 'text-charcoal-500 hover:text-charcoal-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg ${isActive ? 'bg-rust-50 text-rust-600' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xs mt-0.5 tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
