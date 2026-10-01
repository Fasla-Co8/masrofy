import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table (keyed on Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Preferences & Profile
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }).unique(),
  currency: text('currency').notNull().default('GBP'),
  language: text('language').notNull().default('en'),
  dateFormat: text('date_format').notNull().default('DD/MM/YYYY'),
  theme: text('theme').notNull().default('system'),
  monthlyIncome: numeric('monthly_income', { precision: 12, scale: 2 }).default('0'),
  payFrequency: text('pay_frequency').default('monthly'),
  primaryGoal: text('primary_goal').default('Save money'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  emailNotifications: boolean('email_notifications').default(true),
  budgetAlerts: boolean('budget_alerts').default(true),
  monthlyReports: boolean('monthly_reports').default(true),
  transactionAlerts: boolean('transaction_alerts').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Financial Connections (Banking Institutions)
export const financialConnections = pgTable(
  'financial_connections',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('plaid'), // 'plaid' | 'truelayer' | 'tink' | 'sandbox'
    institutionId: text('institution_id').notNull(),
    institutionName: text('institution_name').notNull(),
    institutionLogo: text('institution_logo'),
    connectionReference: text('connection_reference').notNull(), // Secure token/item reference
    status: text('status').notNull().default('connected'), // 'connected' | 'disconnected' | 'needs_reauth' | 'expired'
    lastSyncedAt: timestamp('last_synced_at'),
    consentExpiresAt: timestamp('consent_expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('fc_user_id_idx').on(table.userId),
    index('fc_status_idx').on(table.status),
  ]
);

// Accounts (Bank accounts, credit cards, savings)
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    connectionId: integer('connection_id').references(() => financialConnections.id, { onDelete: 'cascade' }),
    providerAccountId: text('provider_account_id'),
    name: text('name').notNull(),
    officialName: text('official_name'),
    type: text('type').notNull().default('checking'), // 'checking' | 'savings' | 'credit' | 'investment' | 'cash'
    mask: text('mask').default('0000'), // Last 4 digits
    currentBalance: numeric('current_balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
    availableBalance: numeric('available_balance', { precision: 12, scale: 2 }),
    currency: text('currency').notNull().default('GBP'),
    status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'error'
    lastSyncedAt: timestamp('last_synced_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('accounts_user_id_idx').on(table.userId),
    index('accounts_connection_id_idx').on(table.connectionId),
  ]
);

// Transactions
export const transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    accountId: integer('account_id').references(() => accounts.id, { onDelete: 'set null' }),
    providerTransactionId: text('provider_transaction_id').unique(),
    merchantName: text('merchant_name').notNull(),
    description: text('description').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), // positive = expense, negative or type=income
    currency: text('currency').notNull().default('GBP'),
    date: text('date').notNull(), // YYYY-MM-DD
    category: text('category').notNull().default('Other'),
    subcategory: text('subcategory'),
    transactionType: text('transaction_type').notNull().default('expense'), // 'expense' | 'income' | 'transfer'
    pending: boolean('pending').notNull().default(false),
    source: text('source').notNull().default('manual'), // 'manual' | 'plaid' | 'truelayer' | 'sandbox'
    note: text('note'),
    tags: text('tags'), // Comma separated or json
    isExcludedFromAnalytics: boolean('is_excluded_from_analytics').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('tx_user_id_idx').on(table.userId),
    index('tx_account_id_idx').on(table.accountId),
    index('tx_date_idx').on(table.date),
    index('tx_category_idx').on(table.category),
    index('tx_created_at_idx').on(table.createdAt),
    index('tx_provider_tx_id_idx').on(table.providerTransactionId),
  ]
);

// Transaction Categories (Built-in + Custom per user)
export const transactionCategories = pgTable(
  'transaction_categories',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }), // Nullable for global defaults
    name: text('name').notNull(),
    icon: text('icon').default('Tag'),
    color: text('color').default('#64748B'),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('tc_user_id_idx').on(table.userId),
  ]
);

