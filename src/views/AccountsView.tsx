import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { BankAccount, FinancialConnection } from '../types/index.ts';
import {
  Landmark,
  RefreshCw,
  Plus,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Shield,
  CreditCard,
  Lock,
} from 'lucide-react';

interface AccountsViewProps {
  onOpenBankConnect: () => void;
  currency: string;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onOpenBankConnect, currency }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [connections, setConnections] = useState<FinancialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Manual account modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState('checking');
  const [manualBalance, setManualBalance] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ accounts: BankAccount[]; connections: FinancialConnection[] }>('/api/accounts');
      setAccounts(res.accounts || []);
      setConnections(res.connections || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await fetchApi('/api/bank/sync', { method: 'POST' });
      await loadData();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (id: number) => {
    if (!confirm('Disconnect this bank account? Synced transactions will be preserved.')) return;
    try {
      await fetchApi(`/api/bank/connections/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualBalance) return;
    try {
      await fetchApi('/api/accounts/manual', {
        method: 'POST',
        body: JSON.stringify({
          name: manualName,
          type: manualType,
          balance: parseFloat(manualBalance),
          currency,
        }),
      });
      setShowManualModal(false);
      setManualName('');
      setManualBalance('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const currSymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'SAR' ? 'SAR ' : '$';

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Connected Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your synchronized banking institutions and manual wallets
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center space-x-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Refresh All'}</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual Cash</span>
          </button>

          <button
            onClick={onOpenBankConnect}
            className="flex items-center space-x-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 transition cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Connect Bank</span>
          </button>
        </div>
      </div>

      {/* Connected Financial Institutions Section */}
      {connections.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Financial Institutions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                        {conn.institutionName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{conn.institutionName}</h4>
                        <p className="text-[11px] text-slate-400 capitalize">{conn.provider} Open Banking</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                      Connected
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    Last synchronized:{' '}
                    {conn.lastSyncedAt
                      ? new Date(conn.lastSyncedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handleSyncAll}
                    disabled={syncing}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    Sync Transactions
                  </button>

                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Cards Section (Section 14) */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Accounts & Balances
        </h3>

        {accounts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-600" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No connected accounts</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              Connect your bank via Open Banking or add a manual cash pot to start tracking balances.
            </p>
            <button
              onClick={onOpenBankConnect}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Connect Bank Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-850 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{acc.name}</h4>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                        {acc.type} •••• {acc.mask}
                      </p>
                    </div>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-400">Current Balance</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {currSymbol}{Number(acc.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Status: Active</span>
                  <span>Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleDateString() : 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-start space-x-3">
        <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <p>
          <strong>Security Guarantee:</strong> Masrof connects through licensed Open Banking aggregators. Masrof never stores your bank login credentials, passwords, or full card numbers. All connections are strictly read-only and encrypted with AES-256.
        </p>
      </div>

      {/* Manual Account Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Add Manual Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a physical cash wallet, foreign currency envelope, or offline account.
            </p>

            <form onSubmit={handleCreateManual} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical Cash Wallet, Safe Box"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Account Type</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="cash">Cash</option>
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Starting Balance</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={manualBalance}
                  onChange={(e) => setManualBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
