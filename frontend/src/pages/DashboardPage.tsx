import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  ShieldAlert,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';

const CATEGORY_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#a855f7',
  '#64748b', '#3b82f6', '#84cc16', '#eab308'
];

export function DashboardPage() {
  const {
    analytics,
    transactions,
    bills,
    savingsGoals,
    currency,
    user,
    setActivePage,
  } = useApp();

  const [timeView, setTimeView] = useState<'7days' | 'monthly'>('7days');

  const dailyLimit = user?.dailySpendingLimit || 400;
  const todayExpense = analytics?.todayExpense || 0;
  const isDailyOver = todayExpense > dailyLimit;
  const dailyPercent = Math.round((todayExpense / dailyLimit) * 100);

  const upcomingBills = bills.filter((b) => !b.isPaid).slice(0, 3);
  const recentTransactions = transactions.slice(0, 6);
  const annualMonths = analytics?.monthlyTrends.filter((month) =>
    month.monthKey.startsWith(String(new Date().getFullYear()))
  ) || [];
  const yearlyIncome = analytics?.thisYearIncome || 0;
  const yearlyExpenses = analytics?.thisYearExpense || 0;
  const yearlySavings = analytics?.thisYearSavings || 0;
  const pocketMoneyMonths = annualMonths.map((month) => ({
    ...month,
    pocketMoneyIncome: month.pocketMoneyIncome || 0,
  }));
  const highestPocketMoneyMonth = Math.max(
    1,
    ...pocketMoneyMonths.map((month) => month.pocketMoneyIncome),
  );
  const savingsPlanTotal = savingsGoals.reduce(
    (total, goal) => total + (Number(goal.currentAmount) || 0),
    0,
  );
  const savingsPlanTarget = savingsGoals.reduce(
    (total, goal) => total + (Number(goal.targetAmount) || 0),
    0,
  );
  const savingsPlanProgress = savingsPlanTarget > 0
    ? Math.min(100, Math.round((savingsPlanTotal / savingsPlanTarget) * 100))
    : 0;
  const yearlySavingsRate = yearlyIncome > 0 ? Math.round((yearlySavings / yearlyIncome) * 100) : 0;
  const monthlySavingsRate = analytics && analytics.thisMonthIncome > 0
    ? Math.round((analytics.thisMonthSavings / analytics.thisMonthIncome) * 100)
    : 0;

  const chartData =
    timeView === '7days'
      ? (analytics?.last7Days || []).map((d) => ({
          label: d.day,
          income: d.income,
          expense: d.expense,
        }))
      : (analytics?.monthlyTrends || []).map((m) => ({
          label: m.month,
          income: m.income,
          expense: m.expense,
        }));

  return (
    <div className="dashboard-page space-y-6 pb-12">
      <section className="dashboard-welcome">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/20">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              Your personal money space
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name?.split(' ')[0] || 'there'}!
            </h2>
            <p className="mt-2 max-w-xl text-base">
              Here is your money at a glance. Check your spending, plan what is next, and keep moving toward your goals.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage('add-expense')}
              className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-emerald-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add an expense</span>
            </button>
            <button
              onClick={() => setActivePage('transactions')}
              className="rounded-xl bg-white/12 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              View activity <ChevronRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      {/* Daily spending limit alert */}
      {isDailyOver ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-rose-300 dark:border-rose-900/80 bg-gradient-to-r from-rose-50 via-rose-50/60 to-red-50/80 dark:from-rose-950/60 dark:via-rose-950/40 dark:to-red-950/40 text-rose-900 dark:text-rose-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5 sm:mt-0 ring-4 ring-rose-600/10">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-rose-950 dark:text-rose-50">
                    Daily spending limit reached
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 font-bold font-mono tracking-tight">
                    {dailyPercent}% of {currency}{dailyLimit}
                  </span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                  Today's spending reached <strong className="font-mono tabular-nums text-rose-950 dark:text-rose-100">{currency}{todayExpense.toLocaleString('en-IN')}</strong> ({currency}{(todayExpense - dailyLimit).toLocaleString('en-IN')} above your daily spending limit).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePage('transactions')}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
            >
              See today's spending
            </button>
          </div>

          {/* Visual Gauge Bar */}
          <div className="mt-3.5 pt-3 border-t border-rose-200/70 dark:border-rose-900/50">
            <div className="flex justify-between text-[11px] font-mono text-rose-800/80 dark:text-rose-300 mb-1">
              <span>{currency}0</span>
              <span className="font-bold">{currency}200</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">Limit: {currency}{dailyLimit}</span>
              <span className="font-extrabold text-rose-700 dark:text-rose-200">Current: {currency}{todayExpense}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-rose-200/80 dark:bg-rose-900/60 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(dailyPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : dailyPercent >= 80 ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 dark:border-amber-900/80 bg-gradient-to-r from-amber-50 via-amber-50/60 to-orange-50/80 dark:from-amber-950/60 dark:via-amber-950/40 dark:to-orange-950/40 text-amber-900 dark:text-amber-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 ring-4 ring-amber-500/10">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight">                  Getting close to today's limit</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold font-mono">
                    {dailyPercent}% used
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  You've spent <strong className="font-mono tabular-nums">{currency}{todayExpense.toLocaleString('en-IN')}</strong> of {currency}{dailyLimit} today ({currency}{(dailyLimit - todayExpense).toLocaleString('en-IN')} remaining).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePage('add-expense')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg whitespace-nowrap shadow-xs transition-colors"
            >
              Track Expense
            </button>
          </div>
        </div>
      ) : null}

      {/* 4 Core Financial KPI Metric Cards with Modern Surface Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Balance */}
        <div className="fin-card fin-card-interactive dashboard-metric-indigo p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2.5">
            <span className="font-semibold tracking-wide uppercase text-[11px]">Current balance</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {currency}{analytics ? analytics.totalBalance.toLocaleString('en-IN') : '0'}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Total received minus total spent</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="fin-card fin-card-interactive dashboard-metric-emerald p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2.5">
            <span className="font-semibold tracking-wide uppercase text-[11px]">Money in this month</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{currency}{analytics ? analytics.thisMonthIncome.toLocaleString('en-IN') : '0'}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Money added this month</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="fin-card fin-card-interactive dashboard-metric-rose p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2.5">
            <span className="font-semibold tracking-wide uppercase text-[11px]">Spent this month</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {currency}{analytics ? analytics.thisMonthExpense.toLocaleString('en-IN') : '0'}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Daily food, travel & bills</span>
          </div>
        </div>

        {/* Total Saved */}
        <div className="fin-card fin-card-interactive dashboard-metric-violet p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2.5">
            <span className="font-semibold tracking-wide uppercase text-[11px]">Saved for goals</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
            {currency}{analytics ? analytics.totalSaved.toLocaleString('en-IN') : '0'}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>Money set aside in your savings plans</span>
          </div>
        </div>
      </div>

      <section
        className="fin-card dashboard-pocket-money rounded-2xl p-5 sm:p-6"
        aria-labelledby="pocket-money-heading"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 id="pocket-money-heading" className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  Pocket money tracker
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  See what you received and how your savings are growing.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/75 p-4 dark:bg-slate-900/45">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Received this month</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {currency}{(analytics?.thisMonthPocketMoney || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-xl bg-white/75 p-4 dark:bg-slate-900/45">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Received this year</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
                  {currency}{(analytics?.thisYearPocketMoney || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Add each allowance when you receive it. It is counted here from income marked “Pocket Money” or “Monthly Allowance.”
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActivePage('add-income')}
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Add pocket money
              </button>
              <button
                onClick={() => setActivePage('savings-goals')}
                className="rounded-xl border border-emerald-300 bg-white/70 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900/45 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
              >
                View savings plans
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 lg:max-w-2xl">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">Pocket money by month</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Each bar shows what you logged that month.</p>
              </div>
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                Saved in plans: {currency}{savingsPlanTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex h-36 items-end gap-1.5 rounded-xl bg-white/60 px-3 pt-3 dark:bg-slate-900/35 sm:gap-2">
              {pocketMoneyMonths.map((month) => {
                const barHeight = month.pocketMoneyIncome > 0
                  ? Math.max(8, (month.pocketMoneyIncome / highestPocketMoneyMonth) * 100)
                  : 3;
                return (
                  <div
                    key={month.monthKey}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                    title={`${month.month}: ${currency}${month.pocketMoneyIncome.toLocaleString('en-IN')}`}
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className={`w-full rounded-t-md ${month.monthKey === new Date().toISOString().slice(0, 7) ? 'bg-emerald-600' : 'bg-emerald-300 dark:bg-emerald-700'}`}
                        style={{ height: `${barHeight}%` }}
                        role="img"
                        aria-label={`${month.month}: ${currency}${month.pocketMoneyIncome.toLocaleString('en-IN')}`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{month.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span>{savingsPlanTarget > 0 ? `${savingsPlanProgress}% of savings-plan goals reached` : 'Create a savings plan to track your progress.'}</span>
              {savingsPlanTarget > 0 && (
                <span>{currency}{savingsPlanTotal.toLocaleString('en-IN')} / {currency}{savingsPlanTarget.toLocaleString('en-IN')}</span>
              )}
            </div>
            {savingsPlanTarget > 0 && (
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60"
                role="progressbar"
                aria-label="Savings plan goal progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={savingsPlanProgress}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                  style={{ width: `${savingsPlanProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Money left this month and yearly totals">
        <div className="fin-card dashboard-metric-emerald dashboard-insight-monthly rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Money left this month</p>
              <p className={`mt-2 text-3xl font-extrabold tabular-nums ${analytics && analytics.thisMonthSavings < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
                {analytics && analytics.thisMonthSavings < 0 ? '-' : ''}{currency}{Math.abs(analytics?.thisMonthSavings || 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {analytics && analytics.thisMonthSavings < 0 ? 'You spent more than you received this month.' : 'Money received this month minus money spent.'}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 px-4 py-3 text-right dark:bg-slate-900/40">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Monthly savings rate</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{monthlySavingsRate}%</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Received</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{currency}{(analytics?.thisMonthIncome || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Spent</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{currency}{(analytics?.thisMonthExpense || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="fin-card dashboard-metric-violet dashboard-insight-yearly rounded-2xl p-5 sm:p-6">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Your year so far</p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
            {yearlySavings < 0 ? '-' : ''}{currency}{Math.abs(yearlySavings).toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {yearlySavings < 0 ? `Spent more than received · ${yearlySavingsRate}% of income` : `Saved this year · ${yearlySavingsRate}% of income`}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Received this year</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{currency}{yearlyIncome.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Spent this year</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{currency}{yearlyExpenses.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow & Trends Chart (2 Columns) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl fin-card dashboard-chart-card flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Money in vs. money out</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                See how much money you receive and spend over time.
              </p>
            </div>
            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setTimeView('7days')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeView === '7days'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Past 7 days
              </button>
              <button
                onClick={() => setTimeView('monthly')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeView === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                This year
              </button>
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timeView === 'monthly' ? (
                <BarChart data={annualMonths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${currency}${value}`} />
                  <Tooltip
                    formatter={(value, name) => [`${currency}${Number(value).toLocaleString('en-IN')}`, String(name)]}
                    labelFormatter={(label, payload) => {
                      const month = payload?.[0]?.payload;
                      return `${label} · saved ${currency}${Number(month?.net || 0).toLocaleString('en-IN')} (${month?.savingsRate || 0}%)`;
                    }}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '13px' }}
                  />
                  <Bar dataKey="income" name="Received" fill="#10b981" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="expense" name="Spent" fill="#6366f1" radius={[5, 5, 0, 0]} />
                </BarChart>
              ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0', strokeDasharray: '3 3' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Inflow"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorInc)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Outflow"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-indigo-600/20" />
              <span>Expense</span>
            </div>
          </div>
          {timeView === 'monthly' && (
            <div className="mt-5 overflow-x-auto border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Saved each month</h3>
              <table className="w-full min-w-[660px] text-xs">
                <thead className="text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-2 py-2 text-left">Month</th>
                    <th className="px-2 py-2 text-right">Received</th>
                    <th className="px-2 py-2 text-right">Spent</th>
                    <th className="px-2 py-2 text-right">Saved / over</th>
                    <th className="px-2 py-2 text-right">Saved %</th>
                  </tr>
                </thead>
                <tbody>
                  {annualMonths.map((month) => (
                    <tr key={month.monthKey} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-2 py-2 text-left font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(`${month.monthKey}-01T12:00:00`).toLocaleDateString('en-IN', { month: 'long' })}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{currency}{month.income.toLocaleString('en-IN')}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{currency}{month.expense.toLocaleString('en-IN')}</td>
                      <td className={`px-2 py-2 text-right font-semibold tabular-nums ${month.net < 0 ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-300'}`}>
                        {month.net < 0 ? '-' : ''}{currency}{Math.abs(month.net).toLocaleString('en-IN')}
                      </td>
                      <td className={`px-2 py-2 text-right font-semibold tabular-nums ${month.savingsRate < 0 ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-300'}`}>
                        {month.savingsRate ?? 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Spending Breakdown (1 Column) */}
        <div className="p-5 sm:p-6 rounded-2xl fin-card dashboard-category-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Spending by group
              </h2>
              <button
                onClick={() => setActivePage('categories')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                View all →
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              What you spent money on this month.
            </p>

            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.categoryPercentages.slice(0, 5) || []}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(analytics?.categoryPercentages.slice(0, 5) || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Top group</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {analytics?.categoryPercentages[0]?.name.slice(0, 10) || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {(analytics?.categoryPercentages.slice(0, 4) || []).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[170px]">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {currency}{cat.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 text-[11px] w-9 text-right">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 columns) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl fin-card dashboard-activity-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Recent Activity</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {recentTransactions.length} items
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your latest income and expense activity
              </p>
            </div>
            <button
              onClick={() => setActivePage('transactions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
            >
              <span>See all activity</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No transactions recorded yet.</div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id || tx._id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 px-2.5 rounded-xl transition-all"
                >
                  <div className="min-w-0 flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-300/40 dark:ring-slate-700/40'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{tx.category}</span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">{tx.paymentMethod}</span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                        <span>{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-extrabold font-mono tabular-nums tracking-tight ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{currency}{Number(tx.amount).toLocaleString('en-IN')}
                    </div>
                    {tx.merchant && (
                      <span className="text-[10px] text-slate-400 truncate block max-w-[130px] font-medium">
                        {tx.merchant}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bills & Quick Actions (1 column) */}
        <div className="space-y-6">
          {/* Upcoming Bills */}
          <div className="p-5 sm:p-6 rounded-2xl fin-card dashboard-bills-card">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Upcoming Bills
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Due dates for rent, Wi-Fi & recharges
                </p>
              </div>
              <button
                onClick={() => setActivePage('bills')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                All Bills →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBills.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  All scheduled bills paid!
                </div>
              ) : (
                upcomingBills.map((bill) => (
                  <div
                    key={bill.id || bill._id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                        {bill.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          Due {new Date(bill.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100 block tabular-nums">
                        {currency}{Number(bill.amount).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => setActivePage('bills')}
                        className="mt-1.5 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800/80 active:scale-95 shadow-2xs"
                      >
                        Pay or review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 sm:p-6 rounded-2xl fin-card dashboard-actions-card">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">
              Quick actions
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActivePage('add-expense')}
                className="p-3 text-left rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Add Expense
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Daily meal or bill
                </span>
              </button>

              <button
                onClick={() => setActivePage('add-income')}
                className="p-3 text-left rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-900 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Add Income
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Stipend or pocket $
                </span>
              </button>

              <button
                onClick={() => setActivePage('budgets')}
                className="p-3 text-left rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Set Budgets
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  80% limit alerts
                </span>
              </button>

              <button
                onClick={() => setActivePage('ai-advisor')}
                className="p-3 text-left rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-900 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/70 text-violet-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block flex items-center gap-1">
                  AI Advisor
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Ask budget advice
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
