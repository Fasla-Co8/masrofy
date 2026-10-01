import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  Award,
  CreditCard,
} from 'lucide-react';

interface MonthlyReportViewProps {
  currency: string;
}

interface MonthlyReportData {
  month: string;
  income: number;
  expenses: number;
  saved: number;
  topCategory: string;
  topCategoryAmount: number;
  largestTransaction: { merchantName: string; amount: string; date: string } | null;
  spendingChangePct: number;
  categories: { name: string; value: number; percentage: number; color: string }[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ currency }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi<MonthlyReportData>(`/api/reports/monthly?month=${selectedMonth}`)
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['Metric', 'Value'],
      ['Month', report.month],
      ['Total Income', report.income.toFixed(2)],
      ['Total Expenses', report.expenses.toFixed(2)],
      ['Net Saved', report.saved.toFixed(2)],
      ['Top Category', `${report.topCategory} (${report.topCategoryAmount.toFixed(2)})`],
      ['Month-over-Month Change', `${report.spendingChangePct}%`],
      [],
      ['Category Breakdown', 'Amount', 'Percentage'],
      ...report.categories.map((c) => [c.name, c.value.toFixed(2), `${c.percentage}%`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `masrof_report_${report.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currSymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'SAR' ? 'SAR ' : '$';

  const monthName = new Date(`${selectedMonth}-01`).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-5xl mx-auto print:p-0 print:m-0">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Monthly Financial Report</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Executive financial digest, savings rate, and category allocation
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          />

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-center justify-between pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl">
              M
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Masrof Financial Report</h1>
              <p className="text-xs text-slate-400">Statement of Personal Spending & Savings</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-bold text-slate-900 dark:text-white">{monthName}</p>
            <p className="text-xs text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* High-level Summary Numbers (Section 16) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Total Income</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {currSymbol}{(report?.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {currSymbol}{(report?.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {report?.spendingChangePct !== undefined && report.spendingChangePct !== 0
                ? `${report.spendingChangePct < 0 ? 'Decreased' : 'Increased'} by ${Math.abs(report.spendingChangePct)}% vs prior month`
                : 'Steady pace'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Net Money Saved</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currSymbol}{(report?.saved || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Savings rate:{' '}
              {report && report.income > 0 ? Math.round((report.saved / report.income) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Spending Category</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {report?.topCategory || 'None'} ({currSymbol}{(report?.topCategoryAmount || 0).toFixed(2)})
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Largest Single Transaction</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {report?.largestTransaction
                ? `${report.largestTransaction.merchantName} (${currSymbol}${Number(report.largestTransaction.amount).toFixed(2)})`
                : 'None'}
            </p>
          </div>
        </div>

        {/* Category breakdown table */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Category Breakdown</h3>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">% of Spending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report?.categories.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-850">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {currSymbol}{c.value.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-slate-500 font-semibold">{c.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Masrof Personal Finance • Confidential</span>
          <span>masrof.app</span>
        </div>
      </div>
    </div>
  );
};
