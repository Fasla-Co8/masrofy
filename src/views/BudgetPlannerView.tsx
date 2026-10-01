import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { BudgetOverview } from '../types/index.ts';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Save,
  Wallet,
  Calculator,
} from 'lucide-react';
import { CATEGORY_DEFINITIONS } from '../services/categorization.ts';

interface BudgetPlannerViewProps {
  currency: string;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({ currency }) => {
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newAllocated, setNewAllocated] = useState('');
  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState('');
  const [loading, setLoading] = useState(true);

  // Budget Planner Projection State
  const [projectedIncome, setProjectedIncome] = useState(4500);
  const [fixedExpenses, setFixedExpenses] = useState(1400); // Rent, bills, insurance
  const [savingsTarget, setSavingsTarget] = useState(1000);
  const [debtPayments, setDebtPayments] = useState(200);

  const loadBudget = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<BudgetOverview>(`/api/budgets/overview?month=${currentMonth}`);
      setBudgetOverview(data);
      setTotalMonthlyBudget(String(data.totalBudget));
    } catch (err) {
      console.error('Failed to load budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [currentMonth]);

  const handleUpdateCategory = async (categoryName: string) => {
    if (!budgetOverview || !newAllocated) return;
    try {
      await fetchApi('/api/budgets/category', {
        method: 'POST',
        body: JSON.stringify({
          budgetId: budgetOverview.budgetId,
          category: categoryName,
          allocatedAmount: parseFloat(newAllocated),
        }),
      });
      setEditingCategory(null);
      setNewAllocated('');
      loadBudget();
    } catch (err) {
      console.error('Failed to update category allocation:', err);
    }
  };

  const handleUpdateTotal = async () => {
    if (!budgetOverview || !totalMonthlyBudget) return;
    try {
      await fetchApi('/api/budgets/total', {
        method: 'POST',
        body: JSON.stringify({
          budgetId: budgetOverview.budgetId,
          totalMonthlyBudget: parseFloat(totalMonthlyBudget),
        }),
      });
      loadBudget();
    } catch (err) {
      console.error('Failed to update total budget:', err);
    }
  };

  const currSymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'SAR' ? 'SAR ' : '$';

  // Calculations for projection: Income - Fixed Expenses - Variable Expenses - Savings = Remaining
  const variableEnvelopesTotal = budgetOverview?.totalAllocated || 1800;
  const projectedRemaining = projectedIncome - fixedExpenses - variableEnvelopesTotal - savingsTarget - debtPayments;

  return (
    <div className="space-y-6 pb-20 lg:pb-12 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Budget Planner</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Plan income allocation, monitor category limits, and prevent overspending
          </p>
        </div>

        {/* Month selector */}
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* High-level budget status card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Monthly Budget</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {currSymbol}{Number(budgetOverview?.totalBudget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Target cap for all spending this month</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400">Actual Spent</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-rose-600">
                {currSymbol}{Number(budgetOverview?.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {budgetOverview && budgetOverview.totalBudget > 0
                ? `${Math.round((budgetOverview.totalSpent / budgetOverview.totalBudget) * 100)}% of total cap used`
                : '0% used'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400">Remaining Cushion</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-2xl sm:text-3xl font-bold ${(budgetOverview?.remainingBudget || 0) < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {currSymbol}{Number(budgetOverview?.remainingBudget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {(budgetOverview?.remainingBudget || 0) >= 0 ? 'Healthy budget margin' : 'Warning: Over budget!'}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        {budgetOverview && budgetOverview.totalBudget > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-500">Overall Month Progress</span>
              <span className="text-slate-900 dark:text-white">
                {Math.round((budgetOverview.totalSpent / budgetOverview.totalBudget) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetOverview.totalSpent > budgetOverview.totalBudget
                    ? 'bg-rose-500'
                    : budgetOverview.totalSpent / budgetOverview.totalBudget >= 0.8
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((budgetOverview.totalSpent / budgetOverview.totalBudget) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Envelopes Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Category Envelopes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetOverview?.categories.map((cat) => {
            const def = CATEGORY_DEFINITIONS[cat.category] || CATEGORY_DEFINITIONS['Other'];
            const isEditing = editingCategory === cat.category;

            return (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: def.color }}
                      >
                        {cat.category.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{cat.category}</span>
                    </div>

                    {cat.isOverBudget ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Over Budget</span>
                      </span>
                    ) : cat.isWarning ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Used 80%+</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>On Track</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between text-xs text-slate-500 mb-1.5">
                    <span>
                      Spent: <strong className="text-slate-900 dark:text-white">{currSymbol}{cat.spent.toFixed(2)}</strong>
                    </span>
                    <span>
                      Budget: <strong className="text-slate-900 dark:text-white">{currSymbol}{cat.allocated.toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        cat.isOverBudget
                          ? 'bg-rose-500'
                          : cat.isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                    />
                  </div>

                  <p className="text-xs">
                    {cat.remaining >= 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {currSymbol}{cat.remaining.toFixed(2)} remaining
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold">
                        Over budget by {currSymbol}{Math.abs(cat.remaining).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder={String(cat.allocated)}
                        value={newAllocated}
                        onChange={(e) => setNewAllocated(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleUpdateCategory(cat.category)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCategory(cat.category);
                        setNewAllocated(String(cat.allocated));
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Adjust Limit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 11: Budget Planning Interactive Calculator */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Forward Cashflow Planning</h3>
            <p className="text-xs text-slate-400">
              Calculate: Income - Fixed Expenses - Category Envelopes - Savings - Debt = Remaining Cash
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Monthly Income</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">{currSymbol}</span>
              <input
                type="number"
                value={projectedIncome}
                onChange={(e) => setProjectedIncome(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fixed Bills & Rent</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">{currSymbol}</span>
              <input
                type="number"
                value={fixedExpenses}
                onChange={(e) => setFixedExpenses(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Savings</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">{currSymbol}</span>
              <input
                type="number"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Debt Payments</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">{currSymbol}</span>
              <input
                type="number"
                value={debtPayments}
                onChange={(e) => setDebtPayments(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Projected Result Callout */}
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-emerald-950 dark:text-emerald-200">
              Projected Remaining Discretionary Money:{' '}
              <span className="text-base text-emerald-700 dark:text-emerald-400">
                {currSymbol}{projectedRemaining.toFixed(2)}
              </span>
            </p>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              After accounting for all fixed overheads, envelope category allocations, and monthly savings.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-semibold self-start sm:self-auto text-[11px]">
            Balanced Plan
          </span>
        </div>
      </div>
    </div>
  );
};
