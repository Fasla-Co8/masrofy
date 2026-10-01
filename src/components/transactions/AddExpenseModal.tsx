import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api.ts';
import { BankAccount } from '../../types/index.ts';
import { X, Plus, Calendar, Tag, CreditCard, FileText, Check } from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../../services/categorization.ts';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetchApi<{ accounts: BankAccount[] }>('/api/accounts')
        .then((res) => {
          setAccounts(res.accounts || []);
          if (res.accounts && res.accounts.length > 0) {
            setAccountId(res.accounts[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || !amount) {
      setError('Please provide both merchant and amount.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fetchApi('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          merchantName,
          amount: parseFloat(amount),
          date,
          category,
          transactionType: type,
          accountId,
          note,
          tags,
        }),
      });

      // Reset
      setMerchantName('');
      setAmount('');
      setNote('');
      setTags('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {type === 'expense' ? 'Record New Expense' : 'Record Income'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Manually enter an expense or deposit. It will immediately update your dashboard and remaining budget.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-600 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Income (+)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Merchant / Payee
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tesco Express, Uber"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">
                  {type === 'expense' ? '-' : '+'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.keys(CATEGORY_DEFINITIONS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account
            </label>
            <select
              value={accountId || ''}
              onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">No specific account (Cash / General)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (•••• {acc.mask}) - {acc.currency} {Number(acc.currentBalance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch with team"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. #work, #groceries"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </form>
      </div>
    </div>
  );
};
