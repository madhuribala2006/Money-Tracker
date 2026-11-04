import React, { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Check,
  PiggyBank,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SavingsGoal } from '../types';

export function SavingsGoalsPage() {
  const { savingsGoals, addSavingsGoal, contributeSavingsGoal, updateSavingsGoal, deleteSavingsGoal, currency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [category, setCategory] = useState('Tech & Gadgets');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Contribute state
  const [contributeAmount, setContributeAmount] = useState('');
  const [deductFromBalance, setDeductFromBalance] = useState(true);

  const openAddModal = () => {
    setSelectedGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setCategory('Tech & Gadgets');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(new Date(goal.deadline).toISOString().slice(0, 10));
    setCategory(goal.category);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const openContributeModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setContributeAmount('');
    setDeductFromBalance(true);
    setIsContributeModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount) || 0,
        deadline: new Date(deadline),
        category,
        notes,
      };

      if (selectedGoal) {
        await updateSavingsGoal(selectedGoal.id || selectedGoal._id!, payload);
      } else {
        await addSavingsGoal(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(contributeAmount);
    if (!amt || !selectedGoal) return;

    setSubmitting(true);
    try {
      await contributeSavingsGoal(selectedGoal.id || selectedGoal._id!, amt, deductFromBalance);
      setIsContributeModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this savings goal?')) {
      await deleteSavingsGoal(id);
    }
  };

  const totalTarget = savingsGoals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const totalSaved = savingsGoals.reduce((s, g) => s + Number(g.currentAmount), 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Savings plans
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Save a little at a time for things you want.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add a savings plan</span>
        </button>
      </div>

      {/* Aggregate Savings Bar */}
      <div className="p-5 sm:p-6 rounded-2xl fin-card space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Saved so far</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {savingsGoals.filter((g) => g.isCompleted).length} of {savingsGoals.length} plans finished
            </p>
          </div>
          <div className="text-left sm:text-right font-mono tabular-nums">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {currency}{totalSaved.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              of {currency}{totalTarget.toLocaleString('en-IN')} target ({overallPercentage}%)
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savingsGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          );

          return (
            <div
              key={goal.id || goal._id}
              className={`p-5 sm:p-6 rounded-2xl fin-card flex flex-col justify-between transition-all ${
                goal.isCompleted
                  ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        goal.isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      }`}
                    >
                      {goal.isCompleted ? <Award className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {goal.title}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {goal.category} · <strong className="font-semibold text-slate-700 dark:text-slate-300">{daysLeft} days left</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`Edit ${goal.title}`}
                      aria-label={`Edit ${goal.title}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id || goal._id!)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`Delete ${goal.title}`}
                      aria-label={`Delete ${goal.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 my-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono tabular-nums text-sm">
                      {currency}{goal.currentAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                      Goal: {currency}{goal.targetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${goal.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {percent}% saved
                    </span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {goal.isCompleted ? 'You reached your goal!' : `${currency}${remaining.toLocaleString('en-IN')} left`}
                    </span>
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
                    {goal.notes}
                  </p>
                )}
              </div>

              {/* Action */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Save by {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {!goal.isCompleted && (
                  <button
                    onClick={() => openContributeModal(goal)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 shadow-2xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add savings</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Modal */}
      {isContributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Add savings to {selectedGoal.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Still to save: {currency}{(selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setIsContributeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  How much do you want to add? ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deduct"
                  checked={deductFromBalance}
                  onChange={(e) => setDeductFromBalance(e.target.checked)}
                  className="rounded-xs border-slate-300 text-indigo-600"
                />
                <label htmlFor="deduct" className="text-xs text-slate-600 dark:text-slate-400">
                  Subtract this amount from my current balance
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {submitting ? 'Adding...' : 'Add to savings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedGoal ? 'Edit savings plan' : 'Create a savings plan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What are you saving for? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. M3 MacBook Air or Exam Fee Cushion"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How much do you need? ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How much have you saved already? ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    When do you need it? *
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type of goal
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Tech & Hardware">Tech & Hardware</option>
                    <option value="Education & Certifications">Education & Certifications</option>
                    <option value="Travel & Recreation">Travel & Recreation</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="General">General</option>
                  </select>
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
                  placeholder="For example: I need this for next year's classes"
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
                  {submitting ? 'Saving...' : selectedGoal ? 'Save changes' : 'Create plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
