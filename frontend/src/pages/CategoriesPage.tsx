import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ShoppingBag,
  Zap,
  Bus,
  Flame,
  Wind,
  GraduationCap,
  Home,
  Droplets,
  Users,
  Smartphone,
  Wifi,
  HeartPulse,
  Utensils,
  Film,
  Tag,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';

const ICON_MAP: Record<string, any> = {
  ShoppingBag,
  Zap,
  Bus,
  Flame,
  Wind,
  GraduationCap,
  Home,
  Droplets,
  Users,
  Smartphone,
  Wifi,
  HeartPulse,
  Utensils,
  Film,
  Tag,
  Receipt,
  Wallet,
};

export function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, currency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#6366f1');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setType('expense');
    setIcon('Tag');
    setColor('#6366f1');
    setMonthlyBudget('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || 'Tag');
    setColor(cat.color || '#6366f1');
    setMonthlyBudget(cat.monthlyBudget ? cat.monthlyBudget.toString() : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const payload = {
        name,
        type,
        icon,
        color,
        monthlyBudget: Number(monthlyBudget) || 0,
      };

      if (editingCat) {
        await updateCategory(editingCat.id || editingCat._id!, payload);
      } else {
        await addCategory(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? Transactions using it will still keep their history.')) {
      await deleteCategory(id);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="space-y-6 pb-12">
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Expense & Income Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize spending into categories that match your everyday needs
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Expense Categories Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Expense Categories ({expenseCategories.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {expenseCategories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Tag;
            return (
              <div
                key={cat.id || cat._id || `${cat.type}:${cat.name}`}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {cat.monthlyBudget ? `Target: ${currency}${cat.monthlyBudget}` : 'Flexible budget'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {cat.isCustom && (
                    <button
                      onClick={() => handleDelete(cat.id || cat._id!)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Income Categories */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Income Sources ({incomeCategories.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {incomeCategories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Wallet;
            return (
              <div
                key={cat.id || cat._id || `${cat.type}:${cat.name}`}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: cat.color || '#10b981' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Money received
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingCat ? 'Edit Category' : 'Create Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lab Manuals or Badminton Court"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Color Tag
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 px-1 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Target Budget ({currency}, Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
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
                  {submitting ? 'Saving...' : editingCat ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
