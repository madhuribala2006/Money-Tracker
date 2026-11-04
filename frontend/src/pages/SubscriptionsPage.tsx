import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subscription } from '../types';

export function SubscriptionsPage() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, currency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('Entertainment');
  const [nextBillingDate, setNextBillingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [planName, setPlanName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI Autopay');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setBillingCycle('monthly');
    setCategory('Entertainment');
    setPlanName('');
    setPaymentMethod('UPI Autopay');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Subscription) => {
    setEditingSub(s);
    setName(s.name);
    setAmount(s.amount.toString());
    setBillingCycle(s.billingCycle);
    setCategory(s.category);
    setNextBillingDate(new Date(s.nextBillingDate).toISOString().slice(0, 10));
    setPlanName(s.planName || '');
    setPaymentMethod(s.paymentMethod || 'UPI');
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setSubmitting(true);
    try {
      const payload = {
        name,
        amount: Number(amount),
        billingCycle,
        category,
        nextBillingDate: new Date(nextBillingDate),
        planName,
        paymentMethod,
        notes,
      };

      if (editingSub) {
        await updateSubscription(editingSub.id || editingSub._id!, payload);
      } else {
        await addSubscription(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePause = async (s: Subscription) => {
    const newStatus = s.status === 'active' ? 'paused' : 'active';
    await updateSubscription(s.id || s._id!, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  // Calculate monthly recurring burn
  const monthlyRecurringCost = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      const amt = Number(s.amount);
      if (s.billingCycle === 'yearly') return sum + amt / 12;
      if (s.billingCycle === 'quarterly') return sum + amt / 3;
      return sum + amt;
    }, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Monthly payments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track regular payments for apps and services.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add a monthly payment</span>
        </button>
      </div>

      {/* Subscription Burn Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Monthly total
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {currency}{Math.round(monthlyRecurringCost).toLocaleString('en-IN')}/mo
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Estimated monthly cost
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Current payments
          </span>
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {subscriptions.filter((s) => s.status === 'active').length} Active
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {subscriptions.filter((s) => s.status === 'paused').length} paused
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Yearly total
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {currency}{Math.round(monthlyRecurringCost * 12).toLocaleString('en-IN')}/yr
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Estimated cost for 12 months
          </span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => {
          const isActive = sub.status === 'active';
          const nextDate = new Date(sub.nextBillingDate);
          const daysToRenew = Math.ceil((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={sub.id || sub._id}
              className={`p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between transition-colors ${
                !isActive ? 'opacity-60 border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {sub.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {sub.planName || 'Payment'} · {sub.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id || sub._id!)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-3">
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {Number(sub.amount) === 0 ? 'FREE' : `${currency}${Number(sub.amount).toLocaleString('en-IN')}`}
                    <span className="text-xs font-normal text-slate-400">/{sub.billingCycle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{daysToRenew <= 0 ? 'Payment due today' : `Payment due in ${daysToRenew} days`} ({nextDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})</span>
                  </div>
                </div>

                {sub.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md">
                    {sub.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{sub.paymentMethod}</span>
                <button
                  onClick={() => togglePause(sub)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 border ${
                    isActive
                      ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                      : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isActive ? 'Pause tracking' : 'Track again'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingSub ? 'Edit monthly payment' : 'Add monthly payment'}
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
                  What is the payment for? *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Spotify, GitHub Copilot, Campus Gym"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How often do you pay?
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Every 3 months</option>
                    <option value="yearly">Every year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Plan name (optional)
                  </label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Family plan"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next payment date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="e.g. UPI Mandate, Card"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes..."
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingSub ? 'Update Subscription' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
