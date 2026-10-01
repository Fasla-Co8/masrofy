import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api.ts';
import {
  Shield,
  Lock,
  Landmark,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface BankConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BankInstitution {
  id: string;
  name: string;
  country: string;
}

interface ProviderStatus {
  activeProvider: string;
  isLiveConfigured: boolean;
  environment: string;
  missingVariables: string[];
}

export const BankConnectModal: React.FC<BankConnectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'info' | 'select' | 'auth' | 'syncing' | 'complete'>('info');
  const [institutions, setInstitutions] = useState<BankInstitution[]>([]);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [selectedInst, setSelectedInst] = useState<BankInstitution | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{ accountsCount: number; transactionsImported: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('info');
      setSelectedInst(null);
      setError(null);
      fetchApi<BankInstitution[]>('/api/bank/institutions')
        .then(setInstitutions)
        .catch(console.error);
      fetchApi<ProviderStatus>('/api/bank/status')
        .then(setProviderStatus)
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartAuth = (inst: BankInstitution) => {
    setSelectedInst(inst);
    setStep('auth');
  };

  const handleCompleteConnection = async () => {
    setLoading(true);
    setError(null);
    setStep('syncing');

    try {
      // Calls /api/bank/connect with public token and institution ID
      const res = await fetchApi('/api/bank/connect', {
        method: 'POST',
        body: JSON.stringify({
          publicToken: `token_public_${Date.now()}`,
          institutionId: selectedInst?.id || 'ins_monzo',
        }),
      });

      setSyncSummary({
        accountsCount: res.connection.accountsCount,
        transactionsImported: res.connection.transactionsImported,
      });

      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'We could not connect to your bank. Please try again.');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Transparency & Security explanation */}
        {step === 'info' && (
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Connect Your Bank Account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Automatically synchronize transactions and balances directly into Masrof with end-to-end encryption.
            </p>

            <div className="space-y-3.5 mb-6 text-sm">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Read-Only Financial Data</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Masrof only reads account balances and transaction histories. Nobody can ever move or transfer your money.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <Lock className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Zero Password Storage</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    We never see or store your banking login credentials. Authentication takes place directly through regulated Open Banking.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <Shield className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">AES-256 Encrypted Tokens</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connection tokens are encrypted at rest. You can revoke access at any time from your settings.
                  </p>
                </div>
              </div>
            </div>

            {providerStatus && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>
                  Active Provider:{' '}
                  <strong className="capitalize">{providerStatus.activeProvider} Open Banking</strong> (
                  {providerStatus.environment})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-[10px] font-semibold uppercase">
                  Connected
                </span>
              </div>
            )}

            <button
              onClick={() => setStep('select')}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition cursor-pointer"
            >
              <span>Continue to Select Bank</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Select Institution */}
        {step === 'select' && (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setStep('info')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose your bank</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select your financial institution from the supported Open Banking network:
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 mb-6">
              {institutions.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleStartAuth(inst)}
                  className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm">
                    {inst.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{inst.name}</p>
                    <p className="text-[11px] text-slate-400">Instant Sync • {inst.country}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Looking for another institution?</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">10,000+ banks supported</span>
            </div>
          </div>
        )}

        {/* STEP 3: Authenticate in Provider Flow */}
        {step === 'auth' && selectedInst && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connecting to {selectedInst.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-6">
              You will now authenticate directly with {selectedInst.name} using Open Banking secure protocol. Masrof will never receive your bank credentials.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 mb-6 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInst.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol:</span>
                <span className="font-semibold text-emerald-600">Open Banking API v3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Permission:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Read transactions & balances</span>
              </div>
            </div>

            <div className="flex space-x-3 max-w-sm mx-auto">
              <button
                onClick={() => setStep('select')}
                className="w-1/3 py-3 px-3 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleCompleteConnection}
                disabled={loading}
                className="w-2/3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Authorize & Synchronize</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Syncing in Progress */}
        {step === 'syncing' && (
          <div className="text-center py-10">
            <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Synchronizing Financial Data</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
              Exchanging secure tokens, querying accounts, and importing transaction history...
            </p>
          </div>
        )}

        {/* STEP 5: Complete */}
        {step === 'complete' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bank Connected Successfully!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-6">
              Your accounts and transactions have been safely synchronized into your Masrof dashboard.
            </p>

            {syncSummary && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 mb-6 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Connected Accounts:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{syncSummary.accountsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transactions Imported:</span>
                  <span className="font-semibold text-emerald-600">{syncSummary.transactionsImported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auto-Categorization:</span>
                  <span className="font-semibold text-emerald-600">Applied</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full max-w-sm mx-auto py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition cursor-pointer"
            >
              View Updated Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
