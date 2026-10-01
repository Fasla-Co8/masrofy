import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { fetchApi } from '../lib/api.ts';
import {
  User,
  Shield,
  Bell,
  Landmark,
  Lock,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenBankConnect: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenBankConnect }) => {
  const { user, preferences, refreshUserData, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currency, setCurrency] = useState(preferences?.currency || 'GBP');
  const [dateFormat, setDateFormat] = useState(preferences?.dateFormat || 'DD/MM/YYYY');
  const [theme, setTheme] = useState(preferences?.theme || 'system');
  const [monthlyIncome, setMonthlyIncome] = useState(preferences?.monthlyIncome || '4500');

  // Notifications
  const [budgetAlerts, setBudgetAlerts] = useState(preferences?.budgetAlerts ?? true);
  const [monthlyReports, setMonthlyReports] = useState(preferences?.monthlyReports ?? true);
  const [transactionAlerts, setTransactionAlerts] = useState(preferences?.transactionAlerts ?? true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/api/user/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          currency,
          dateFormat,
          theme,
          monthlyIncome,
          budgetAlerts,
          monthlyReports,
          transactionAlerts,
        }),
      });
      await refreshUserData();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely certain? This will delete all your data, transactions, and budgets permanently.')) {
      return;
    }
    try {
      // Clear and sign out
      await signOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings & Preferences</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize currency, regional format, security parameters, and notification alerts
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Your preferences have been saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4 text-emerald-600 dark:text-emerald-400">
            <User className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Profile Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4 text-blue-600 dark:text-blue-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Preferences & Currency</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="GBP">British Pound (£ GBP)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="SAR">Saudi Riyal (SAR)</option>
                <option value="AED">UAE Dirham (AED)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Income Benchmark</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notifications Toggles */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4 text-purple-600 dark:text-purple-400">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Alerts & Notifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Budget Limit Warnings</p>
                <p className="text-slate-400 text-[11px]">Notify me when spending in any category reaches 80% or exceeds budget</p>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Monthly Financial Reports</p>
                <p className="text-slate-400 text-[11px]">Receive monthly executive summaries and savings rate metrics</p>
              </div>
              <input
                type="checkbox"
                checked={monthlyReports}
                onChange={(e) => setMonthlyReports(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Bank Sync Confirmations</p>
                <p className="text-slate-400 text-[11px]">Alert me whenever new card transactions are synchronized</p>
              </div>
              <input
                type="checkbox"
                checked={transactionAlerts}
                onChange={(e) => setTransactionAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Privacy Disclosure */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>How Masrof Protects Your Privacy</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Masrof utilizes read-only Open Banking connections governed by regulatory standards. We do not sell or monetize personal financial data. Transactions are categorized strictly to deliver your personal budget insights and reports.
          </p>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
        <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">Danger Zone</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Permanently delete your Masrof account, unlinking all bank connections and erasing all stored transactions.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="mt-4 flex items-center space-x-1.5 py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account Permanently</span>
        </button>
      </div>
    </div>
  );
};
