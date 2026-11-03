import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  CreditCard,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export function AnalyticsPage() {
  const { analytics, transactions, currency, user } = useApp();

  const dailyLimit = user?.dailySpendingLimit || 400;
  const totalExpense = analytics?.totalExpense || 0;
  const averageDailySpend = Math.round((analytics?.thisMonthExpense || 0) / (new Date().getDate() || 1));

  // Compute payment method distribution
  const paymentMethodCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const pm = tx.paymentMethod || 'UPI';
      paymentMethodCounts[pm] = (paymentMethodCounts[pm] || 0) + Number(tx.amount);
    }
  });

  const paymentData = Object.entries(paymentMethodCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Day of week distribution
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const day = new Date(tx.date).getDay();
      dayTotals[day] += Number(tx.amount);
    }
  });

  const weekdayData = dayNames.map((name, i) => ({
    day: name,
    spent: dayTotals[i],
  }));
  const busiestDayIndex = dayTotals.indexOf(Math.max(...dayTotals));
  const busiestDay = totalExpense > 0 ? dayNames[busiestDayIndex] : 'No spending yet';

  const placeTotals: Record<string, { amount: number; count: number; category: string }> = {};
  transactions.forEach((tx) => {
    if (tx.type !== 'expense' || !tx.merchant?.trim()) return;
    const place = tx.merchant.trim();
    if (!placeTotals[place]) {
      placeTotals[place] = { amount: 0, count: 0, category: tx.category };
    }
    placeTotals[place].amount += Number(tx.amount);
    placeTotals[place].count += 1;
  });
  const topPlaces = Object.entries(placeTotals)
    .map(([name, details]) => ({ name, ...details }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const schoolExpenses = transactions
    .filter((tx) => tx.type === 'expense' && (tx.isEducational || tx.category === 'Education fees'))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Where your money goes
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          See what you spend money on, how you pay, and how spending changes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Average spent each day</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {currency}{averageDailySpend}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <span className={`text-[11px] mt-1 block font-medium ${averageDailySpend > dailyLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
            {averageDailySpend > dailyLimit ? `Above your ${currency}${dailyLimit} daily limit` : `Within your ${currency}${dailyLimit} daily limit`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Paid with UPI</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {totalExpense > 0 ? Math.round(((paymentMethodCounts['UPI'] || 0) / totalExpense) * 100) : 0}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
          of all spending
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Busiest spending days</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {busiestDay}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Day you spent the most
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">School costs</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {Math.round(
              (totalExpense > 0 ? (schoolExpenses / totalExpense) * 100 : 0)
            )}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            of all spending
          </span>
        </div>
      </div>

      {/* Weekday Distribution Bar Chart */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Spending by day
            </h3>
            <p className="text-xs text-slate-500">
              Compare how much you spend each day.
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spent']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* How people pay and where money is spent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment types */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              How you paid
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              See how much you paid with UPI, cash, cards, and bank transfers.
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {paymentData.map((pm, i) => (
              <div key={pm.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{pm.name}</span>
                </div>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {currency}{pm.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Places with the most spending */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Places you spent the most
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Places listed on your expenses, sorted by how much you spent.
          </p>

          <div className="space-y-3">
            {topPlaces.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                Add a store name when recording an expense to see where you spend the most.
              </p>
            ) : topPlaces.map((m) => (
              <div key={m.name} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    {m.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.category} · {m.count} {m.count === 1 ? 'expense' : 'expenses'}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {currency}{m.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
