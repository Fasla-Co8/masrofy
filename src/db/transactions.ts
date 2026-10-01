import { db } from './index.ts';
import { transactions, recurringTransactions, accounts } from './schema.ts';
import { eq, and, desc, asc, like, gte, lte, sql, or } from 'drizzle-orm';
import { categorizeTransaction } from '../services/categorization.ts';
import { ProviderTransaction } from '../services/banking/types.ts';

export interface TransactionFilterParams {
  userId: string;
  search?: string;
  category?: string;
  accountId?: number;
  transactionType?: string;
  pending?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export async function getUserTransactions(params: TransactionFilterParams) {
  try {
    const conditions = [eq(transactions.userId, params.userId)];

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      conditions.push(
        or(
          like(transactions.merchantName, searchPattern),
          like(transactions.description, searchPattern),
          like(transactions.note, searchPattern)
        )!
      );
    }

    if (params.category && params.category !== 'all') {
      conditions.push(eq(transactions.category, params.category));
    }

    if (params.accountId) {
      conditions.push(eq(transactions.accountId, params.accountId));
    }

    if (params.transactionType && params.transactionType !== 'all') {
      conditions.push(eq(transactions.transactionType, params.transactionType));
    }

    if (params.pending !== undefined) {
      conditions.push(eq(transactions.pending, params.pending));
    }

    if (params.startDate) {
      conditions.push(gte(transactions.date, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(transactions.date, params.endDate));
    }

    const whereClause = and(...conditions);

    const orderExpr =
      params.sortBy === 'amount'
        ? params.sortOrder === 'asc'
          ? asc(transactions.amount)
          : desc(transactions.amount)
        : params.sortOrder === 'asc'
        ? asc(transactions.date)
        : desc(transactions.date);

    const items = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        accountId: transactions.accountId,
        accountName: accounts.name,
        providerTransactionId: transactions.providerTransactionId,
        merchantName: transactions.merchantName,
        description: transactions.description,
        amount: transactions.amount,
        currency: transactions.currency,
        date: transactions.date,
        category: transactions.category,
        subcategory: transactions.subcategory,
        transactionType: transactions.transactionType,
        pending: transactions.pending,
        source: transactions.source,
        note: transactions.note,
        tags: transactions.tags,
        isExcludedFromAnalytics: transactions.isExcludedFromAnalytics,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(whereClause)
      .orderBy(orderExpr)
      .limit(params.limit || 50)
      .offset(params.offset || 0);

    return items;
  } catch (error) {
    console.error('Failed to query transactions:', error);
    throw new Error('Failed to retrieve transactions', { cause: error });
  }
}

export async function createManualExpense(data: {
  userId: string;
  merchantName: string;
  description?: string;
  amount: number;
  currency?: string;
  date: string;
  category?: string;
  subcategory?: string;
  accountId?: number;
  transactionType?: 'expense' | 'income' | 'transfer';
  note?: string;
  tags?: string;
}) {
  try {
    const autoCat = categorizeTransaction(
      data.merchantName,
      data.description || data.merchantName,
      undefined,
      data.amount
    );

    const chosenCategory = data.category || autoCat.category;
    const chosenType = data.transactionType || autoCat.transactionType;

    const result = await db
      .insert(transactions)
      .values({
        userId: data.userId,
        accountId: data.accountId || null,
        merchantName: data.merchantName,
        description: data.description || data.merchantName,
        amount: data.amount.toFixed(2),
        currency: data.currency || 'GBP',
        date: data.date,
        category: chosenCategory,
        subcategory: data.subcategory || autoCat.subcategory || null,
        transactionType: chosenType,
        pending: false,
        source: 'manual',
        note: data.note || null,
        tags: data.tags || null,
      })
      .returning();

    // If account was selected, update account balance
    if (data.accountId) {
      const delta = chosenType === 'income' ? data.amount : -data.amount;
      await db
        .update(accounts)
        .set({
          currentBalance: sql`${accounts.currentBalance} + ${delta.toFixed(2)}`,
          updatedAt: new Date(),
        })
        .where(and(eq(accounts.id, data.accountId), eq(accounts.userId, data.userId)));
    }

    return result[0];
  } catch (error) {
    console.error('Failed to create manual expense:', error);
    throw new Error('Failed to record expense', { cause: error });
  }
}

export async function upsertSyncedTransactions(
  userId: string,
  accountId: number | null,
  rawList: ProviderTransaction[]
) {
  try {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of rawList) {
      const existing = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.providerTransactionId, item.providerTransactionId)
          )
        );

      if (existing.length > 0) {
        // Update pending status, amount if changed
        await db
          .update(transactions)
          .set({
            pending: item.pending,
            amount: item.amount.toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(transactions.id, existing[0].id));
        updatedCount++;
      } else {
        await db.insert(transactions).values({
          userId,
          accountId: accountId || null,
          providerTransactionId: item.providerTransactionId,
          merchantName: item.merchantName,
          description: item.description,
          amount: item.amount.toFixed(2),
          currency: item.currency,
          date: item.date,
          category: item.category,
          subcategory: item.subcategory || null,
          transactionType: item.transactionType,
          pending: item.pending,
          source: 'plaid',
        });
        insertedCount++;
      }
    }

    // Run auto recurring detection
    await checkAndRecordRecurring(userId);

    return { insertedCount, updatedCount };
  } catch (error) {
    console.error('Failed to sync transactions in db:', error);
    throw new Error('Failed to synchronize transactions', { cause: error });
  }
}

