import express, { Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { getUserPreferences } from '../db/users.ts';
import { db } from '../db/index.ts';
import { users, userPreferences, auditLogs, financialConnections } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { bankingManager } from '../services/banking/providerManager.ts';
import {
  getUserAccounts,
  getUserConnections,
  createFinancialConnection,
  saveAccount,
  deleteConnection,
} from '../db/accounts.ts';
import {
  getUserTransactions,
  createManualExpense,
  upsertSyncedTransactions,
  updateTransactionDetails,
  deleteTransaction,
} from '../db/transactions.ts';
import {
  getBudgetOverview,
  updateBudgetCategory,
  setTotalBudget,
} from '../db/budgets.ts';
import {
  getUserGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
} from '../db/goals.ts';
import {
  getDashboardMetrics,
  getSpendingTimeline,
  getCategorySpendingBreakdown,
  getLargestPurchases,
  getRecurringList,
} from '../db/analytics.ts';
import {
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
} from '../db/notifications.ts';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = express.Router();

apiRouter.use(express.json());

// 1. Health check
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. User info & Preferences
apiRouter.get('/user/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const userRec = (await db.select().from(users).where(eq(users.uid, uid)))[0];
    const prefs = await getUserPreferences(uid);
    res.json({
      user: {
        uid,
        email: req.user!.email,
        displayName: userRec?.displayName || req.user!.displayName,
        photoUrl: userRec?.photoUrl || req.user!.photoUrl,
        isDemo: Boolean(req.user!.isDemo),
      },
      preferences: prefs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/user/onboarding', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { displayName, currency, monthlyIncome, payFrequency, primaryGoal } = req.body;

    if (displayName) {
      await db
        .update(users)
        .set({ displayName, updatedAt: new Date() })
        .where(eq(users.uid, uid));
    }

    await db
      .update(userPreferences)
      .set({
        currency: currency || 'GBP',
        monthlyIncome: monthlyIncome ? String(monthlyIncome) : '4500.00',
        payFrequency: payFrequency || 'monthly',
        primaryGoal: primaryGoal || 'Save money',
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, uid));

    await createNotification(
      uid,
      'system',
      'Welcome to Masrof!',
      'Your financial profile and monthly goals are successfully set up.'
    );

    res.json({ success: true, message: 'Onboarding completed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/user/preferences', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const updates = req.body;
    await db
      .update(userPreferences)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, uid));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Bank Provider & Connection
apiRouter.get('/bank/status', requireAuth, (_req, res) => {
  res.json(bankingManager.getStatus());
});

apiRouter.get('/bank/institutions', requireAuth, async (_req, res) => {
  try {
    const provider = bankingManager.getProvider();
    const institutions = await provider.getInstitutions();
    res.json(institutions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bank/link-token', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const provider = bankingManager.getProvider();
    const result = await provider.createLinkToken(req.user!.uid);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bank/connect', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { publicToken, institutionId } = req.body;
    const provider = bankingManager.getProvider();

    // 1. Exchange public token for secure provider access token
    const tokenResult = await provider.exchangePublicToken(publicToken, institutionId);

    // 2. Securely store connection with encrypted token
    const conn = await createFinancialConnection({
      userId: uid,
      provider: provider.providerName,
      institutionId: tokenResult.institutionId,
      institutionName: tokenResult.institutionName,
      accessToken: tokenResult.accessToken,
    });

    // 3. Retrieve available bank accounts
    const providerAccounts = await provider.getAccounts(tokenResult.accessToken);
    const savedAccounts = [];

    for (const acc of providerAccounts) {
      const saved = await saveAccount({
        userId: uid,
        connectionId: conn.id,
        providerAccountId: acc.providerAccountId,
        name: acc.name,
        officialName: acc.officialName,
        type: acc.type,
        mask: acc.mask,
        currentBalance: acc.currentBalance,
        availableBalance: acc.availableBalance,
        currency: acc.currency,
      });
      savedAccounts.push(saved);
    }

    // 4. Initial transaction sync
    const syncRes = await provider.syncTransactions(tokenResult.accessToken);
    const primaryAccountId = savedAccounts[0]?.id || null;
    await upsertSyncedTransactions(uid, primaryAccountId, syncRes.added);

    // 5. Audit Log & Notification
    await db.insert(auditLogs).values({
      userId: uid,
      action: 'BANK_CONNECTED',
      details: `Connected ${tokenResult.institutionName} with ${savedAccounts.length} account(s)`,
    });

    await createNotification(
      uid,
      'sync_success',
      'Bank Account Connected',
      `Your ${tokenResult.institutionName} account was successfully connected and ${syncRes.added.length} transactions imported.`
    );

    res.json({
      success: true,
      connection: {
        id: conn.id,
        institutionName: conn.institutionName,
        accountsCount: savedAccounts.length,
        transactionsImported: syncRes.added.length,
      },
    });
  } catch (err: any) {
    console.error('Bank connection error:', err);
    res.status(500).json({ error: err.message || 'We could not connect to your bank. Please try again.' });
  }
});

apiRouter.post('/bank/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const provider = bankingManager.getProvider();
    const connections = await db
      .select()
      .from(financialConnections)
      .where(and(eq(financialConnections.userId, uid), eq(financialConnections.status, 'connected')));

    if (connections.length === 0) {
      return res.json({ message: 'No connected accounts to synchronize', totalSynced: 0 });
    }

    let totalSynced = 0;
    const userAccs = await getUserAccounts(uid);
    const primaryAccId = userAccs[0]?.id || null;

    for (const conn of connections) {
      const syncRes = await provider.syncTransactions(conn.connectionReference, 'initial_cursor');
      const { insertedCount } = await upsertSyncedTransactions(uid, primaryAccId, syncRes.added);
      totalSynced += insertedCount;

      await db
        .update(financialConnections)
        .set({ lastSyncedAt: new Date() })
        .where(eq(financialConnections.id, conn.id));
    }

    await createNotification(
      uid,
      'sync_success',
      'Transactions Synchronized',
      `Financial sync complete. ${totalSynced} new transaction(s) processed.`
    );

    res.json({ success: true, totalSynced });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'We could not update your transactions right now.' });
  }
});

apiRouter.delete('/bank/connections/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const id = parseInt(req.params.id, 10);
    await deleteConnection(id, uid);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Accounts
apiRouter.get('/accounts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const accList = await getUserAccounts(uid);
    const connList = await getUserConnections(uid);
    res.json({ accounts: accList, connections: connList });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/accounts/manual', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { name, type, balance, currency } = req.body;
    const acc = await saveAccount({
      userId: uid,
      name,
      type: type || 'checking',
      mask: '0000',
      currentBalance: Number(balance) || 0,
      currency: currency || 'GBP',
    });
    res.json(acc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Transactions
apiRouter.get('/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const {
      search,
      category,
      accountId,
      transactionType,
      pending,
      startDate,
      endDate,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = req.query;

    const list = await getUserTransactions({
      userId: uid,
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      accountId: accountId ? Number(accountId) : undefined,
      transactionType: transactionType ? String(transactionType) : undefined,
      pending: pending !== undefined ? pending === 'true' : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
      sortBy: sortBy === 'amount' ? 'amount' : 'date',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    });

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const {
      merchantName,
      description,
      amount,
      currency,
      date,
      category,
      subcategory,
      accountId,
      transactionType,
      note,
      tags,
    } = req.body;

    if (!merchantName || !amount || !date) {
      return res.status(400).json({ error: 'Merchant, amount, and date are required' });
    }

    const tx = await createManualExpense({
      userId: uid,
      merchantName,
      description,
      amount: Math.abs(Number(amount)),
      currency,
      date,
      category,
      subcategory,
      accountId: accountId ? Number(accountId) : undefined,
      transactionType,
      note,
      tags,
    });

    res.json(tx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/transactions/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const txId = parseInt(req.params.id, 10);
    const { category, note, tags, isExcludedFromAnalytics } = req.body;

    const updated = await updateTransactionDetails(uid, txId, {
      category,
      note,
      tags,
      isExcludedFromAnalytics,
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/transactions/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const txId = parseInt(req.params.id, 10);
    await deleteTransaction(uid, txId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Budgets
apiRouter.get('/budgets/overview', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const overview = await getBudgetOverview(uid, month);
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/budgets/category', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { budgetId, category, allocatedAmount } = req.body;
    const result = await updateBudgetCategory(uid, budgetId, category, Number(allocatedAmount));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/budgets/total', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { budgetId, totalMonthlyBudget } = req.body;
    const result = await setTotalBudget(uid, budgetId, Number(totalMonthlyBudget));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Goals
apiRouter.get('/goals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const list = await getUserGoals(uid);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/goals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { title, targetAmount, currentAmount, targetDate, category, color, icon } = req.body;
    const goal = await createGoal({
      userId: uid,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate,
      category,
      color,
      icon,
    });
    res.json(goal);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/goals/:id/contribute', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const goalId = parseInt(req.params.id, 10);
    const { amount } = req.body;
    const updated = await updateGoalProgress(uid, goalId, Number(amount));
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/goals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const goalId = parseInt(req.params.id, 10);
    await deleteGoal(uid, goalId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Analytics & Dashboard Metrics
apiRouter.get('/analytics/dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const metrics = await getDashboardMetrics(uid, month);
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/analytics/timeline', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const timeframe = (req.query.timeframe as any) || '30d';
    const series = await getSpendingTimeline(uid, timeframe);
    res.json(series);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/analytics/categories', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const breakdown = await getCategorySpendingBreakdown(uid, month);
    res.json(breakdown);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/analytics/largest', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const items = await getLargestPurchases(uid, 6);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/analytics/recurring', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const items = await getRecurringList(uid);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Monthly Summary Report
apiRouter.get('/reports/monthly', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const metrics = await getDashboardMetrics(uid, month);
    const categories = await getCategorySpendingBreakdown(uid, month);
    const largest = await getLargestPurchases(uid, 5);

    res.json({
      month,
      income: metrics.totalIncome,
      expenses: metrics.totalExpenses,
      saved: metrics.netSavings,
      topCategory: categories[0]?.name || 'None',
      topCategoryAmount: categories[0]?.value || 0,
      largestTransaction: largest[0] || null,
      spendingChangePct: metrics.spendingChangePct,
      categories,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Notifications
apiRouter.get('/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const list = await getUserNotifications(uid);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/notifications/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const notifId = parseInt(req.params.id, 10);
    const updated = await markNotificationAsRead(uid, notifId);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Seed Demo Data Endpoint (for realistic interactive exploration)
apiRouter.post('/demo/seed', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    // Check if user already has accounts
    const existingAccounts = await getUserAccounts(uid);
    if (existingAccounts.length === 0) {
      // Create Demo connection & accounts
      const conn = await createFinancialConnection({
        userId: uid,
        provider: 'sandbox',
        institutionId: 'ins_monzo',
        institutionName: 'Monzo Bank',
        accessToken: `demo_token_${Date.now()}`,
      });

      const checkingAcc = await saveAccount({
        userId: uid,
        connectionId: conn.id,
        name: 'Monzo Current Account',
        type: 'checking',
        mask: '4821',
        currentBalance: 4250.50,
        currency: 'GBP',
      });

      await saveAccount({
        userId: uid,
        connectionId: conn.id,
        name: 'Savings Pot',
        type: 'savings',
        mask: '1903',
        currentBalance: 8200.00,
        currency: 'GBP',
      });

      // Fetch demo transactions from sandbox provider
      const provider = bankingManager.getProvider();
      const syncResult = await provider.syncTransactions('demo');
      await upsertSyncedTransactions(uid, checkingAcc.id, syncResult.added);

      // Create a couple of financial goals
      await createGoal({
        userId: uid,
        title: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 6500,
        category: 'Emergency',
        color: '#10B981',
        icon: 'Shield',
      });

      await createGoal({
        userId: uid,
        title: 'Summer Vacation',
        targetAmount: 2500,
        currentAmount: 1200,
        category: 'Travel',
        color: '#3B82F6',
        icon: 'Plane',
      });
    }

    res.json({ success: true, message: 'Demo data ready' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. AI Financial Assistant (Section 27)
apiRouter.post('/ai/ask', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const metrics = await getDashboardMetrics(uid, currentMonth);
    const recentTx = await getUserTransactions({ userId: uid, limit: 20 });
    const categories = await getCategorySpendingBreakdown(uid, currentMonth);
    const subscriptions = await getRecurringList(uid);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        answer:
          'AI Assistant requires a GEMINI_API_KEY to be configured in your environment secrets. However, based on your current numbers: You have spent £' +
          metrics.totalExpenses.toFixed(2) +
          ' this month against a budget of £' +
          metrics.monthlyBudget.toFixed(2) +
          ', leaving £' +
          metrics.remainingBudget.toFixed(2) +
          ' remaining.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the Masrof Personal Finance Assistant.
Strict Rules:
- The user is asking about their personal financial data inside Masrof.
- Answer strictly using the actual user data provided below. Never invent or hallucinate financial numbers.
- Do NOT provide regulated financial advice, stock recommendations, or investment advice.
- Keep answers concise, factual, empathetic, and friendly.

User Financial Context:
- Current Month: ${currentMonth}
- Total Balance: £${metrics.totalBalance.toFixed(2)}
- Total Income: £${metrics.totalIncome.toFixed(2)}
- Total Expenses: £${metrics.totalExpenses.toFixed(2)}
- Remaining Budget: £${metrics.remainingBudget.toFixed(2)}
- Spending by category: ${JSON.stringify(categories.map((c) => ({ category: c.name, spent: c.value })))}
- Subscriptions: ${JSON.stringify(subscriptions.map((s) => ({ name: s.merchantName, amount: s.estimatedAmount, frequency: s.frequency })))}
- Recent transactions sample: ${JSON.stringify(recentTx.slice(0, 10).map((t) => ({ merchant: t.merchantName, amount: t.amount, category: t.category, date: t.date })))}

User Question: "${question}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    res.status(500).json({
      answer: 'Sorry, I encountered an issue analyzing your financial records. Please try again in a moment.',
    });
  }
});
