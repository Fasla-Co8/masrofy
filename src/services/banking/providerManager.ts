import { IBankProvider } from './types.ts';
import { PlaidProvider } from './plaidProvider.ts';
import { SandboxBankingProvider } from './sandboxProvider.ts';

class BankingProviderManager {
  private plaid: PlaidProvider;
  private sandbox: SandboxBankingProvider;

  constructor() {
    this.plaid = new PlaidProvider();
    this.sandbox = new SandboxBankingProvider();
  }

  getProvider(): IBankProvider {
    const configuredProvider = process.env.BANK_PROVIDER || 'plaid';
    if (configuredProvider === 'plaid' && this.plaid.isConfigured()) {
      return this.plaid;
    }
    // Returns sandbox Open Banking provider if external credentials not yet supplied
    return this.sandbox;
  }

  getStatus() {
    const isPlaidActive = this.plaid.isConfigured();
    return {
      activeProvider: isPlaidActive ? 'plaid' : 'sandbox',
      isLiveConfigured: isPlaidActive,
      environment: process.env.BANK_PROVIDER_ENV || 'sandbox',
      missingVariables: isPlaidActive
        ? []
        : ['BANK_PROVIDER_CLIENT_ID', 'BANK_PROVIDER_CLIENT_SECRET'],
    };
  }
}

export const bankingManager = new BankingProviderManager();
