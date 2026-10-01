export interface BankInstitution {
  id: string;
  name: string;
  logoUrl?: string;
  country: string;
  supportsInstantSync: boolean;
}

export interface ProviderAccount {
  providerAccountId: string;
  name: string;
  officialName?: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  mask: string;
  currentBalance: number;
  availableBalance?: number;
  currency: string;
}

export interface ProviderTransaction {
  providerTransactionId: string;
  providerAccountId: string;
  merchantName: string;
  description: string;
  amount: number; // positive = expense, negative = income
  currency: string;
  date: string; // YYYY-MM-DD
  category: string;
  subcategory?: string;
  pending: boolean;
  transactionType: 'expense' | 'income' | 'transfer';
}

export interface TokenExchangeResult {
  accessToken: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  institutionLogo?: string;
}

export interface SyncResult {
  added: ProviderTransaction[];
  modified: ProviderTransaction[];
  removed: string[]; // transaction IDs
  nextCursor?: string;
  hasMore: boolean;
}

export interface IBankProvider {
  readonly providerName: string;
  isConfigured(): boolean;
  getInstitutions(): Promise<BankInstitution[]>;
  createLinkToken(userId: string): Promise<{ linkToken: string; expiration: string }>;
  exchangePublicToken(publicToken: string, institutionId?: string): Promise<TokenExchangeResult>;
  getAccounts(accessToken: string): Promise<ProviderAccount[]>;
  syncTransactions(accessToken: string, cursor?: string): Promise<SyncResult>;
  disconnect(accessToken: string): Promise<boolean>;
  verifyWebhook(headers: Record<string, string | string[] | undefined>, rawBody: string): boolean;
}
