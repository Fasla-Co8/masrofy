/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { OnboardingModal } from './components/onboarding/OnboardingModal.tsx';
import { BankConnectModal } from './components/banking/BankConnectModal.tsx';
import { AddExpenseModal } from './components/transactions/AddExpenseModal.tsx';
import { TransactionDetailsModal } from './components/transactions/TransactionDetailsModal.tsx';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer.tsx';
import { NotificationDrawer } from './components/notifications/NotificationDrawer.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { TransactionsView } from './views/TransactionsView.tsx';
import { BudgetPlannerView } from './views/BudgetPlannerView.tsx';
import { AnalyticsView } from './views/AnalyticsView.tsx';
import { AccountsView } from './views/AccountsView.tsx';
import { MonthlyReportView } from './views/MonthlyReportView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { Transaction, NotificationItem } from './types/index.ts';
import { fetchApi } from './lib/api.ts';
import { Loader2 } from 'lucide-react';

function MasrofApp() {
  const { user, preferences, isLoading, signInWithDemo, refreshUserData } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [bankConnectOpen, setBankConnectOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user notifications periodically or on change
  const loadNotifications = () => {
    if (!user) return;
    fetchApi<NotificationItem[]>('/api/notifications')
      .then(setNotifications)
      .catch(console.error);
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, refreshTrigger]);

  const triggerGlobalRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
          M
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span>Loading Masrof...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show modern landing page
  if (!user) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthMode('register');
            setAuthModalOpen(true);
          }}
          onExploreDemo={async () => {
            await signInWithDemo();
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authMode}
        />
      </>
    );
  }

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const currentCurrency = preferences?.currency || 'GBP';
  const showOnboarding = preferences && !preferences.onboardingCompleted;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAddExpense={() => setAddExpenseOpen(true)}
        onOpenBankConnect={() => setBankConnectOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenAiAssistant={() => setAiAssistantOpen(true)}
          unreadNotificationsCount={unreadNotifsCount}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              key={`dash-${refreshTrigger}`}
              currency={currentCurrency}
              onOpenAddExpense={() => setAddExpenseOpen(true)}
              onOpenBankConnect={() => setBankConnectOpen(true)}
              onOpenAiAssistant={() => setAiAssistantOpen(true)}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
            />
          )}

          {activeView === 'transactions' && (
            <TransactionsView
              key={`tx-${refreshTrigger}`}
              currency={currentCurrency}
              onOpenAddExpense={() => setAddExpenseOpen(true)}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
            />
          )}

          {activeView === 'budgets' && (
            <BudgetPlannerView key={`b-${refreshTrigger}`} currency={currentCurrency} />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView key={`a-${refreshTrigger}`} currency={currentCurrency} />
          )}

          {activeView === 'accounts' && (
            <AccountsView
              key={`acc-${refreshTrigger}`}
              currency={currentCurrency}
              onOpenBankConnect={() => setBankConnectOpen(true)}
            />
          )}

          {activeView === 'reports' && (
            <MonthlyReportView key={`r-${refreshTrigger}`} currency={currentCurrency} />
          )}

          {activeView === 'settings' && (
            <SettingsView onOpenBankConnect={() => setBankConnectOpen(true)} />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAddExpense={() => setAddExpenseOpen(true)}
        />
      </div>

      {/* Modals & Drawers */}
      <OnboardingModal
        isOpen={Boolean(showOnboarding)}
        onComplete={() => refreshUserData()}
      />

      <BankConnectModal
        isOpen={bankConnectOpen}
        onClose={() => setBankConnectOpen(false)}
        onSuccess={() => {
          triggerGlobalRefresh();
          loadNotifications();
        }}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onSuccess={() => triggerGlobalRefresh()}
      />

      <TransactionDetailsModal
        transaction={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        onUpdated={() => triggerGlobalRefresh()}
      />

      <AiAssistantDrawer
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={() => loadNotifications()}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MasrofApp />
    </AuthProvider>
  );
}