export async function updateTransactionDetails(
  userId: string,
  txId: number,
  updates: {
    category?: string;
    note?: string;
    tags?: string;
    isExcludedFromAnalytics?: boolean;
  }
) {
  try {
    const result = await db
      .update(transactions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, txId), eq(transactions.userId, userId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to update transaction:', error);
    throw new Error('Failed to update transaction', { cause: error });
  }
}

export async function deleteTransaction(userId: string, txId: number) {
  try {
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, txId), eq(transactions.userId, userId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    throw new Error('Failed to delete transaction', { cause: error });
  }
}

// Auto-detect recurring subscriptions like Netflix, Spotify, Gym memberships
export async function checkAndRecordRecurring(userId: string) {
  try {
    const subs = await db
      .select({
        merchantName: transactions.merchantName,
        category: transactions.category,
        count: sql<number>`count(*)`,
        avgAmount: sql<number>`avg(amount::numeric)`,
        maxDate: sql<string>`max(date)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.transactionType, 'expense')
        )
      )
      .groupBy(transactions.merchantName, transactions.category)
      .having(sql`count(*) >= 1`);

    const knownSubscriptionMerchants = [
      'Netflix',
      'Spotify',
      'Apple Services',
      'PureGym',
      'British Gas',
      'Prime Video',
      'Disney+',
      'EE Limited',
      'Vodafone',
    ];

    for (const row of subs) {
      const isKnown = knownSubscriptionMerchants.some((m) =>
        row.merchantName.toLowerCase().includes(m.toLowerCase())
      );
      if (isKnown || row.category === 'Subscriptions' || row.count >= 2) {
        const existing = await db
          .select()
          .from(recurringTransactions)
          .where(
            and(
              eq(recurringTransactions.userId, userId),
              eq(recurringTransactions.merchantName, row.merchantName)
            )
          );

        if (existing.length === 0) {
          await db.insert(recurringTransactions).values({
            userId,
            merchantName: row.merchantName,
            estimatedAmount: Number(row.avgAmount).toFixed(2),
            currency: 'GBP',
            frequency: 'monthly',
            category: row.category || 'Subscriptions',
            lastDate: row.maxDate,
            status: 'active',
          });
        }
      }
    }
  } catch (err) {
    console.error('Recurring detection error:', err);
  }
}
