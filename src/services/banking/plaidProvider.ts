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

export class PlaidProvider implements IBankProvider {
  readonly providerName = 'plaid';
  private clientId: string;
  private secret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.BANK_PROVIDER_CLIENT_ID || '';
    this.secret = process.env.BANK_PROVIDER_CLIENT_SECRET || '';
    const env = process.env.BANK_PROVIDER_ENV || 'sandbox';

    if (env === 'production') {
      this.baseUrl = 'https://production.plaid.com';
    } else if (env === 'development') {
      this.baseUrl = 'https://development.plaid.com';
    } else {
      this.baseUrl = 'https://sandbox.plaid.com';
    }
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.secret);
  }

  async getInstitutions(): Promise<BankInstitution[]> {
    return SUPPORTED_INSTITUTIONS;
  }

  async createLinkToken(userId: string): Promise<{ linkToken: string; expiration: string }> {
    if (!this.isConfigured()) {
      throw new Error('Plaid credentials not configured. Please supply BANK_PROVIDER_CLIENT_ID and BANK_PROVIDER_CLIENT_SECRET.');
    }

    const response = await fetch(`${this.baseUrl}/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        secret: this.secret,
        client_name: 'Masrof Finance',
        country_codes: ['GB', 'US'],
        language: 'en',
        user: { client_user_id: userId },
        products: ['transactions'],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Plaid LinkToken error: ${data.error_message || response.statusText}`);
    }

    return {
      linkToken: data.link_token,
      expiration: data.expiration,
    };
  }

  async exchangePublicToken(publicToken: string, institutionId?: string): Promise<TokenExchangeResult> {
    if (!this.isConfigured()) {
      throw new Error('Plaid credentials not configured');
    }

    const response = await fetch(`${this.baseUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        secret: this.secret,
        public_token: publicToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Plaid token exchange error: ${data.error_message || response.statusText}`);
    }

    const inst = SUPPORTED_INSTITUTIONS.find((i) => i.id === institutionId);

    return {
      accessToken: data.access_token,
      itemId: data.item_id,
      institutionId: institutionId || 'ins_unknown',
      institutionName: inst ? inst.name : 'Connected Bank',
    };
  }

  async getAccounts(accessToken: string): Promise<ProviderAccount[]> {
    if (!this.isConfigured()) {
      throw new Error('Plaid credentials not configured');
    }

    const response = await fetch(`${this.baseUrl}/accounts/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        secret: this.secret,
        access_token: accessToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Plaid getAccounts error: ${data.error_message || response.statusText}`);
    }

    return (data.accounts || []).map((acc: any) => ({
      providerAccountId: acc.account_id,
      name: acc.name,
      officialName: acc.official_name || acc.name,
      type: acc.type === 'depository' ? (acc.subtype === 'savings' ? 'savings' : 'checking') : (acc.type || 'checking'),
      mask: acc.mask || '0000',
      currentBalance: acc.balances?.current || 0,
      availableBalance: acc.balances?.available ?? acc.balances?.current ?? 0,
      currency: acc.balances?.iso_currency_code || 'GBP',
    }));
  }

  async syncTransactions(accessToken: string, cursor?: string): Promise<SyncResult> {
    if (!this.isConfigured()) {
      throw new Error('Plaid credentials not configured');
    }

    const response = await fetch(`${this.baseUrl}/transactions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        secret: this.secret,
        access_token: accessToken,
        cursor: cursor || undefined,
        count: 100,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Plaid sync error: ${data.error_message || response.statusText}`);
    }

    const mapTx = (tx: any): ProviderTransaction => {
      const merchant = tx.merchant_name || tx.name || 'Merchant';
      const catInfo = categorizeTransaction(merchant, tx.name || '', tx.category?.[0], tx.amount);
      return {
        providerTransactionId: tx.transaction_id,
        providerAccountId: tx.account_id,
        merchantName: merchant,
        description: tx.name,
        amount: Math.abs(tx.amount),
        currency: tx.iso_currency_code || 'GBP',
        date: tx.date,
        category: catInfo.category,
        subcategory: catInfo.subcategory,
        pending: Boolean(tx.pending),
        transactionType: catInfo.transactionType,
      };
    };

    return {
      added: (data.added || []).map(mapTx),
      modified: (data.modified || []).map(mapTx),
      removed: (data.removed || []).map((r: any) => r.transaction_id),
      nextCursor: data.next_cursor,
      hasMore: data.has_more,
    };
  }

  async disconnect(accessToken: string): Promise<boolean> {
    if (!this.isConfigured()) return true;

    try {
      const response = await fetch(`${this.baseUrl}/item/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          secret: this.secret,
          access_token: accessToken,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  verifyWebhook(headers: Record<string, string | string[] | undefined>, _rawBody: string): boolean {
    const webhookSecret = process.env.BANK_PROVIDER_WEBHOOK_SECRET;
    if (!webhookSecret) return true; // allow in dev
    const signature = headers['plaid-verification'];
    return Boolean(signature);
  }
}
