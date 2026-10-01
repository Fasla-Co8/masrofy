import React, { useState } from 'react';
import { Transaction } from '../../types/index.ts';
import { fetchApi } from '../../lib/api.ts';
import { X, Tag, FileText, Trash2, EyeOff, Eye, Save } from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../../services/categorization.ts';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onUpdated,
}) => {
  if (!isOpen || !transaction) return null;

  const [category, setCategory] = useState(transaction.category);
  const [note, setNote] = useState(transaction.note || '');
  const [tags, setTags] = useState(transaction.tags || '');
  const [isExcluded, setIsExcluded] = useState(transaction.isExcludedFromAnalytics || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchApi(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          category,
          note,
          tags,
          isExcludedFromAnalytics: isExcluded,
        }),
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this transaction?')) return;
    setLoading(true);
    try {
      await fetchApi(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const isIncome = transaction.transactionType === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-800 dark:text-slate-200">
            {transaction.merchantName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{transaction.merchantName}</h2>
            <p className="text-xs text-slate-500">{transaction.description}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Amount & Status Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-500">Amount</p>
            <p className={`text-2xl font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
              {isIncome ? '+' : '-'}{transaction.currency} {Number(transaction.amount).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                transaction.pending
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {transaction.pending ? 'Pending' : 'Completed'}
            </span>
            <p className="text-xs text-slate-400 mt-1">{transaction.date}</p>
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-6 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
          <div>
            <span className="text-slate-400">Account:</span>{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {transaction.accountName || 'Cash Account'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Source:</span>{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {transaction.source === 'plaid' ? 'Open Banking' : transaction.source}
            </span>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              Personal Note
            </label>
            <input
              type="text"
              placeholder="Add details, receipt reference, or reason..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <input
              type="text"
              placeholder="#personal, #work, #vacation"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isExcluded}
                onChange={(e) => setIsExcluded(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Hide this transaction from analytics and budget spending totals</span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
