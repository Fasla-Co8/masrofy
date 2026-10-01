import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  ShoppingBag,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CATEGORY_DEFINITIONS } from '../services/categorization.ts';

interface AnalyticsViewProps {
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currency }) => {
  const [timelineData, setTimelineData] = useState<{ date: string; expenses: number; income: number }[]>([]);
  const [categories, setCategories] = useState<{ name: string; value: number; percentage: number; color: string }[]>([]);
  const [largest, setLargest] = useState<{ id: number; merchantName: string; amount: string; date: string; category: string }[]>([]);
  const [recurring, setRecurring] = useState<{ id: number; merchantName: string; estimatedAmount: string; frequency: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/api/analytics/timeline?timeframe=30d'),
      fetchApi('/api/analytics/categories'),
      fetchApi('/api/analytics/largest'),
      fetchApi('/api/analytics/recurring'),
    ])
      .then(([t, c, l, r]) => {
        setTimelineData(t);
        setCategories(c);
        setLargest(l);
        setRecurring(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currSymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'SAR' ? 'SAR ' : '$';

  const totalMonthlyBurn = recurring.reduce((sum, r) => sum + Number(r.estimatedAmount), 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Analytics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Deep behavioral insights, recurring subscription detection, and category trends
        </p>
      </div>

      {/* Factual Spending Habits Cards (Section 12) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Top Spending Envelope</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {categories[0] ? `${categories[0].name}: ${currSymbol}${categories[0].value.toFixed(2)}` : 'No expenses'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {categories[0] ? `Represents ${categories[0].percentage}% of total monthly outgoing cash` : 'Track more transactions'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
            <Repeat className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Recurring Commitments</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {currSymbol}{totalMonthlyBurn.toFixed(2)} / month
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Across {recurring.length} detected active subscriptions & utilities
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Largest Purchase</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {largest[0] ? `${largest[0].merchantName} (${currSymbol}${Number(largest[0].amount).toFixed(2)})` : 'None'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {largest[0] ? `Recorded on ${largest[0].date}` : 'No large single transactions'}
          </p>
        </div>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Income vs Expenses Activity</h3>
        <p className="text-xs text-slate-400 mb-6">Daily cash inflow versus outgoing transactions</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(val) => val.slice(5)}
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
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two columns: Detected Subscriptions & Largest Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Payments Tracker */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Detected Subscriptions</h3>
              <p className="text-xs text-slate-400">Regular recurring bills & memberships</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
              {recurring.length} Active
            </span>
          </div>

          {recurring.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recurring payments identified yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recurring.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {rec.merchantName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{rec.merchantName}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{rec.frequency} • {rec.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {currSymbol}{Number(rec.estimatedAmount).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Largest Purchases */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Largest Outgoing Purchases</h3>
              <p className="text-xs text-slate-400">Single highest value transactions</p>
            </div>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>

          {largest.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No purchases recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {largest.map((item, index) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-400 w-4">#{index + 1}</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{item.merchantName}</p>
                      <p className="text-[10px] text-slate-400">{item.category} • {item.date}</p>
                    </div>
                  </div>
                  <p className="font-bold text-rose-600 text-xs">
                    -{currSymbol}{Number(item.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
