import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Edit2,
  Trash2,
  X,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Budget } from '../types';

export function BudgetsPage() {
  const { budgets, categories, addBudget, updateBudget, deleteBudget, currency, analytics } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [category, setCategory] = useState('Overall');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const expenseCategories = categories.filter((item) => item.type === 'expense');

  const openAddModal = () => {
    setEditingBudget(null);
    setCategory(expenseCategories[0]?.name || 'Food and dining');
    setAmount('');
    setPeriod('monthly');
    setAlertThreshold(80);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setCategory(b.category);
    setAmount(b.amount.toString());
    setPeriod(b.period);
    setAlertThreshold(b.alertThreshold || 80);
    setNotes(b.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    setSubmitting(true);
    try {
      const payload = {
        category,
        amount: Number(amount),
        period,
        alertThreshold: Number(alertThreshold),
        notes,
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id || editingBudget._id!, payload);
      } else {
        await addBudget(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget target?')) {
      await deleteBudget(id);
    }
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.category !== 'Overall' ? Number(b.amount) : 0), 0);
  const totalSpent = analytics?.thisMonthExpense || 0;
  const overLimitCount = budgets.filter((b) => b.isOverBudget).length;
  const closeToLimitCount = budgets.filter((b) => b.isWarning && !b.isOverBudget).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Summary */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Spending limits
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set a limit for each group. Get a heads-up when you're close to your limit.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add a spending limit</span>
        </button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl fin-card">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
          Total spending limits
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {currency}{totalBudgeted.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Combined limits across your groups
          </span>
        </div>

        <div className="p-5 rounded-2xl fin-card">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
            Spent this month
          </span>
          <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            {currency}{totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Actual expenses recorded this month
          </span>
        </div>

        <div className="p-5 rounded-2xl fin-card">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
            Groups past their limit
          </span>
          <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {overLimitCount === 0 ? 'None over limit' : `${overLimitCount} over limit`}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {closeToLimitCount} {closeToLimitCount === 1 ? 'group' : 'groups'} close to {closeToLimitCount === 1 ? 'its' : 'their'} limit
          </span>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const spent = b.spent || 0;
          const percentage = Math.min(100, b.percentage || 0);
          const isOver = b.isOverBudget;
          const isWarn = b.isWarning && !isOver;

          return (
            <div
              key={b.id || b._id}
              className={`p-5 rounded-2xl fin-card flex flex-col justify-between transition-all ${
                isOver
                  ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs'
                  : isWarn
                  ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {b.category}
                      {isOver ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block capitalize mt-0.5">
                      {b.period === 'weekly' ? 'Weekly' : 'Monthly'} limit · Warning at {b.alertThreshold || 80}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`Edit ${b.category} limit`}
                      aria-label={`Edit ${b.category} limit`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id || b._id!)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`Delete ${b.category} limit`}
                      aria-label={`Delete ${b.category} limit`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Spent so far: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{currency}{spent.toLocaleString('en-IN')}</strong>
                    </span>
                    <span className="font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                      Limit: {currency}{Number(b.amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : isWarn
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : isWarn ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                      {b.percentage}% of limit used
                    </span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {isOver
                        ? `Over by ${currency}${(spent - b.amount).toLocaleString('en-IN')}`
                        : `${currency}${Math.max(0, b.amount - spent).toLocaleString('en-IN')} remaining`}
                    </span>
                  </div>
                </div>

                {b.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
                    {b.notes}
                  </p>
                )}
              </div>

              {/* Status pill message */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                {isOver ? (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    You have spent more than this limit.
                  </span>
                ) : isWarn ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    You are close to this limit.
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    You are within this limit.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingBudget ? 'Edit spending limit' : 'Set a spending limit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What do you want to set a limit for? *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Overall">All spending</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id || c._id || `${c.type}:${c.name}`} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What is your limit? ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 3500"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reset limit
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Warn me after I have used this much (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    placeholder="80"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    For example, 80 means you will get a warning after using 80% of your limit.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Add a note (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="For example: Leave room for weekend meals"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
                >
                  {submitting ? 'Saving...' : editingBudget ? 'Save changes' : 'Set limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
