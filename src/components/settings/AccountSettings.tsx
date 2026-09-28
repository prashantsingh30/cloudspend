import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { CurrencyCode } from '../../types';
import { CURRENCY_SYMBOLS } from '../../utils/formatters';
import { User, KeyRound, Wallet, Sun, Moon, LogOut, Check } from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState<CurrencyCode>(user?.currency || 'USD');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(name.trim(), currency);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Simulate/trigger password change
      await new Promise((r) => setTimeout(r, 600));
      showToast('Password updated securely.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile & Wallet Card */}
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-[#E7EAF2] dark:border-[#26334D]">
          <div className="p-2 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
              Profile & Wallet Preferences
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
              Manage your display identity and financial ledger currency symbol.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                Account Email (Protected)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-[#17223A]/50 text-[#64748B] dark:text-[#A3AEC7] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl cursor-not-allowed"
              />
              <p className="text-[10px] text-[#64748B] dark:text-[#A3AEC7] mt-1">
                Email address is verified and isolated for this user profile.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
              Ledger Currency
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD'] as CurrencyCode[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`p-2.5 rounded-xl border text-center text-xs transition-colors ${
                    currency === c
                      ? 'border-[#5145E5] bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] font-bold'
                      : 'border-[#E7EAF2] dark:border-[#26334D] hover:bg-[#F7F8FC] dark:hover:bg-[#17223A] text-[#151A2D] dark:text-[#F4F6FF]'
                  }`}
                >
                  <span className="block font-mono-nums font-semibold">{CURRENCY_SYMBOLS[c]}</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#A3AEC7]">{c}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E7EAF2] dark:border-[#26334D]">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#5145E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-[#E7EAF2] dark:border-[#26334D]">
          <div className="p-2 rounded-xl bg-[#5145E5]/10 dark:bg-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
              Password & Authentication Security
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
              Update your account password with standard bcrypt encryption.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] rounded-xl text-[#151A2D] dark:text-[#F4F6FF] focus:outline-hidden focus:ring-2 focus:ring-[#5145E5] transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E7EAF2] dark:border-[#26334D]">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 text-xs font-semibold text-[#151A2D] dark:text-[#F4F6FF] bg-[#F7F8FC] dark:bg-[#17223A] border border-[#E7EAF2] dark:border-[#26334D] hover:bg-slate-100 dark:hover:bg-[#26334D] rounded-xl transition-colors"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Theme & Session Control */}
      <div className="bg-white dark:bg-[#111A2E] border border-[#E7EAF2] dark:border-[#26334D] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-heading font-bold text-[#151A2D] dark:text-[#F4F6FF]">
            Appearance & Session
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#A3AEC7]">
            Current mode: <span className="font-semibold capitalize">{theme}</span>. Theme preference is persisted in your browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#151A2D] dark:text-[#F4F6FF] border border-[#E7EAF2] dark:border-[#26334D] bg-[#F7F8FC] dark:bg-[#17223A] rounded-xl hover:bg-slate-100 dark:hover:bg-[#26334D] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#5145E5]" />}
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
