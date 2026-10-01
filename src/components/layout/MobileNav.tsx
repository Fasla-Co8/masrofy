import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  TrendingUp,
  User,
  Plus,
} from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAddExpense: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  setActiveView,
  onOpenAddExpense,
}) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budget', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around safe-bottom shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Add Expense for mobile */}
      <button
        onClick={onOpenAddExpense}
        className="fixed bottom-16 right-4 z-40 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
