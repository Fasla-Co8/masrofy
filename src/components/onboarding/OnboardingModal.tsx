import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { fetchApi } from '../../lib/api.ts';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Target,
  Wallet,
  TrendingUp,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const GOALS = [
  { id: 'Save money', label: 'Save money', desc: 'Grow savings consistently each month' },
  { id: 'Reduce unnecessary spending', label: 'Reduce unnecessary spending', desc: 'Cut down on impulse & eating out expenses' },
  { id: 'Pay off debt', label: 'Pay off debt', desc: 'Accelerate debt payoff and track progress' },
  { id: 'Build an emergency fund', label: 'Build an emergency fund', desc: 'Establish 3-6 months of living cushion' },
  { id: 'Track spending', label: 'Track spending', desc: 'Know exactly where every pound goes' },
  { id: 'General financial planning', label: 'General financial planning', desc: 'Organize budgets and optimize cashflow' },
];

const CURRENCIES = [
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal (SAR)' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham (AED)' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user, preferences, refreshUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currency, setCurrency] = useState(preferences?.currency || 'GBP');
  const [monthlyIncome, setMonthlyIncome] = useState(preferences?.monthlyIncome || '4500');
  const [payFrequency, setPayFrequency] = useState(preferences?.payFrequency || 'monthly');
  const [primaryGoal, setPrimaryGoal] = useState(preferences?.primaryGoal || 'Save money');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetchApi('/api/user/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          displayName,
          currency,
          monthlyIncome: Number(monthlyIncome) || 4500,
          payFrequency,
          primaryGoal,
        }),
      });
      await refreshUserData();
      onComplete();
    } catch (err) {
      console.error('Onboarding save failed:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-10 bg-emerald-600'
                    : s < step
                    ? 'w-6 bg-emerald-400'
                    : 'w-6 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Step {step} of 4</span>
        </div>

        {/* Step 1: Name & Currency */}
        {step === 1 && (
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Let's personalize your Masrof</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              How would you like us to address you, and what currency do you use day-to-day?
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Nora Tala"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Currency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrency(c.code)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition ${
                        currency === c.code
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{c.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">
                        {c.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Income & Pay Frequency */}
        {step === 2 && (
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your monthly cashflow</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Setting your expected monthly income allows Masrof to project your savings and budget safety margins.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimated Monthly Income ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400 font-medium">
                    {currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'}
                  </span>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="4500"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['monthly', 'bi-weekly', 'weekly'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setPayFrequency(freq)}
                      className={`p-3 rounded-xl border text-center capitalize text-sm transition ${
                        payFrequency === freq
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center space-x-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Main Goal */}
        {step === 3 && (
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What is your main financial goal?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Masrof will tailor your category insights and progress tracking around this objective.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setPrimaryGoal(g.id)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    primaryGoal === g.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold">{g.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready screen */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Masrof dashboard is ready.</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              We have configured your default budget envelopes for Food, Shopping, Transport, and Bills. You can now securely connect your bank account or record your first transaction.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left max-w-sm mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Income Target</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currency} {Number(monthlyIncome).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Goal</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{primaryGoal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Currency</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currency}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full max-w-sm mx-auto flex items-center justify-center space-x-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-600/30 transition cursor-pointer"
            >
              <span>Go to My Dashboard</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
