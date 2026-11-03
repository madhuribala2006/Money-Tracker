import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  TrendingDown,
  BellRing,
  X,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function CalendarPage() {
  const { transactions, bills, currency, setActivePage } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(today);
  };

  // Map transactions & bills by YYYY-MM-DD
  const dailyData: Record<string, { income: number; expense: number; bills: any[]; txs: any[] }> = {};

  transactions.forEach((tx) => {
    const dStr = new Date(tx.date).toISOString().slice(0, 10);
    if (!dailyData[dStr]) dailyData[dStr] = { income: 0, expense: 0, bills: [], txs: [] };
    if (tx.type === 'income') dailyData[dStr].income += Number(tx.amount);
    else dailyData[dStr].expense += Number(tx.amount);
    dailyData[dStr].txs.push(tx);
  });

  bills.forEach((b) => {
    const dStr = new Date(b.dueDate).toISOString().slice(0, 10);
    if (!dailyData[dStr]) dailyData[dStr] = { income: 0, expense: 0, bills: [], txs: [] };
    dailyData[dStr].bills.push(b);
  });

  const selectedDateStr = selectedDayDate ? selectedDayDate.toISOString().slice(0, 10) : '';
  const selectedDayEntries = selectedDateStr ? dailyData[selectedDateStr] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Month Navigation */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Money calendar</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pick a day to see money received, money spent, and bills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid + Selected Day Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 sm:h-24 rounded-lg bg-slate-50/40 dark:bg-slate-900/40" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(year, month, dayNum);
              const dateKey = cellDate.toISOString().slice(0, 10);
              const dayInfo = dailyData[dateKey];
              const isToday =
                new Date().toISOString().slice(0, 10) === dateKey;
              const isSelected = selectedDateStr === dateKey;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDayDate(cellDate)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                      : isToday
                      ? 'border-indigo-300 dark:border-indigo-800 bg-slate-50 dark:bg-slate-800/40'
                      : 'border-slate-200 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayInfo?.bills && dayInfo.bills.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Bill due" />
                    )}
                  </div>

                  {/* Financial indicators */}
                  <div className="space-y-0.5 text-[10px] font-mono leading-none">
                    {Boolean(dayInfo?.income && dayInfo.income > 0) && (
                      <span className="block text-emerald-600 font-semibold truncate">
                        +{currency}{dayInfo.income}
                      </span>
                    )}
                    {Boolean(dayInfo?.expense && dayInfo.expense > 0) && (
                      <span className="block text-rose-600 font-semibold truncate">
                        -{currency}{dayInfo.expense}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Panel (1 Col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  This day
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedDayDate ? selectedDayDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date Selected'}
                </h3>
              </div>
            </div>

            {/* Daily Totals Bar */}
            {selectedDayEntries && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs">
                  <span className="text-[10px] block opacity-80">Received</span>
                  <span className="font-bold font-mono tabular-nums">+{currency}{selectedDayEntries.income}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                  <span className="text-[10px] block opacity-80">Spent</span>
                  <span className="font-bold font-mono tabular-nums">-{currency}{selectedDayEntries.expense}</span>
                </div>
              </div>
            )}

            {/* Transactions & Bills List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                What happened
              </span>

              {!selectedDayEntries || (selectedDayEntries.txs.length === 0 && selectedDayEntries.bills.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  Nothing recorded on this day.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {/* Bills Due */}
                  {selectedDayEntries.bills.map((bill) => (
                    <div
                      key={bill.id || bill._id}
                      className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {bill.title}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {currency}{bill.amount}
                      </span>
                    </div>
                  ))}

                  {/* Transactions */}
                  {selectedDayEntries.txs.map((tx) => (
                    <div
                      key={tx.id || tx._id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                          {tx.title}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {tx.category} · {tx.paymentMethod}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold tabular-nums shrink-0 ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActivePage('add-expense')}
            className="w-full mt-4 py-2 px-3 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an expense</span>
          </button>
        </div>
      </div>
    </div>
  );
}
