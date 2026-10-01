import { db } from './index.ts';
import { users, userPreferences } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
}

export async function getOrCreateUser(profile: UserProfileData) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName || profile.email.split('@')[0],
        photoUrl: profile.photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: profile.email,
          displayName: profile.displayName || profile.email.split('@')[0],
          photoUrl: profile.photoUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    const user = result[0];

    // Ensure preferences record exists
    const existingPrefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, profile.uid));

    if (existingPrefs.length === 0) {
      await db.insert(userPreferences).values({
        userId: profile.uid,
        currency: 'GBP',
        monthlyIncome: '4500.00',
        primaryGoal: 'Save money',
        onboardingCompleted: false,
      });
    }

    return user;
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile', { cause: error });
  }
}

export async function getUserPreferences(uid: string) {
  try {
    const prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, uid));
    return prefs[0] || null;
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    throw new Error('Failed to retrieve preferences', { cause: error });
  }
}
