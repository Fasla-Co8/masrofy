import { db } from './index.ts';
import { notifications } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export async function getUserNotifications(userId: string) {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    throw new Error('Failed to retrieve notifications', { cause: error });
  }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
) {
  try {
    const result = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        read: false,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(userId: string, notificationId: number) {
  try {
    return await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    throw new Error('Failed to update notification', { cause: error });
  }
}
