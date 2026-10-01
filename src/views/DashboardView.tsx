import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import {
  DashboardMetrics,
  Transaction,
  CategoryBreakdown,
} from '../types/index.ts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Landmark,
  Sparkles,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CATEGORY_DEFINITIONS } from '../services/categorization.ts';

interface DashboardViewProps {
  onOpenAddExpense: () => void;
  onOpenBankConnect: () => void;
  onOpenAiAssistant: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  currency: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddExpense,
  onOpenBankConnect,
  onOpenAiAssistant,
  onSelectTransaction,
  currency,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeline, setTimeline] = useState<{ date: string; expenses: number; income: number }[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, t, c, tx] = await Promise.all([
        fetchApi<DashboardMetrics>('/api/analytics/dashboard'),
        fetchApi<{ date: string; expenses: number; income: number }[]>(`/api/analytics/timeline?timeframe=${timeframe}`),
        fetchApi<CategoryBreakdown[]>('/api/analytics/categories'),
        fetchApi<Transaction[]>('/api/transactions?limit=8'),
      ]);
      setMetrics(m);
      setTimeline(t);
      setCategories(c);
      setRecentTransactions(tx);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const handleSyncBank = async () => {
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

  const currSymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'SAR' ? 'SAR ' : '$';

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-7xl mx-auto">
      {/* Top Banner: Total Balance & Actions */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Balance</span>
          <div className="flex items-baseline space-x-3 mt-1.5">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {currSymbol}
              {(metrics?.totalBalance || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{metrics?.balanceChangePct || 4.8}% this month</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Calculated from your active connected accounts</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncBank}
            disabled={syncing}
            className="flex items-center space-x-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Bank'}</span>
          </button>

          <button
            onClick={onOpenBankConnect}
            className="flex items-center space-x-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connect Bank</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="flex items-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {currSymbol}{(metrics?.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct deposits & salary</p>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {currSymbol}{(metrics?.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics?.spendingChangePct !== undefined && metrics.spendingChangePct !== 0
              ? `${metrics.spendingChangePct > 0 ? '+' : ''}${metrics.spendingChangePct}% vs last month`
              : 'This calendar month'}
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Remaining Budget</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-bold mt-3 ${(metrics?.remainingBudget || 0) < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {currSymbol}{(metrics?.remainingBudget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Of {currSymbol}{(metrics?.monthlyBudget || 0).toLocaleString()} planned limit
          </p>
        </div>

        {/* Net Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Net Savings</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {currSymbol}{(metrics?.netSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Income minus monthly expenses</p>
        </div>
      </div>

      {/* Charts Section: Spending Timeline & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Overview Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Spending Overview</h3>
              <p className="text-xs text-slate-400">Cashflow & expense activity over time</p>
            </div>

            {/* Timeframe filter */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              {(['7d', '30d', '3m', '6m', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg transition ${
                    timeframe === tf
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return `${parts[1]}/${parts[2] || ''}`;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={(val) => `${currSymbol}${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: '1px solid #1E293B',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${currSymbol}${Number(val).toFixed(2)}`, 'Expenses']}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Donut Chart (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Spending by Category</h3>
            <p className="text-xs text-slate-400">Current month distribution</p>
          </div>

          <div className="h-56 my-2">
            {categories.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorized spending this month yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      border: '1px solid #1E293B',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${currSymbol}${Number(val).toFixed(2)}`, 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 3 category chips */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categories.slice(0, 3).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">{c.percentage}%</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currSymbol}{c.value.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Card purchases, direct debits, and manual entries</p>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            + Add Expense
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No transactions yet.</p>
            <p className="mt-1">Connect your bank account or record your first manual expense to start tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const isIncome = tx.transactionType === 'income';
              const catDef = CATEGORY_DEFINITIONS[tx.category] || CATEGORY_DEFINITIONS['Other'];
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 sm:py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: catDef.color }}
                    >
                      {tx.merchantName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {tx.merchantName}
                      </p>
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
