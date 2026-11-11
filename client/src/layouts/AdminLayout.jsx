import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, ListChecks, Users, FileText, Briefcase, LogOut, ChevronLeft, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_NAV = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard', exact: true },
  { to: '/admin/opportunities', icon: ListChecks, label: 'Opportunities' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/ingest', icon: Database, label: 'Ingestion' },
  { to: '/admin/logs', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="w-60 bg-charcoal-900 flex flex-col fixed h-full z-30">
        <div className="px-5 py-5 border-b border-charcoal-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-rust-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-serif text-base text-cream-100">NextOpp</div>
              <div className="text-2xs text-charcoal-400 font-medium uppercase tracking-wide">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {ADMIN_NAV.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base
                ${isActive
                  ? 'bg-charcoal-700 text-cream-100'
                  : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-cream-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-charcoal-700 space-y-1">
          <NavLink to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-charcoal-400 hover:text-cream-200 transition-base rounded-lg">
            <ChevronLeft className="w-4 h-4" />
            Student App
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-400 hover:text-red-400 transition-base rounded-lg">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
