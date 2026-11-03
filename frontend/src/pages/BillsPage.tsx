import React, { useEffect, useState } from 'react';
import {
  BellRing,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  X,
  Bell,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Bill, PaymentMethod } from '../types';

export function BillsPage() {
  const {
    bills,
    categories,
    addBill,
    markBillPaid,
    updateBill,
    deleteBill,
    currency,
    requestNotificationPermission,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<any>('monthly');
  const [category, setCategory] = useState('Wi-Fi/internet');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [permStatus, setPermStatus] = useState<string | null>(null);
  const [billToPay, setBillToPay] = useState<Bill | null>(null);
  const [paidWithCash, setPaidWithCash] = useState<boolean | null>(null);
  const [otherPaymentMethod, setOtherPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermStatus('unsupported');
      return;
    }
    setPermStatus(Notification.permission);
    if (Notification.permission !== 'granted') return;

    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    bills
      .filter((bill) => !bill.isPaid)
      .forEach((bill) => {
        const dueDate = new Date(bill.dueDate);
        const dueUtc = Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
        const daysUntilDue = Math.floor((dueUtc - todayUtc) / 86_400_000);
        if (daysUntilDue < 0 || daysUntilDue > bill.reminderDaysBefore) return;

        const billId = bill.id || bill._id || bill.title;
        const reminderKey = `bill-reminder:${billId}:${monthKey}`;
        if (window.localStorage.getItem(reminderKey)) return;
        new Notification(`Bill due soon: ${bill.title}`, {
          body: `${currency}${Number(bill.amount).toLocaleString('en-IN')} is due ${
            daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
          }.`,
        });
        window.localStorage.setItem(reminderKey, 'shown');
      });
  }, [bills, currency]);

  const openAddModal = () => {
    setEditingBill(null);
    setTitle('');
    setAmount('');
    setDueDate(new Date().toISOString().slice(0, 10));
    setFrequency('monthly');
    setCategory('Wi-Fi/internet');
    setReminderDaysBefore(3);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Bill) => {
    setEditingBill(b);
    setTitle(b.title);
    setAmount(b.amount.toString());
    setDueDate(new Date(b.dueDate).toISOString().slice(0, 10));
    setFrequency(b.frequency);
    setCategory(b.category);
    setReminderDaysBefore(b.reminderDaysBefore || 3);
    setNotes(b.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        frequency,
        category,
        reminderDaysBefore: Number(reminderDaysBefore),
        notes,
      };

      if (editingBill) {
        await updateBill(editingBill.id || editingBill._id!, payload);
      } else {
        await addBill(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmMarkPaid = async () => {
    if (!billToPay) return;
    const paymentMethod = paidWithCash ? 'Cash' : otherPaymentMethod;
    setPaying(true);
    try {
      await markBillPaid(billToPay.id || billToPay._id!, true, paymentMethod);
      setBillToPay(null);
      setPaidWithCash(null);
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this bill reminder?')) {
      await deleteBill(id);
    }
  };

  const handleEnableAlerts = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
  };

  const now = new Date();
  const unpaidBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

  const overdueBills = unpaidBills.filter((b) => new Date(b.dueDate).getTime() < now.getTime());
  const upcomingBills = unpaidBills.filter((b) => new Date(b.dueDate).getTime() >= now.getTime());

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Bills and reminders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add bills so you can see what is due and when to pay it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEnableAlerts}
            className="px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>{permStatus === 'granted' ? 'Browser reminders are on' : 'Turn on browser reminders'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add a bill</span>
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-4">
        Browser reminders appear when this page is open near a bill’s due date.
      </p>

      {/* Overdue alert if any */}
      {overdueBills.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block">
              {overdueBills.length} bill{overdueBills.length > 1 ? 's are' : ' is'} late
            </span>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">
              Check these bills and mark them as paid when you pay them.
            </p>
          </div>
        </div>
      )}

      {/* Upcoming / Pending Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          To pay soon ({unpaidBills.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unpaidBills.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No bills to pay right now.
            </div>
          ) : (
            unpaidBills.map((bill) => {
              const due = new Date(bill.dueDate);
              const isPast = due.getTime() < now.getTime();
              const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={bill.id || bill._id}
                  className={`p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${
                    isPast ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                          {bill.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block capitalize">
                          {bill.category} · {bill.frequency}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(bill)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                          title={`Edit ${bill.title}`}
                          aria-label={`Edit ${bill.title}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id || bill._id!)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                          title={`Delete ${bill.title}`}
                          aria-label={`Delete ${bill.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="my-3">
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                        {currency}{Number(bill.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className={`font-medium ${
                            isPast
                              ? 'text-rose-600 font-semibold'
                              : daysDiff <= 2
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isPast
                            ? `${Math.abs(daysDiff)} days late`
                            : daysDiff === 0
                            ? 'Pay today'
                            : daysDiff === 1
                            ? 'Pay tomorrow'
                            : `Pay in ${daysDiff} days`}
                        </span>
                      </div>
                    </div>

                    {bill.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md">
                        {bill.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {due.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => {
                        setBillToPay(bill);
                        setPaidWithCash(null);
                        setOtherPaymentMethod('UPI');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as paid</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Settled / Paid Bills History */}
      {paidBills.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Already paid ({paidBills.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {paidBills.map((bill) => (
              <div
                key={bill.id || bill._id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-80 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                    {bill.title}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid on {new Date(bill.paidAt || bill.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {bill.lastPaymentMethod && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Paid by {bill.lastPaymentMethod}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block tabular-nums">
                    {currency}{Number(bill.amount).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDelete(bill.id || bill._id!)}
                    className="text-[10px] text-slate-400 hover:text-rose-600 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {billToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">How did you pay?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {billToPay.title} · {currency}{Number(billToPay.amount).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setBillToPay(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close payment question"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Did you pay with cash?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaidWithCash(true)}
                aria-pressed={paidWithCash === true}
                className={`p-3 rounded-lg border text-sm font-semibold ${
                  paidWithCash === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Yes, cash
              </button>
              <button
                type="button"
                onClick={() => setPaidWithCash(false)}
                aria-pressed={paidWithCash === false}
                className={`p-3 rounded-lg border text-sm font-semibold ${
                  paidWithCash === false
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                No, another way
              </button>
            </div>
            {paidWithCash === false && (
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment type
                <select
                  value={otherPaymentMethod}
                  onChange={(event) => setOtherPaymentMethod(event.target.value as PaymentMethod)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="UPI">UPI</option>
                  <option value="Debit Card">Debit card</option>
                  <option value="Credit Card">Credit card</option>
                  <option value="Net Banking">Net banking</option>
                </select>
              </label>
            )}
            <button
              type="button"
              disabled={paidWithCash === null || paying}
              onClick={confirmMarkPaid}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg"
            >
              {paying ? 'Saving payment...' : 'Save as paid this month'}
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingBill ? 'Edit bill reminder' : 'Add a bill reminder'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What is the bill for? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Airtel Wi-Fi Fiber or Hostel Room Rent"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How much is it? ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 499"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How often is it due?
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="monthly">Every month</option>
                    <option value="weekly">Every week</option>
                    <option value="daily">Daily</option>
                    <option value="yearly">Every year</option>
                    <option value="one-time">Just once</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Spending group
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c._id || `${c.type}:${c.name}`} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remind me how many days before?
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Add a note (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="For example: Pay through the provider's app"
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
                  {submitting ? 'Saving...' : editingBill ? 'Update Bill' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
