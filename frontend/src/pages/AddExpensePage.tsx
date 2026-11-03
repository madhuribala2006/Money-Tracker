import React, { useState } from 'react';
import {
  MinusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Tag,
  Store,
  FileText,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export function AddExpensePage() {
  const { categories, addTransaction, analytics, currency, user, setActivePage } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food and dining');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [isEducational, setIsEducational] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const dailyLimit = user?.dailySpendingLimit || 400;
  const todayExpense = analytics?.todayExpense || 0;
  const numAmount = Number(amount) || 0;
  const projectedTodayExpense = todayExpense + numAmount;
  const isProjectedOverLimit = projectedTodayExpense > dailyLimit;

  const quickAmounts = [50, 100, 200, 350, 500, 1000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !numAmount) return;

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await addTransaction({
        title,
        amount: numAmount,
        type: 'expense',
        category,
        date: new Date(date),
        paymentMethod,
        merchant,
        notes,
        isEducational,
      });

      setSuccessMsg(`Added an expense of ${currency}${numAmount.toLocaleString('en-IN')}.`);
      // Reset form
      setTitle('');
      setAmount('');
      setMerchant('');
      setNotes('');
      setIsEducational(false);
    } catch (err: any) {
      alert('Could not add this expense. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Intro Header */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
            <MinusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add an expense
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep track of things you buy and bills you pay.
            </p>
          </div>
        </div>
        <div className="hidden sm:text-right sm:block">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">          Spent today</span>
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {currency}{todayExpense} / {currency}{dailyLimit}
          </span>
        </div>
      </div>

      {/* Real-time Daily Limit Alert Warning */}
      {numAmount > 0 && isProjectedOverLimit && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block">
              This will put you over your daily spending limit of {currency}{dailyLimit}.
            </span>
            <p className="mt-0.5">
              Adding <strong className="font-mono">{currency}{numAmount}</strong> will bring today's total spending to{' '}
              <strong className="font-mono">{currency}{projectedTodayExpense}</strong> ({currency}{projectedTodayExpense - dailyLimit} over your {currency}{dailyLimit} daily limit).
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setActivePage('transactions')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
          >
            <span>See your activity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        {/* Amount Input & Quick Chips */}
        <div>
          <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            How much did you spend? ({currency}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 font-bold font-mono text-slate-400 text-sm">
              {currency}
            </span>
            <input
              type="number"
              id="expense-amount"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 text-base font-bold font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 mr-1">Choose an amount:</span>
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {currency}{q}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Title */}
        <div>
          <label htmlFor="expense-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            What did you spend it on? *
          </label>
          <input
            type="text"
            id="expense-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="For example: Lunch, bus fare, or books"
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Spending group *
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {expenseCategories.map((c) => (
                <option key={c.id || c._id || `${c.type}:${c.name}`} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-method" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              How did you pay?
            </label>
            <select
              id="expense-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>
        </div>

        {/* Date & Merchant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              When did you spend it? *
            </label>
            <input
              type="date"
              id="expense-date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="expense-store" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Store or person (optional)
            </label>
            <input
              type="text"
              id="expense-store"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="For example: Campus shop"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Notes & Educational Flag */}
        <div>
          <label htmlFor="expense-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Add a note (optional)
          </label>
          <textarea
            id="expense-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any details you want to remember"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isEdu"
            checked={isEducational}
            onChange={(e) => setIsEducational(e.target.checked)}
            className="rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isEdu" className="text-xs text-slate-700 dark:text-slate-300">
            This was for school (show it under School Costs)
          </label>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <TrendingDown className="w-4 h-4" />
            <span>{submitting ? 'Adding...' : 'Add expense'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
