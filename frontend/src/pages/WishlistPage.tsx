import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  ExternalLink,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WishlistItem } from '../types';

export function WishlistPage() {
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem, currency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  const [title, setTitle] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [savedSoFar, setSavedSoFar] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setEstimatedPrice('');
    setPriority('medium');
    setCategory('Tech & Gadgets');
    setSavedSoFar('');
    setTargetMonth('');
    setProductUrl('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: WishlistItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setEstimatedPrice(item.estimatedPrice.toString());
    setPriority(item.priority);
    setCategory(item.category);
    setSavedSoFar(item.savedSoFar.toString());
    setTargetMonth(item.targetMonth || '');
    setProductUrl(item.productUrl || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !estimatedPrice) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        estimatedPrice: Number(estimatedPrice),
        priority,
        category,
        savedSoFar: Number(savedSoFar) || 0,
        targetMonth,
        productUrl,
        notes,
      };

      if (editingItem) {
        await updateWishlistItem(editingItem.id || editingItem._id!, payload);
      } else {
        await addWishlistItem(payload);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePurchased = async (item: WishlistItem) => {
    await updateWishlistItem(item.id || item._id!, { isPurchased: !item.isPurchased });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this wishlist item?')) {
      await deleteWishlistItem(id);
    }
  };

  const totalWishlistValue = wishlist.reduce((s, w) => s + Number(w.estimatedPrice), 0);
  const totalWishlistSaved = wishlist.reduce((s, w) => s + Number(w.savedSoFar), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Things to save for</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
              Things to save for
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add things you want and track how much you have saved.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add something</span>
        </button>
      </div>

      {/* Aggregate Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Total cost</span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
            {currency}{totalWishlistValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {wishlist.length} things on your list
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Saved for these items</span>
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {currency}{totalWishlistSaved.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {totalWishlistValue > 0 ? Math.round((totalWishlistSaved / totalWishlistValue) * 100) : 0}% saved
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Bought</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {wishlist.filter((w) => w.isPurchased).length} Items
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Things you have bought
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((item) => {
          const percent = item.estimatedPrice > 0 ? Math.min(100, Math.round((item.savedSoFar / item.estimatedPrice) * 100)) : 0;

          return (
            <div
              key={item.id || item._id}
              className={`p-5 rounded-xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between transition-colors ${
                item.isPurchased ? 'opacity-65 border-slate-200' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="capitalize">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold capitalize ${
                        item.priority === 'high' ? 'text-rose-600' : item.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {item.priority} priority
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

                <div className="my-3">
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                    {currency}{Number(item.estimatedPrice).toLocaleString('en-IN')}
                  </div>
                  {item.targetMonth && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Target: {item.targetMonth}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1 my-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono tabular-nums">
                      Saved so far: {currency}{item.savedSoFar.toLocaleString('en-IN')}
                    </span>
                    <span className="font-semibold text-indigo-600 font-mono tabular-nums">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md mt-2">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => togglePurchased(item)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 border ${
                    item.isPurchased
                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{item.isPurchased ? 'Bought ✓' : 'Mark as bought'}</span>
                </button>

                {item.productUrl && (
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open item link</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
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
                {editingItem ? 'Edit Wishlist Item' : 'Add to Wishlist'}
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
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM4 Headphones"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="e.g. 19990"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Tech, Study, Health"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Saved So Far ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={savedSoFar}
                    onChange={(e) => setSavedSoFar(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Purchase Month / Horizon
                </label>
                <input
                  type="text"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  placeholder="e.g. End of Semester / December 2026"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Link (Optional)
                </label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
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
                  {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add to Wishlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
