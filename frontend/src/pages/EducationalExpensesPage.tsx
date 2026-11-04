import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Receipt,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  X,
  Check,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EducationExpense, EducationExpenseType } from '../types';

export function EducationalExpensesPage() {
  const { educationExpenses, addEducationExpense, updateEducationExpense, deleteEducationExpense, currency, user } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationExpense | null>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<EducationExpenseType>('Tuition Fee');
  const [academicYear, setAcademicYear] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [institution, setInstitution] = useState(user?.university || '');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setAmount('');
    setType('Tuition Fee');
    setAcademicYear('');
    setDueDate('');
    setIsPaid(false);
    setInstitution(user?.university || '');
    setReceiptNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: EducationExpense) => {
    setEditingItem(item);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setType(item.type);
    setAcademicYear(item.academicYear);
    setDueDate(item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '');
    setIsPaid(item.isPaid);
    setInstitution(item.institution);
    setReceiptNumber(item.receiptNumber || '');
    setNotes(item.notes || '');
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
        type,
        academicYear,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isPaid,
        institution,
        receiptNumber,
        notes,
      };

      if (editingItem) {
        await updateEducationExpense(editingItem.id || editingItem._id!, payload);
      } else {
        await addEducationExpense(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePaidStatus = async (item: EducationExpense) => {
    await updateEducationExpense(item.id || item._id!, {
      isPaid: !item.isPaid,
      paidDate: !item.isPaid ? new Date() : undefined,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this educational expense entry?')) {
      await deleteEducationExpense(id);
    }
  };

  const totalEduCost = educationExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalPaid = educationExpenses.filter((e) => e.isPaid).reduce((s, e) => s + Number(e.amount), 0);
  const pendingDues = totalEduCost - totalPaid;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>School costs</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
              Your school spending
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of tuition, books, school supplies, and exam fees.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add a school cost</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Total school costs</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {currency}{totalEduCost.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            All school costs added so far
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Paid so far</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {currency}{totalPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Fees you have paid
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Still to pay</span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {currency}{pendingDues.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            School costs not yet paid
          </span>
        </div>
      </div>

      {/* Education Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {educationExpenses.map((item) => (
          <div
            key={item.id || item._id}
            className={`p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between transition-colors ${
              item.isPaid
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/10'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.isPaid
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {item.type} · {item.academicYear}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id || item._id!)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-3 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {currency}{Number(item.amount).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Institution: {item.institution}
                  </span>
                </div>

                <div className="text-right">
                  {item.receiptNumber && (
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Rcpt #{item.receiptNumber}
                    </span>
                  )}
                  {item.dueDate && !item.isPaid && (
                    <span className="text-[11px] text-amber-600 font-medium block">
                      Due {new Date(item.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md">
                  {item.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center gap-1 ${item.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {item.isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{item.isPaid ? 'Paid & Documented' : 'Payment Pending'}</span>
              </span>

              <button
                onClick={() => togglePaidStatus(item)}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {item.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingItem ? 'Edit school cost' : 'Add a school cost'}
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
                  Item / Fee Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5th Semester Tuition Fee or Cloud Lab Credits"
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
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 42000"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Books & Materials">Books & Materials</option>
                    <option value="Hostel & Mess">Hostel & Mess</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Lab Supplies">Lab Supplies</option>
                    <option value="Tech & Equipment">Tech & Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    School year or term
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="Optional term or period"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Receipt # (Optional)
                  </label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="Optional receipt or reference number"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paidCheck"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded-xs border-slate-300 text-indigo-600"
                />
                <label htmlFor="paidCheck" className="text-xs text-slate-700 dark:text-slate-300">
                  This fee has already been paid and settled
                </label>
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
                  {submitting ? 'Saving...' : editingItem ? 'Update Fee' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
