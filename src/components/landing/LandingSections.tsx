import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Sliders, 
  ChevronDown, 
  Lock, 
  Sparkles, 
  Receipt, 
  Wallet,
  AlertTriangle,
  Zap,
  DollarSign
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const HeroSection: React.FC = () => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[360px] bg-[#5145E5]/12 dark:bg-[#5145E5]/18 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Product Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5145E5]/10 dark:bg-[#5145E5]/20 border border-[#5145E5]/20 text-[#5145E5] dark:text-[#A5A0FF] text-xs font-semibold tracking-wide uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5145E5] dark:bg-[#A5A0FF]" />
          <span>PERSONAL FINANCE, MADE SIMPLE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-[#151A2D] dark:text-[#F4F6FF] max-w-4xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
          Your money. <span className="text-[#5145E5] dark:text-[#A5A0FF]">Your clarity.</span> Your control.
        </h1>

        {/* Supporting description */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-[#64748B] dark:text-[#A3AEC7] max-w-2xl mx-auto leading-relaxed px-2">
          Track everyday expenses, stay on budget, and understand your spending with a simple, secure expense management experience.
        </p>

        {/* Action CTAs: Get Started Free & Sign In */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-800 dark:text-white glass-card hover:bg-slate-100/80 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Sign In</span>
          </Link>

          <button
            type="button"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Explore Capabilities ↓</span>
          </button>
        </div>

        {/* Product Dashboard Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="p-2.5 sm:p-3.5 bg-gradient-to-b from-indigo-500/15 via-slate-400/10 to-purple-500/15 dark:from-indigo-500/20 dark:via-white/5 dark:to-purple-500/20 rounded-3xl border border-indigo-500/25 dark:border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mockup Dashboard Window */}
            <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden text-left relative z-10 shadow-lg">
              {/* Window Header */}
              <div className="h-11 px-4 bg-slate-100/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/90 shadow-2xs" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-2xs" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-2xs" />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                  <span>cloudspend.app/dashboard</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-sans font-semibold">Active Ledger</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Mockup Content Grid */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Stat cards row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Month Expenses</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono-nums mt-1">$393.65</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">46% of monthly ceiling</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Monthly Budget</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono-nums mt-1">$850.00</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Set for current cycle</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Remaining Budget</span>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono-nums mt-1">$456.35</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">$15.21 daily allowance</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Transactions Logged</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono-nums mt-1">7 Entries</p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 block">All categories verified</span>
                  </div>
                </div>

                {/* Progress bar preview */}
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Budget Pacing & Consumption</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">46% Used</span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500" style={{ width: '46%' }} />
                  </div>
                </div>

                {/* Preview transactions */}
                <div className="border border-slate-200/70 dark:border-white/5 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-white/5 border-b border-slate-200/70 dark:border-white/5 flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>Recent Transactions</span>
                    <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Itemized Ledger</span>
                  </div>
                  <div className="divide-y divide-slate-200/70 dark:divide-white/5 text-xs">
                    <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">🛒</div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Organic Grocery Restock</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Groceries · Credit Card</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono-nums">-$85.50</span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">⚡</div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">High-speed Fiber Internet</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Bills & Utilities · Net Banking</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono-nums">-$68.00</span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">☕</div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Espresso & Croissant</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Food · UPI</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono-nums">-$14.25</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Real-Time Expense Tracking',
      desc: 'Add, categorize, and track daily spending in seconds with structured payment methods and note attachments.',
      icon: Receipt,
    },
    {
      title: 'Smart Monthly Budgets',
      desc: 'Set custom spending limits per calendar cycle with automated 80% cautionary and 100% danger pacing thresholds.',
      icon: Sliders,
    },
    {
      title: 'Spending Breakdown Analytics',
      desc: 'Visualize financial allocation with interactive category donut charts and daily spending trendlines.',
      icon: PieChart,
    },
    {
      title: 'Audit-Ready PDF Reports',
      desc: 'Generate complete, itemized PDF expense statements directly in your browser with category summaries and stats.',
      icon: FileText,
    },
    {
      title: 'Cryptographic Privacy',
      desc: 'Strict multi-tenant security with bcrypt password hashing and server-side JWT ownership verification.',
      icon: Lock,
    },
    {
      title: 'Fast Serverless Architecture',
      desc: 'Lightweight AWS Lambda execution model paired with cloud-native MongoDB Atlas database storage.',
      icon: Zap,
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 sm:scroll-mt-24 py-20 bg-slate-50/50 dark:bg-transparent border-t border-slate-200/80 dark:border-white/10 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <span>Capabilities</span>
          </div>
          <p className="mt-1 text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for simplicity and financial clarity
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Every tool you need to track personal or household expenses without unnecessary bloat or complex accounting jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="glass-card glass-card-hover p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20 shadow-xs group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create Your Account',
      desc: 'Register in seconds with your name, email, and preferred currency. Each account is completely private and secure.',
    },
    {
      num: '02',
      title: 'Record Daily Expenses',
      desc: 'Log expenses with amount, category, date, and payment method. Filter and search anytime.',
    },
    {
      num: '03',
      title: 'Establish Your Budget',
      desc: 'Set a monthly budget ceiling to track real-time pacing with clear 80% and 100% threshold indicators.',
    },
    {
      num: '04',
      title: 'Gain Actionable Clarity',
      desc: 'Examine spending breakdown charts and download verified PDF reports for your archives or reimbursements.',
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 sm:scroll-mt-24 py-20 border-t border-slate-200/80 dark:border-white/10 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <span>Workflow</span>
          </div>
          <p className="mt-1 text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            How CloudSpend Works
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            A seamless four-step flow designed for swift everyday financial logging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="glass-card glass-card-hover p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 relative transition-all duration-300 hover:-translate-y-1 group"
            >
              <span className="text-4xl font-heading font-black text-indigo-500/20 dark:text-indigo-400/20 group-hover:text-indigo-500/40 transition-colors block mb-3 font-mono">
                {step.num}
              </span>
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {step.title}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      title: 'Proactive Budget Guardrails',
      subtitle: 'Never Get Caught by Surprise',
      desc: 'Automatic 80% cautionary and 100% danger pacing thresholds keep you alert well before month-end, calculating daily safe-to-spend allowances.',
      badge: 'Budget Pacing',
    },
    {
      title: 'Cryptographic Multi-Tenant Privacy',
      subtitle: 'Strict User-Scoped Isolation',
      desc: 'Passwords salted with bcrypt, stateless signed JWT sessions, and zero third-party marketing trackers or ad beacons. Your data stays yours.',
      badge: 'Privacy by Design',
    },
    {
      title: 'Audit-Ready Client-Side Reports',
      subtitle: 'Instant PDF Statements',
      desc: 'Generate complete, itemized PDF expense statements directly in your browser with categorical percentage tables, totals, and print pagination.',
      badge: 'Zero Server Storage',
    },
    {
      title: 'Multi-Currency Flexibility',
      subtitle: 'Personalized to Your Economy',
      desc: 'Switch between USD ($), INR (₹), EUR (€), GBP (£), CAD ($), and AUD ($) with instant locale formatting and tabular monospace figures.',
      badge: '6 Major Currencies',
    },
    {
      title: 'Actionable Spending Visualizations',
      subtitle: 'Clear Habit Analytics',
      desc: 'Interactive category donut charts and day-by-day velocity curves provide clarity on where your discretionary funds are allocated.',
      badge: 'Visual Analytics',
    },
    {
      title: 'Frictionless Everyday Logging',
      subtitle: 'Speed & Responsive Design',
      desc: 'Designed for fluid usage on mobile phones, tablets, laptops, and desktop screens with seamless instant dark and light mode synchronization.',
      badge: 'Fully Responsive',
    },
  ];

  return (
    <section id="benefits" className="scroll-mt-20 sm:scroll-mt-24 py-20 border-t border-slate-200/80 dark:border-white/10 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <span>Benefits</span>
          </div>
          <p className="mt-1 text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Thousands Choose CloudSpend
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineered to remove the friction from daily expense tracking, giving you total command over your financial trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="glass-card glass-card-hover p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/30">
                    {b.badge}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {b.subtitle}
                </p>
                <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BudgetingSection: React.FC = () => {
  return (
    <section id="budgeting" className="scroll-mt-20 sm:scroll-mt-24 py-20 border-t border-slate-200/80 dark:border-white/10 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <span>Budget Control</span>
            </div>
            <h3 className="mt-1 text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Visual pacing with proactive warning thresholds
            </h3>
            <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Traditional spreadsheets only tell you what happened after the month ends. CloudSpend calculates real-time pacing from your stored transactions and alerts you at key milestones.
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Healthy Pacing (0% – 79%)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Calculates your remaining daily allowance so you can spend with peace of mind.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Caution Zone (80% – 99%)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Visual warning indicator highlights that your allocated threshold is approaching exhaustion.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Ceiling Exceeded (100%+)</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Immediate danger alert details exactly how much you have overspent.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-5 shadow-sm">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Healthy Range (46%)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">$393 / $850</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: '46%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-amber-600 dark:text-amber-400">Caution Range (84%)</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">$714 / $850</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '84%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-rose-600 dark:text-rose-400">Over-Budget Range (108%)</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">$920 / $850</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ReportsSection: React.FC = () => {
  return (
    <section id="reports" className="scroll-mt-20 sm:scroll-mt-24 py-20 bg-slate-50/50 dark:bg-transparent border-t border-slate-200/80 dark:border-white/10 transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">CloudSpend Expense Statement</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">PDF Engine</span>
              </div>

              <div className="text-xs space-y-2.5 text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Branded header with account holder and date range metadata</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>High-level statistical summaries (Total, Count, Avg, Budget)</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Structured category allocation table with percentages</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Itemized transaction details with date and payment method</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-page pagination and clean tabular formatting</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                100% Client-Side Generation — Zero Server Storage Required
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <span>Audit & Documentation</span>
            </div>
            <h3 className="mt-1 text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
              Export verified PDF expense reports
            </h3>
            <p className="mt-4 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Need to submit expense reports for tax filing, work reimbursements, or personal bookkeeping? CloudSpend generates complete PDF expense statements directly in your web browser.
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Because reports are compiled on the client device using jsPDF and jspdf-autotable, no documents are uploaded to cloud buckets or third-party servers. Your personal finance records remain strictly yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SecuritySection: React.FC = () => {
  return (
    <section className="py-20 bg-[#070B14] text-white border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Security & Tenant Privacy by Design
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Engineered with strict multi-tenant data isolation and cryptographic safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="text-sm font-bold text-white">bcrypt Password Hashing</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Passwords are salted and hashed before entering database storage. Plaintext credentials are never logged or stored.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="text-sm font-bold text-white">Server-Side JWT Ownership Checks</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              All expense and budget queries verify the JWT token payload. User A cannot view, mutate, or delete User B's records.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
            <h3 className="text-sm font-bold text-white">Zero Third-Party Trackers</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Zero ad beacons, zero third-party telemetry, and zero marketing pixel scripts. Minimalist, transparent architecture.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      q: 'How does CloudSpend keep operating costs low?',
      a: 'The application architecture relies on serverless execution with AWS Lambda Function URLs and MongoDB Atlas Free Tier. PDF reports are generated client-side inside the browser using jsPDF, removing the need for server-side rendering engines or paid cloud file buckets.',
    },
    {
      q: 'Can other users access or view my expenses?',
      a: 'No. The backend enforces strict ownership validation via verified JSON Web Tokens (JWT). Every query specifically checks the authenticated user’s ID before returning or modifying any database document.',
    },
    {
      q: 'What happens when I reach 80% or 100% of my monthly budget?',
      a: 'CloudSpend immediately triggers visual in-app warning states on your dashboard and budget progress bars. You get clear warning indicators without relying on costly SMS or third-party email gateways.',
    },
    {
      q: 'Can I export my expense data?',
      a: 'Yes. You can download comprehensive, formatted PDF expense reports anytime for the current month, previous month, all time, or custom date ranges.',
    },
    {
      q: 'How is my financial data protected?',
      a: 'Every user account is cryptographically isolated using bcrypt salted password hashing, stateless signed JWT sessions, and strict user-scoped database queries. CloudSpend does not share or sell your financial transaction history.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 sm:scroll-mt-24 py-20 border-t border-slate-200/80 dark:border-white/10 transition-colors relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <span>Help & Guidance</span>
          </div>
          <p className="mt-1 text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="glass-card border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/80 dark:border-white/10 pt-3.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-slate-200/80 dark:border-white/10 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            · Smart Expense Management & Budget Tracking
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
          Take control of your money, one expense at a time. Built for privacy, speed, and clarity.
        </p>
      </div>
    </footer>
  );
};

// Backwards-compatible aliases
export { BudgetingSection as BudgetTrackingSection, ReportsSection as PdfFeatureSection };

