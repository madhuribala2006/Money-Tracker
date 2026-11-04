import React from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function FinancialHealthPage() {
  const { analytics, budgets, bills, savingsGoals, currency, user, setActivePage } = useApp();

  const dailyLimit = user?.dailySpendingLimit || 400;
  const todayExpense = analytics?.todayExpense || 0;
  const isDailyOver = todayExpense > dailyLimit;

  // 1. Daily Discipline Score (25 pts)
  const dailyDisciplineScore = isDailyOver ? 12 : 25;

  // 2. Savings Rate Score (25 pts)
  const income = analytics?.thisMonthIncome || 1;
  const expense = analytics?.thisMonthExpense || 0;
  const savingsRate = Math.max(0, (income - expense) / income);
  const savingsScore = Math.min(25, Math.round(savingsRate * 50));

  // 3. Budget Adherence Score (20 pts)
  const overBudgetsCount = budgets.filter((b) => b.isOverBudget).length;
  const budgetScore = Math.max(0, 20 - overBudgetsCount * 8);

  // 4. Bill Promptness Score (15 pts)
  const overdueCount = bills.filter((b) => !b.isPaid && new Date(b.dueDate).getTime() < Date.now()).length;
  const billScore = overdueCount === 0 ? 15 : Math.max(0, 15 - overdueCount * 7);

  // 5. Emergency Cushion Score (15 pts)
  const emergencyGoals = savingsGoals.filter((g) => g.category.toLowerCase().includes('emergency') || g.title.toLowerCase().includes('cushion'));
  const emergencySaved = emergencyGoals.reduce((s, g) => s + Number(g.currentAmount), 0);
  const monthlyIncomeTarget = user?.monthlyAllowance || (user?.dailySpendingLimit || 400) * 30;
  const emergencySavingsTarget = Math.max(monthlyIncomeTarget * 0.5, 1);
  const emergencyScore = emergencySaved >= emergencySavingsTarget
    ? 15
    : Math.min(15, Math.round((emergencySaved / emergencySavingsTarget) * 15));

  const overallHealthScore = Math.min(100, dailyDisciplineScore + savingsScore + budgetScore + billScore + emergencyScore);

  const getTier = (score: number) => {
    if (score >= 85) return { grade: 'Great', label: 'You are doing well', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/60' };
    if (score >= 70) return { grade: 'Good', label: 'Keep it up', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/60' };
    if (score >= 55) return { grade: 'Getting there', label: 'A few things to improve', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/60' };
    return { grade: 'Needs work', label: 'Small steps can help', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/60' };
  };

  const tier = getTier(overallHealthScore);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Your money check-up</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            A quick look at how you are doing with spending, saving, and paying bills.
          </p>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Circle score representation */}
            <div className="w-28 h-28 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-8 border-indigo-600 transition-all duration-700"
                style={{
                  clipPath: `polygon(50% 50%, -50% -50%, ${overallHealthScore}% -50%, ${overallHealthScore}% 150%, -50% 150%)`,
                }}
              />
              <div className="text-center z-10">
                <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {overallHealthScore}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">/100</span>
              </div>
            </div>
          </div>

          <div>
            <div className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md ${tier.bg} ${tier.color} mb-1.5`}>
              {tier.grade} · {tier.label}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Your money score
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
              This score is based on the spending, savings, limits, and bills you have added to the app.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <button
            onClick={() => setActivePage('budgets')}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>Review spending limits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Component Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Component 1: Daily Discipline */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              1. Daily Spending Limit
            </span>
            <span className="font-mono font-bold text-indigo-600">{dailyDisciplineScore} of 25 points</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(dailyDisciplineScore / 25) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">
            {isDailyOver ? 'Today is above your daily limit. Review recent spending.' : 'Your spending is within the daily limit.'}
          </p>
        </div>

        {/* Component 2: Savings Rate */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              2. Money saved this month
            </span>
            <span className="font-mono font-bold text-emerald-600">{savingsScore} of 25 points</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(savingsScore / 25) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">
            You saved {Math.round(savingsRate * 100)}% of the money you received this month.
          </p>
        </div>

        {/* Component 3: Budget Adherence */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              3. Spending limits
            </span>
            <span className="font-mono font-bold text-amber-600">{budgetScore} of 20 points</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: `${(budgetScore / 20) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">
            {overBudgetsCount === 0 ? 'All spending groups are within their limits.' : `${overBudgetsCount} groups are over their monthly limit.`}
          </p>
        </div>

        {/* Component 4: Bill Promptness */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              4. Bills paid on time
            </span>
            <span className="font-mono font-bold text-indigo-600">{billScore} of 15 points</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(billScore / 15) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">
            {            overdueCount === 0 ? 'No bills are late.' : `${overdueCount} bills are late.`}
          </p>
        </div>

        {/* Component 5: Emergency Cushion */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              5. Emergency savings
            </span>
            <span className="font-mono font-bold text-emerald-600">{emergencyScore} of 15 points</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(emergencyScore / 15) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">
            You have saved {currency}{emergencySaved.toLocaleString('en-IN')} for emergencies.
          </p>
        </div>
      </div>

      {/* Practical money-saving tips */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Easy ways to save</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              1. Check shared payments
            </span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Check whether you and your family are paying for the same app or service more than once.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              2. Look for discounts
            </span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Ask your school or workplace if they offer lower prices for services you use.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              3. Compare travel costs
            </span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Compare the cost of the bus, train, driving, and ride apps before you travel.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              4. Wait before buying
            </span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Add something you want to your wish list and wait 48 hours before buying it. You may decide you do not need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