// Monthly Budgets
export const budgets = pgTable(
  'budgets',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    month: text('month').notNull(), // YYYY-MM
    totalMonthlyBudget: numeric('total_monthly_budget', { precision: 12, scale: 2 }).notNull().default('0.00'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('budgets_user_id_idx').on(table.userId),
    index('budgets_month_idx').on(table.month),
  ]
);

// Budget Category Allocations
export const budgetCategories = pgTable(
  'budget_categories',
  {
    id: serial('id').primaryKey(),
    budgetId: integer('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    allocatedAmount: numeric('allocated_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
    alertThresholdPercent: integer('alert_threshold_percent').default(80),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('bc_budget_id_idx').on(table.budgetId),
    index('bc_user_id_idx').on(table.userId),
    index('bc_category_idx').on(table.category),
  ]
);

// Financial Goals
export const goals = pgTable(
  'goals',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
    currentAmount: numeric('current_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
    targetDate: text('target_date'), // YYYY-MM-DD
    category: text('category').default('Savings'),
    icon: text('icon').default('Target'),
    color: text('color').default('#10B981'),
    isCompleted: boolean('is_completed').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('goals_user_id_idx').on(table.userId),
  ]
);

// Recurring Transactions / Subscriptions
export const recurringTransactions = pgTable(
  'recurring_transactions',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    merchantName: text('merchant_name').notNull(),
    estimatedAmount: numeric('estimated_amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('GBP'),
    frequency: text('frequency').notNull().default('monthly'), // 'weekly' | 'monthly' | 'yearly'
    category: text('category').notNull().default('Subscriptions'),
    lastDate: text('last_date'),
    nextExpectedDate: text('next_expected_date'),
    status: text('status').notNull().default('active'), // 'active' | 'cancelled' | 'paused'
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('recurring_user_id_idx').on(table.userId),
  ]
);

// Notifications
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    type: text('type').notNull().default('info'), // 'budget_warning' | 'budget_exceeded' | 'sync_success' | 'connection_alert' | 'monthly_report'
    title: text('title').notNull(),
    message: text('message').notNull(),
    read: boolean('read').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_read_idx').on(table.read),
  ]
);

// Monthly Summaries & Reports
export const monthlyReports = pgTable(
  'monthly_reports',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    month: text('month').notNull(), // YYYY-MM
    totalIncome: numeric('total_income', { precision: 12, scale: 2 }).notNull().default('0.00'),
    totalExpenses: numeric('total_expenses', { precision: 12, scale: 2 }).notNull().default('0.00'),
    netSavings: numeric('net_savings', { precision: 12, scale: 2 }).notNull().default('0.00'),
    topCategory: text('top_category'),
    largestTransactionMerchant: text('largest_transaction_merchant'),
    largestTransactionAmount: numeric('largest_transaction_amount', { precision: 12, scale: 2 }).default('0.00'),
    comparisonPrevMonthPct: numeric('comparison_prev_month_pct', { precision: 6, scale: 2 }).default('0.00'),
    dataJson: text('data_json'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('mr_user_id_idx').on(table.userId),
    index('mr_month_idx').on(table.month),
  ]
);

// Security & Audit Logs
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    details: text('details'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('al_user_id_idx').on(table.userId),
    index('al_created_at_idx').on(table.createdAt),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  preferences: one(userPreferences, {
    fields: [users.uid],
    references: [userPreferences.userId],
  }),
  connections: many(financialConnections),
  accounts: many(accounts),
  transactions: many(transactions),
  budgets: many(budgets),
  goals: many(goals),
  recurring: many(recurringTransactions),
  notifications: many(notifications),
  monthlyReports: many(monthlyReports),
  auditLogs: many(auditLogs),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.uid],
  }),
  connection: one(financialConnections, {
    fields: [accounts.connectionId],
    references: [financialConnections.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.uid],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.uid],
  }),
  categories: many(budgetCategories),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetCategories.budgetId],
    references: [budgets.id],
  }),
}));
