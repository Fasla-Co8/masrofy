import { db } from './index.ts';
import { accounts, financialConnections } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { encryptToken, decryptToken } from '../utils/crypto.ts';

export async function getUserAccounts(userId: string) {
  try {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.currentBalance));
  } catch (error) {
    console.error('Failed to get user accounts:', error);
    throw new Error('Failed to retrieve user accounts', { cause: error });
  }
}

export async function getUserConnections(userId: string) {
  try {
    const list = await db
      .select()
      .from(financialConnections)
      .where(eq(financialConnections.userId, userId))
      .orderBy(desc(financialConnections.createdAt));

    // Return connections without revealing raw token
    return list.map((conn) => ({
      ...conn,
      connectionReference: '[SECURE_TOKEN_STORED]',
    }));
  } catch (error) {
    console.error('Failed to get financial connections:', error);
    throw new Error('Failed to retrieve bank connections', { cause: error });
  }
}

export async function createFinancialConnection(data: {
  userId: string;
  provider: string;
  institutionId: string;
  institutionName: string;
  accessToken: string;
}) {
  try {
    const encryptedToken = encryptToken(data.accessToken);
    const result = await db
      .insert(financialConnections)
      .values({
        userId: data.userId,
        provider: data.provider,
        institutionId: data.institutionId,
        institutionName: data.institutionName,
        connectionReference: encryptedToken,
        status: 'connected',
        lastSyncedAt: new Date(),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create financial connection:', error);
    throw new Error('Failed to save bank connection', { cause: error });
  }
}

export async function saveAccount(data: {
  userId: string;
  connectionId?: number;
  providerAccountId?: string;
  name: string;
  officialName?: string;
  type: string;
  mask: string;
  currentBalance: number;
  availableBalance?: number;
  currency: string;
}) {
  try {
    const result = await db
      .insert(accounts)
      .values({
        userId: data.userId,
        connectionId: data.connectionId || null,
        providerAccountId: data.providerAccountId || null,
        name: data.name,
        officialName: data.officialName || data.name,
        type: data.type,
        mask: data.mask,
        currentBalance: data.currentBalance.toFixed(2),
        availableBalance: data.availableBalance !== undefined ? data.availableBalance.toFixed(2) : null,
        currency: data.currency,
        status: 'active',
        lastSyncedAt: new Date(),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to save account:', error);
    throw new Error('Failed to record bank account', { cause: error });
  }
}

export async function deleteConnection(connectionId: number, userId: string) {
  try {
    return await db
      .delete(financialConnections)
      .where(
        and(
          eq(financialConnections.id, connectionId),
          eq(financialConnections.userId, userId)
        )
      )
      .returning();
  } catch (error) {
    console.error('Failed to delete connection:', error);
    throw new Error('Failed to remove bank connection', { cause: error });
  }
}
