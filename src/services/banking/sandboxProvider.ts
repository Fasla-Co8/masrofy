import {
  IBankProvider,
  BankInstitution,
  ProviderAccount,
  ProviderTransaction,
  TokenExchangeResult,
  SyncResult,
} from './types.ts';
import { SUPPORTED_INSTITUTIONS } from './mockInstitutions.ts';
import { categorizeTransaction } from '../categorization.ts';

export class SandboxBankingProvider implements IBankProvider {
  readonly providerName = 'sandbox';

  isConfigured(): boolean {
    return true;
  }

  async getInstitutions(): Promise<BankInstitution[]> {
    return SUPPORTED_INSTITUTIONS;
  }

  async createLinkToken(userId: string): Promise<{ linkToken: string; expiration: string }> {
    const expiration = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
    return {
      linkToken: `link-sandbox-${userId}-${Date.now()}`,
      expiration,
    };
  }

  async exchangePublicToken(publicToken: string, institutionId?: string): Promise<TokenExchangeResult> {
    const instId = institutionId || 'ins_monzo';
    const institution = SUPPORTED_INSTITUTIONS.find((i) => i.id === instId) || SUPPORTED_INSTITUTIONS[0];

    return {
      accessToken: `access-sandbox-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      itemId: `item-sandbox-${Date.now()}`,
      institutionId: institution.id,
      institutionName: institution.name,
    };
  }

  async getAccounts(accessToken: string): Promise<ProviderAccount[]> {
    const hash = accessToken.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const lastDigits1 = String(1000 + (hash % 8999)).slice(-4);
    const lastDigits2 = String(2000 + ((hash * 3) % 7999)).slice(-4);

    return [
      {
        providerAccountId: `acc_checking_${lastDigits1}`,
        name: 'Current Account',
        officialName: 'Personal Checking Account',
        type: 'checking',
        mask: lastDigits1,
        currentBalance: 4250.50,
        availableBalance: 4250.50,
        currency: 'GBP',
      },
      {
        providerAccountId: `acc_savings_${lastDigits2}`,
        name: 'Vault Savings',
        officialName: 'High Yield Savings Account',
        type: 'savings',
        mask: lastDigits2,
        currentBalance: 8200.00,
        availableBalance: 8200.00,
        currency: 'GBP',
      },
    ];
  }

  async syncTransactions(accessToken: string, cursor?: string): Promise<SyncResult> {
    const now = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);
      return d.toISOString().split('T')[0];
    };

    // If cursor was already passed, we have no more initial transactions to sync
    if (cursor && cursor !== 'initial_cursor') {
      return {
        added: [],
        modified: [],
        removed: [],
        nextCursor: cursor,
        hasMore: false,
      };
    }

    const rawTxList = [
      {
        id: `tx_${Date.now()}_1`,
        accountSuffix: 'checking',
        merchant: 'Amazon',
        desc: 'Amazon.co.uk Marketplace',
        amount: 74.50,
        daysAgo: 1,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_2`,
        accountSuffix: 'checking',
        merchant: 'Spotify',
        desc: 'Spotify Premium Family Plan',
        amount: 10.99,
        daysAgo: 2,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_3`,
        accountSuffix: 'checking',
        merchant: 'Uber',
        desc: 'Uber * Trip London UK',
        amount: 14.20,
        daysAgo: 3,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_4`,
        accountSuffix: 'checking',
        merchant: 'Tesco Express',
        desc: 'Tesco Stores 3218',
        amount: 48.65,
        daysAgo: 4,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_5`,
        accountSuffix: 'checking',
        merchant: 'British Gas',
        desc: 'British Gas Energy Direct Debit',
        amount: 88.00,
        daysAgo: 5,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_6`,
        accountSuffix: 'checking',
        merchant: 'Deliveroo',
        desc: 'Deliveroo Order Food',
        amount: 28.50,
        daysAgo: 6,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_7`,
        accountSuffix: 'checking',
        merchant: 'Transport for London',
        desc: 'TfL Travel Charge',
        amount: 7.40,
        daysAgo: 1,
        pending: true,
      },
      {
        id: `tx_${Date.now()}_8`,
        accountSuffix: 'checking',
        merchant: 'Apple Services',
        desc: 'iCloud 200GB Storage',
        amount: 2.99,
        daysAgo: 8,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_9`,
        accountSuffix: 'checking',
        merchant: 'Employer Payroll',
        desc: 'Salary Payment BACS Direct Deposit',
        amount: -4500.00,
        daysAgo: 10,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_10`,
        accountSuffix: 'savings',
        merchant: 'High Yield Interest',
        desc: 'Interest Paid Monthly',
        amount: -32.50,
        daysAgo: 12,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_11`,
        accountSuffix: 'checking',
        merchant: 'Zara London',
        desc: 'Zara Oxford Street Retail',
        amount: 62.00,
        daysAgo: 14,
        pending: false,
      },
      {
        id: `tx_${Date.now()}_12`,
        accountSuffix: 'checking',
        merchant: 'PureGym',
        desc: 'PureGym Monthly Membership',
        amount: 29.99,
        daysAgo: 15,
        pending: false,
      },
    ];

    const added: ProviderTransaction[] = rawTxList.map((item) => {
      const isIncome = item.amount < 0;
      const cat = categorizeTransaction(item.merchant, item.desc, undefined, item.amount);
      return {
        providerTransactionId: item.id,
        providerAccountId: `acc_${item.accountSuffix}`,
        merchantName: item.merchant,
        description: item.desc,
        amount: Math.abs(item.amount),
        currency: 'GBP',
        date: formatDate(item.daysAgo),
        category: cat.category,
        subcategory: cat.subcategory,
        pending: item.pending,
        transactionType: isIncome ? 'income' : 'expense',
      };
    });

    return {
      added,
      modified: [],
      removed: [],
      nextCursor: `cursor_${Date.now()}`,
      hasMore: false,
    };
  }

  async disconnect(_accessToken: string): Promise<boolean> {
    return true;
  }

  verifyWebhook(_headers: Record<string, string | string[] | undefined>, _rawBody: string): boolean {
    return true;
  }
}
