import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { formatDate } from '../../utils/helpers';
import {
  User, Lock, Bell, Shield, KeyRound, CheckCircle2,
  AlertCircle, LogOut, Smartphone, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification Preferences (local student toggles)
  const [prefs, setPrefs] = useState({
    deadlineAlerts: true,
    statusUpdates: true,
    interviewReminders: true,
    weeklyDigest: false,
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePref = (key) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success('Preference updated');
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#E8E3D8] pb-6">
          <p className="text-xs uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
            Account & Security
          </p>
          <h1 className="text-3xl font-serif text-charcoal-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Manage your account credentials, security settings, and notifications.
          </p>
        </div>

        {/* Profile Details Summary */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
            <User className="w-5 h-5 text-rust-600" />
            <h2 className="text-base font-serif text-charcoal-900">
              Account Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E3D8]">
              <span className="text-charcoal-400 block mb-1">Full Name</span>
              <span className="font-semibold text-charcoal-900 text-sm">{user?.name}</span>
            </div>

            <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E3D8]">
              <span className="text-charcoal-400 block mb-1">Email Address</span>
              <span className="font-semibold text-charcoal-900 text-sm">{user?.email}</span>
            </div>

            <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E3D8]">
              <span className="text-charcoal-400 block mb-1">Account Role</span>
              <span className="font-semibold text-charcoal-900 text-sm capitalize">
                {user?.role || 'student'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
            <KeyRound className="w-5 h-5 text-rust-600" />
            <h2 className="text-base font-serif text-charcoal-900">
              Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg text-xs">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing password"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full p-2.5 bg-[#FEFCF8] border border-[#DDD8CC] rounded-lg text-charcoal-900 focus:outline-none focus:border-rust-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary text-xs py-2.5 px-5 font-semibold"
            >
              {savingPassword ? 'Updating Password…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
            <Bell className="w-5 h-5 text-rust-600" />
            <h2 className="text-base font-serif text-charcoal-900">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                id: 'deadlineAlerts',
                title: 'Upcoming Deadline Alerts',
                desc: 'Receive alerts 7 days and 24 hours prior to opportunity closing dates.',
              },
              {
                id: 'statusUpdates',
                title: 'Application Stage Changes',
                desc: 'Get notified whenever an application moves between assessment, interview, and offer.',
              },
              {
                id: 'interviewReminders',
                title: 'Interview Calendar Reminders',
                desc: 'Notification 24 hours before any scheduled interview round.',
              },
              {
                id: 'weeklyDigest',
                title: 'Weekly Opportunity Digest',
                desc: 'A Monday morning summary of top newly published opportunities matching your skills.',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-[#FAF7F0] border border-[#E8E3D8] rounded-xl gap-4"
              >
                <div>
                  <div className="font-semibold text-charcoal-900">{item.title}</div>
                  <div className="text-charcoal-500 mt-0.5">{item.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => togglePref(item.id)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                    prefs[item.id] ? 'bg-rust-600 justify-end' : 'bg-charcoal-300 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-sm block" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Authentication Protocol */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
            <Shield className="w-5 h-5 text-rust-600" />
            <h2 className="text-base font-serif text-charcoal-900">
              Security Architecture
            </h2>
          </div>

          <div className="space-y-2 text-xs text-charcoal-600 leading-relaxed">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>HTTP-Only Secure Cookie Session Protection</span>
            </div>
            <p className="text-charcoal-500 pl-6">
              Your authentication token is stored exclusively inside HTTP-only cookies, eliminating exposure to cross-site scripting (XSS) attacks. No tokens are persisted in localStorage.
            </p>

            <div className="flex items-center gap-2 text-emerald-700 font-semibold pt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bcrypt Password Hashing & Rate-Limited Endpoints</span>
            </div>
            <p className="text-charcoal-500 pl-6">
              Authentication routes are rate-limited to prevent brute force attacks, and account lockout occurs after 5 repeated invalid attempts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

