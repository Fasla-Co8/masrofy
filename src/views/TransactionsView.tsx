import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Transaction, BankAccount } from '../types/index.ts';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Tag,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../services/categorization.ts';

interface TransactionsViewProps {
  onOpenAddExpense: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  currency: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddExpense,
  onSelectTransaction,
  currency,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [accountId, setAccountId] = useState<string>('all');
  const [txType, setTxType] = useState('all');
  const [pendingFilter, setPendingFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (category !== 'all') queryParams.set('category', category);
      if (accountId !== 'all') queryParams.set('accountId', accountId);
      if (txType !== 'all') queryParams.set('transactionType', txType);
      if (pendingFilter !== 'all') queryParams.set('pending', pendingFilter);
      queryParams.set('sortBy', sortBy);
      queryParams.set('sortOrder', sortOrder);

      const list = await fetchApi<Transaction[]>(`/api/transactions?${queryParams.toString()}`);
      setTransactions(list);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi<{ accounts: BankAccount[] }>('/api/accounts')
      .then((res) => setAccounts(res.accounts || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category, accountId, txType, pendingFilter, sortBy, sortOrder]);

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Merchant', 'Description', 'Category', 'Type', 'Amount', 'Currency', 'Account', 'Status'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.merchantName.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.transactionType,
      t.amount,
      t.currency,
      `"${(t.accountName || 'Cash').replace(/"/g, '""')}"`,
      t.pending ? 'Pending' : 'Completed',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `masrof_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currSymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'SAR' ? 'SAR ' : '$';

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, categorize, and inspect your financial records
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center space-x-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by merchant, description, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Sort Toggle */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => {
                if (sortBy === 'date') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              className={`flex-1 md:flex-none flex items-center justify-center space-x-1 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                sortBy === 'date'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
            </button>

            <button
              onClick={() => {
                if (sortBy === 'amount') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('amount');
                  setSortOrder('desc');
                }
              }}
              className={`flex-1 md:flex-none flex items-center justify-center space-x-1 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                sortBy === 'amount'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORY_DEFINITIONS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Account */}
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={String(acc.id)}>
                {acc.name} (•••• {acc.mask})
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={txType}
            onChange={(e) => setTxType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Status */}
          <select
            value={pendingFilter}
            onChange={(e) => setPendingFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="false">Completed Only</option>
            <option value="true">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-600" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No transactions yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Connect your bank account or add your first expense to start tracking your spending.
            </p>
            <button
              onClick={onOpenAddExpense}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isIncome = tx.transactionType === 'income';
              const catDef = CATEGORY_DEFINITIONS[tx.category] || CATEGORY_DEFINITIONS['Other'];
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-850 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: catDef.color }}
                    >
                      {tx.merchantName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {tx.merchantName}
                        </p>
                        {tx.isExcludedFromAnalytics && (
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            Hidden from stats
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        {tx.accountName && (
                          <>
                            <span>•</span>
                            <span className="hidden sm:inline">{tx.accountName}</span>
                          </>
                        )}
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 italic max-w-[120px] truncate">"{tx.note}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{currSymbol}{Number(tx.amount).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                        tx.pending
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tx.pending ? 'Pending' : 'Completed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
