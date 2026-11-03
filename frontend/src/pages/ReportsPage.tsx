import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export function ReportsPage() {
  const { analytics, transactions, currency, user } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const monthlyData = analytics?.monthlyTrends.find((m) => m.monthKey === selectedMonth) || {
    income: analytics?.thisMonthIncome || 0,
    expense: analytics?.thisMonthExpense || 0,
    net: analytics?.thisMonthSavings || 0,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = async () => {
    try {
      await api.transactions.downloadCsv();
    } catch (error) {
      console.error('Failed to export transactions', error);
      window.alert('Could not export transactions. Please try again.');
    }
  };

  const netSavings = monthlyData.income - monthlyData.expense;
  const savingsRate = monthlyData.income > 0 ? Math.round((netSavings / monthlyData.income) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header & Print Actions */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Monthly money summary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            See money received, money spent, and how much you saved.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download activity</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Paper Container */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Institutional Letterhead Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
                Money Tracker
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Personal money summary</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Account: <strong className="text-slate-900 dark:text-slate-100">{user?.name || 'Personal account'}</strong>
              {user?.studentId ? ` · Reference: ${user.studentId}` : ''}
            </p>
            {(user?.university || user?.course) && (
              <p className="text-[11px] text-slate-400">
                {[user.university, user.course].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="font-semibold block text-slate-900 dark:text-slate-100">
            Month
            </span>
            <span className="font-mono text-[11px] block text-slate-600 dark:text-slate-400">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Generated on {new Date().toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium block">Money received</span>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              +{currency}{monthlyData.income.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium block">Money spent</span>
            <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              -{currency}{monthlyData.expense.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium block">Money saved</span>
            <div className={`text-lg font-bold font-mono mt-1 tabular-nums ${netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
              {netSavings >= 0 ? '+' : '-'}{currency}{Math.abs(netSavings).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium block">Percent saved</span>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
              {savingsRate}%
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Spending by group
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Group</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Percent</th>
                  <th className="py-2.5 px-3">Tip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics?.categoryPercentages.map((cat) => (
                  <tr key={cat.name} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                      {currency}{cat.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {cat.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {cat.percentage > 30 ? (
                        <span className="text-rose-600 font-medium">You spent a lot here. Check if you can spend less.</span>
                      ) : cat.percentage > 15 ? (
                        <span className="text-amber-600 font-medium">Check this against your spending limit.</span>
                      ) : (
                        <span className="text-emerald-600">You are within your limit.</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary notes */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Your money summary
          </span>
          <p className="text-slate-600 dark:text-slate-400">
            • Use the daily limit in Settings to help keep spending on track.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            • Regular bills can help you plan a predictable monthly baseline.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            • Your current savings rate is {savingsRate}% of recorded income.
          </p>
        </div>
      </div>
    </div>
  );
}
