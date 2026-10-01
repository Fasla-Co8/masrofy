import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  TrendingUp,
  Landmark,
  FileText,
  Settings,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAddExpense: () => void;
  onOpenBankConnect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenAddExpense,
  onOpenBankConnect,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budget Planner', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'reports', label: 'Monthly Report', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 h-screen flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg leading-tight">
              Masrof
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Know where your money goes</p>
          </div>
        </div>
      </div>

      {/* Add Expense Quick CTA */}
      <div className="p-4 pb-2">
        <button
          onClick={onOpenAddExpense}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Banking Card */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] font-bold">Open Banking</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2.5">
            Connect your bank to automatically synchronize card transactions.
          </p>
          <button
            onClick={onOpenBankConnect}
            className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold transition cursor-pointer"
          >
            Connect Bank Account
          </button>
        </div>
      </div>
    </aside>
  );
};
