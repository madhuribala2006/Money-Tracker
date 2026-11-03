import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenAuthModal: () => void;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Money overview', subtitle: 'See what came in, what went out, and what you saved.' },
  transactions: { title: 'Money activity', subtitle: 'See money you spent and money you received.' },
  'add-expense': { title: 'Add an expense', subtitle: 'Add something you paid for.' },
  'add-income': { title: 'Add income', subtitle: 'Add money you received.' },
  budgets: { title: 'Your budgets', subtitle: 'See your spending limits and how much is left.' },
  categories: { title: 'Money groups', subtitle: 'Group similar spending together.' },
  'savings-goals': { title: 'Savings plans', subtitle: 'Save for something you want.' },
  bills: { title: 'Bills & reminders', subtitle: 'See what you need to pay and when.' },
  subscriptions: { title: 'Monthly payments', subtitle: 'Keep track of regular app and service costs.' },
  reports: { title: 'Money reports', subtitle: 'View or download a summary of your money.' },
  analytics: { title: 'Where your money goes', subtitle: 'See what you spend money on.' },
  calendar: { title: 'Money calendar', subtitle: 'See payments, income, and bills by date.' },
  education: { title: 'School costs', subtitle: 'Track tuition, books, and school supplies.' },
  wishlist: { title: 'Things to save for', subtitle: 'Plan purchases and set a savings target.' },
  'financial-health': { title: 'Money check-up', subtitle: 'See how your saving and spending habits are going.' },
  'ai-advisor': { title: 'Money coach', subtitle: 'Get simple tips about spending and saving.' },
  notifications: { title: 'Reminders', subtitle: 'See your reminders and updates.' },
  help: { title: 'Help', subtitle: 'Find answers and easy money tips.' },
  settings: { title: 'Settings', subtitle: 'Change your account and money settings.' },
};

export function Header({ onOpenMobileSidebar, onOpenAuthModal }: HeaderProps) {
  const {
    activePage,
    setActivePage,
    user,
    logout,
    darkMode,
    toggleDarkMode,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    analytics,
    currency,
  } = useApp();

  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentMeta = PAGE_TITLES[activePage] || { title: 'Money Tracker', subtitle: 'Make your money easier to understand.' };
  const dailyThreshold = user?.dailySpendingLimit || 400;
  const todaySpent = analytics?.todayExpense || 0;
  const isOverDailyLimit = todaySpent > dailyThreshold;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Zone 1: Navigation Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="truncate">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Money Tracker</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{currentMeta.title}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Contextual Daily Alert Indicator */}
      <div className="hidden md:flex items-center gap-2">
        {isOverDailyLimit ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50/90 dark:bg-rose-950/60 border border-rose-300/80 dark:border-rose-800/80 rounded-lg text-xs text-rose-700 dark:text-rose-300 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Daily limit ({currency}{dailyThreshold}) exceeded: <strong className="tabular-nums font-mono font-bold">{currency}{todaySpent}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
            <span>            Spent today: <strong className="tabular-nums font-mono font-bold text-slate-900 dark:text-slate-100">{currency}{todaySpent}</strong> of {currency}{dailyThreshold}</span>
          </div>
        )}
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Quick Ask AI button */}
        <button
          onClick={() => setActivePage('ai-advisor')}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shadow-2xs ${
            activePage === 'ai-advisor'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                : 'bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-800/70 hover:bg-emerald-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
          <span>Ask AI</span>
        </button>

        {/* Quick Log Button */}
        <button
          onClick={() => setActivePage('add-expense')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 active:bg-emerald-800 rounded-lg transition-all whitespace-nowrap shadow-xs shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Notifications ({unreadNotifCount} unread)
                </span>
                <button
                  onClick={() => {
                    setShowNotificationsMenu(false);
                    setActivePage('notifications');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id || notif._id}
                      onClick={() => {
                        if (notif.id) markNotificationRead(notif.id);
                        setShowNotificationsMenu(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px]">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-sm ring-1 ring-emerald-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-semibold max-w-[120px] truncate">
              {user?.name || 'Personal account'}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 p-2">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Personal account'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || '123@gmail.com'}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 truncate">
                  {user?.course || 'Personal account'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setActivePage('settings');
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Account & Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenAuthModal();
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>Switch / Sign In</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  onOpenAuthModal();
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
