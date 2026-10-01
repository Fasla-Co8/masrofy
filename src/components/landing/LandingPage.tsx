import React, { useState } from 'react';
import {
  Shield,
  Lock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  PieChart,
  Landmark,
  CheckCircle2,
  Receipt,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Zap,
  Check,
  Star,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onExploreDemo }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Does Masrof store my online banking passwords?',
      a: 'Never. Masrof integrates exclusively through regulated Open Banking providers (such as Plaid). When connecting your bank, authentication happens directly inside your bank’s official interface. We never see, receive, or store your passwords.',
    },
    {
      q: 'Can anyone transfer or move my money via Masrof?',
      a: 'No. Masrof operates with strictly read-only permissions to retrieve balances and transaction statements for categorization and budgeting. Nobody can move money, initiate transfers, or make changes to your accounts.',
    },
    {
      q: 'How does automatic transaction categorization work?',
      a: 'Our smart financial engine analyzes merchant identifiers, category codes, and transaction patterns to instantly categorize expenses into envelopes like Food, Shopping, Transport, Utilities, and Subscriptions. You can also re-categorize or customize any envelope.',
    },
    {
      q: 'Can I add expenses manually if I pay in cash?',
      a: 'Yes! Masrof supports seamless manual entry for cash expenses, external purchases, or reimbursement tracking. Both bank-synced and manual entries automatically update your dashboard and remaining budget.',
    },
    {
      q: 'What currencies does Masrof support?',
      a: 'Masrof natively supports GBP (£), USD ($), EUR (€), SAR (ر.س), AED (د.إ), and more. You can change your primary currency at any time in your preferences.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Masrof
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              How It Works
            </a>
            <a href="#security" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Security
            </a>
            <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Pricing
            </a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onExploreDemo}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 px-3 py-2 rounded-lg transition"
            >
              Live Demo
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Next-Generation Personal Finance & Expense Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Take control of <span className="text-emerald-600 dark:text-emerald-400">every pound</span> you spend.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Masrof helps you track your spending, plan your budget, and understand your financial habits — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition cursor-pointer text-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl font-semibold shadow-sm transition text-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>See How It Works</span>
            </button>
          </div>

          {/* Interactive UI Mockup Hero Showcase */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl p-2 bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/60 dark:border-slate-700/60 shadow-2xl">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden text-left p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Balance</span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">£12,450.00</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      +4.8% this month
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/50">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Connected via Open Banking</span>
                  </span>
                </div>
              </div>

              {/* Mini cards sample */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Total Income</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">£4,500.00</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Total Expenses</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">£2,310.45</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Remaining Budget</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">£1,189.55</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400">Net Savings</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">£2,189.55</p>
                </div>
              </div>

              {/* Sample transactions preview */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Feed</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/50 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center">A</div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Amazon</p>
                        <p className="text-[11px] text-slate-400">Shopping • Today</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">-£74.50</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/50 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 font-bold flex items-center justify-center">S</div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Spotify</p>
                        <p className="text-[11px] text-slate-400">Subscriptions • Yesterday</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">-£10.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Features */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything you need for total financial clarity
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Built on modern fintech standards with real database persistence, envelope budgeting, and bank-grade privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-5">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real Bank Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Connect checking, vault savings, and credit cards via Open Banking. Automatic transaction imports without storing bank credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-5">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Proactive Budgeting</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Set monthly targets for Food, Shopping, Bills, and Transport. Visual warning indicators at 80% and instant alerts if you exceed limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spending Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Interactive charts, month-over-month comparisons, detected recurring subscriptions, and largest purchases rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How Masrof Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Simple 4-Step Flow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              From connection to complete financial control
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign in securely with Google or email and set your target income and currency.',
              },
              {
                step: '02',
                title: 'Connect Bank',
                desc: 'Select your institution. Masrof connects read-only via standard Open Banking protocol.',
              },
              {
                step: '03',
                title: 'Auto-Categorize',
                desc: 'Every transaction is analyzed, categorized, and assigned to your monthly budget envelopes.',
              },
              {
                step: '04',
                title: 'Understand Habits',
                desc: 'See real-time remaining cash, identify subscription creep, and achieve your savings goals.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative"
              >
                <span className="text-3xl font-black text-emerald-600/30 dark:text-emerald-400/20">{s.step}</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">{s.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Security Section */}
      <section id="security" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Bank-grade security & privacy by design
            </h2>
            <p className="mt-3 text-sm text-emerald-200 max-w-xl mx-auto">
              Your financial data is protected with the highest industry standards. Masrof was engineered so your credentials never touch our servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/60">
              <Lock className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="font-bold text-base">Zero Password Storage</h3>
              <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
                We never ask for or store your bank credentials. Authorizations are completed directly on your bank’s regulated portal.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/60">
              <Shield className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="font-bold text-base">AES-256 Encryption</h3>
              <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
                All synchronization tokens and database connections are encrypted at rest with AES-256 and transit-protected with TLS 1.3.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/60">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="font-bold text-base">Read-Only Safeguards</h3>
              <p className="text-xs text-emerald-200/80 mt-2 leading-relaxed">
                Masrof has strict read-only access. It is technically impossible for anyone to move, debit, or transfer money from your accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Placeholder */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Simple Pricing
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            Free during public preview
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Enjoy full access to unlimited bank connections, budget planning, AI assistant insights, and monthly report exports.
          </p>

          <div className="mt-12 max-w-md mx-auto p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-emerald-500/60 shadow-xl text-left">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Masrof Premium Free</h3>
                <p className="text-xs text-slate-500">All features included</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">£0</span>
                <span className="text-xs text-slate-400"> / forever</span>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {[
                'Unlimited Open Banking connections',
                'Automatic transaction imports & categorization',
                'Custom envelope budgets with threshold alerts',
                'AI financial assistant powered by Gemini',
                'Monthly report generation (CSV & PDF)',
                'Bank-grade 256-bit encryption',
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onGetStarted}
              className="w-full mt-8 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition cursor-pointer text-xs"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              FAQ
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-white hover:text-emerald-600 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Masrof</span>
            <span className="text-slate-400">— Know where your money goes.</span>
          </div>

          <p>© {new Date().getFullYear()} Masrof. All rights reserved. Read-only financial management.</p>
        </div>
      </footer>
    </div>
  );
};
