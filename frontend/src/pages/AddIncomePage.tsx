import React, { useState } from 'react';
import {
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Wallet,
  ArrowRight,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export function AddIncomePage() {
  const { addTransaction, analytics, currency, setActivePage } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Pocket Money');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Net Banking');
  const [merchant, setMerchant] = useState('Family Transfer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quickIncomeAmounts = [500, 1500, 3000, 5000, 10000, 15000];

  const incomeCategories = [
    'Pocket Money',
    'Monthly Allowance',
    'Pay from a Job',
    'Freelance Work',
    'Scholarship or Award',
    'Tutoring',
    'Part-time Job',
    'Gift from Family',
    'Other Money',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title || !numAmount) return;

    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await addTransaction({
        title,
        amount: numAmount,
        type: 'income',
        category,
        date: new Date(date),
        paymentMethod,
        merchant,
        notes,
      });

      setSuccessMsg(`Added ${currency}${numAmount.toLocaleString('en-IN')}. Your balance is updated.`);
      setTitle('');
      setAmount('');
      setNotes('');
    } catch (err: any) {
      alert('Could not add this income. Please check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Intro Header */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add money received
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep track of allowance, pay, scholarships, gifts, or other money you receive.
            </p>
          </div>
        </div>
        <div className="hidden sm:text-right sm:block">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Current balance</span>
          <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{currency}{analytics ? analytics.totalBalance.toLocaleString('en-IN') : '0'}
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div>
          <label htmlFor="income-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            How much did you receive? ({currency}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 font-bold font-mono text-emerald-600 text-sm">
              +{currency}
            </span>
            <input
              type="number"
              id="income-amount"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-2.5 text-base font-bold font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 mr-1">Choose an amount:</span>
            {quickIncomeAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
              >
                +{currency}{q.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="income-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            What was this money for? *
          </label>
          <input
            type="text"
            id="income-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="For example: November allowance or part-time pay"
            className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="income-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Type of income *
            </label>
            <select
              id="income-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {incomeCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="income-method" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              How did you receive it?
            </label>
            <select
              id="income-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="Net Banking">Bank transfer</option>
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit card or cheque</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="income-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              When did you receive it? *
            </label>
            <input
              type="date"
              id="income-date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="income-sender" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Who sent the money? (optional)
            </label>
            <input
              type="text"
              id="income-sender"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="For example: Family or your workplace"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="income-notes" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Add a note (optional)
          </label>
          <textarea
            id="income-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any details you want to remember"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

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
            className="px-5 py-2.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{submitting ? 'Adding...' : 'Add income'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
