export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  isDemo?: boolean;
}

export interface UserPreferences {
  currency: string;
  language: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  monthlyIncome: string;
  payFrequency: string;
  primaryGoal: string;
  onboardingCompleted: boolean;
  emailNotifications: boolean;
  budgetAlerts: boolean;
  monthlyReports: boolean;
  transactionAlerts: boolean;
}

export interface BankAccount {
  id: number;
  connectionId: number | null;
  name: string;
  officialName: string | null;
  type: string;
  mask: string;
  currentBalance: string;
  availableBalance: string | null;
  currency: string;
  status: string;
  lastSyncedAt: string | null;
}

export interface FinancialConnection {
  id: number;
  institutionId: string;
  institutionName: string;
  provider: string;
  status: string;
  lastSyncedAt: string | null;
}

export interface Transaction {
  id: number;
  userId: string;
  accountId: number | null;
  accountName?: string;
  providerTransactionId: string | null;
  merchantName: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
  category: string;
  subcategory: string | null;
  transactionType: 'expense' | 'income' | 'transfer';
  pending: boolean;
  source: string;
  note: string | null;
  tags: string | null;
  isExcludedFromAnalytics: boolean;
  createdAt: string;
}

export interface BudgetOverview {
  budgetId: number;
  month: string;
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  remainingBudget: number;
  categories: {
    id: number;
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    isWarning: boolean;
    isOverBudget: boolean;
  }[];
}

export interface Goal {
  id: number;
  title: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string | null;
  category: string;
  color: string;
  icon: string;
  isCompleted: boolean;
}

export interface DashboardMetrics {
  totalBalance: number;
  balanceChangePct: number;
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  netSavings: number;
  monthlyBudget: number;
  spendingChangePct: number;
  currency: string;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
