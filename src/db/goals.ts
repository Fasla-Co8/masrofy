import { db } from './index.ts';
import { goals } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export async function getUserGoals(userId: string) {
  try {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  } catch (error) {
    console.error('Failed to get goals:', error);
    throw new Error('Failed to retrieve financial goals', { cause: error });
  }
}

export async function createGoal(data: {
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  category?: string;
  color?: string;
  icon?: string;
}) {
  try {
    const result = await db
      .insert(goals)
      .values({
        userId: data.userId,
        title: data.title,
        targetAmount: data.targetAmount.toFixed(2),
        currentAmount: (data.currentAmount || 0).toFixed(2),
        targetDate: data.targetDate || null,
        category: data.category || 'Savings',
        color: data.color || '#10B981',
        icon: data.icon || 'Target',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create goal:', error);
    throw new Error('Failed to create financial goal', { cause: error });
  }
}

export async function updateGoalProgress(
  userId: string,
  goalId: number,
  additionalAmount: number
) {
  try {
    const goal = (
      await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    )[0];

    if (!goal) throw new Error('Goal not found');

    const newCurrent = Number(goal.currentAmount) + additionalAmount;
    const isCompleted = newCurrent >= Number(goal.targetAmount);

    const result = await db
      .update(goals)
      .set({
        currentAmount: newCurrent.toFixed(2),
        isCompleted,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, goalId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to update goal progress:', error);
    throw new Error('Failed to update goal progress', { cause: error });
  }
}

export async function deleteGoal(userId: string, goalId: number) {
  try {
    return await db
      .delete(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
      .returning();
  } catch (error) {
    console.error('Failed to delete goal:', error);
    throw new Error('Failed to delete goal', { cause: error });
  }
}
