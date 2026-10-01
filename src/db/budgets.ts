import { db } from './index.ts';
import { budgets, budgetCategories, transactions, notifications } from './schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import { CATEGORY_DEFINITIONS } from '../services/categorization.ts';

export async function getBudgetOverview(userId: string, month: string) {
  try {
    // 1. Get or create budget record for month (e.g. "2026-09")
    let budgetRecord = (
      await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.month, month)))
    )[0];

    if (!budgetRecord) {
      const defaultTotal = '2200.00';
      const created = await db
        .insert(budgets)
        .values({
          userId,
          month,
          totalMonthlyBudget: defaultTotal,
        })
        .returning();
      budgetRecord = created[0];

      // Seed standard category budgets
      const defaultCategories = ['Food', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Subscriptions'];
      for (const catName of defaultCategories) {
        const catDef = CATEGORY_DEFINITIONS[catName];
        await db.insert(budgetCategories).values({
          budgetId: budgetRecord.id,
          userId,
          category: catName,
          allocatedAmount: (catDef?.defaultBudget || 150).toFixed(2),
        });
      }
    }

    // 2. Fetch category allocations
    const categories = await db
      .select()
      .from(budgetCategories)
      .where(and(eq(budgetCategories.budgetId, budgetRecord.id), eq(budgetCategories.userId, userId)));

    // 3. Calculate actual spending in current month per category
    const monthPrefix = `${month}%`;
    const spendingByCategory = await db
      .select({
        category: transactions.category,
        spent: sql<number>`coalesce(sum(amount::numeric), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.transactionType, 'expense'),
          sql`${transactions.date} LIKE ${monthPrefix}`,
          eq(transactions.isExcludedFromAnalytics, false)
        )
      )
      .groupBy(transactions.category);

    const spendMap = new Map<string, number>();
    spendingByCategory.forEach((row) => {
      spendMap.set(row.category, Number(row.spent));
    });

    let totalAllocated = 0;
    let totalSpent = 0;

    const categoryDetails = categories.map((c) => {
      const allocated = Number(c.allocatedAmount);
      const spent = spendMap.get(c.category) || 0;
      const remaining = allocated - spent;
      const percentUsed = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      totalAllocated += allocated;
      totalSpent += spent;

      return {
        id: c.id,
        category: c.category,
        allocated,
        spent,
        remaining,
        percentUsed,
        isWarning: percentUsed >= 80 && percentUsed < 100,
        isOverBudget: percentUsed >= 100,
      };
    });

    return {
      budgetId: budgetRecord.id,
      month: budgetRecord.month,
      totalBudget: Number(budgetRecord.totalMonthlyBudget),
      totalAllocated,
      totalSpent,
      remainingBudget: Number(budgetRecord.totalMonthlyBudget) - totalSpent,
      categories: categoryDetails,
    };
  } catch (error) {
    console.error('Failed to get budget overview:', error);
    throw new Error('Failed to retrieve budget information', { cause: error });
  }
}

export async function updateBudgetCategory(
  userId: string,
  budgetId: number,
  category: string,
  newAmount: number
) {
  try {
    const existing = await db
      .select()
      .from(budgetCategories)
      .where(
        and(
          eq(budgetCategories.budgetId, budgetId),
          eq(budgetCategories.userId, userId),
          eq(budgetCategories.category, category)
        )
      );

    if (existing.length > 0) {
      await db
        .update(budgetCategories)
        .set({
          allocatedAmount: newAmount.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(budgetCategories.id, existing[0].id));
    } else {
      await db.insert(budgetCategories).values({
        budgetId,
        userId,
        category,
        allocatedAmount: newAmount.toFixed(2),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update category budget:', error);
    throw new Error('Failed to update category budget', { cause: error });
  }
}

export async function setTotalBudget(userId: string, budgetId: number, totalAmount: number) {
  try {
    const result = await db
      .update(budgets)
      .set({
        totalMonthlyBudget: totalAmount.toFixed(2),
        updatedAt: new Date(),
      })
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to set total budget:', error);
    throw new Error('Failed to update total budget', { cause: error });
  }
}
