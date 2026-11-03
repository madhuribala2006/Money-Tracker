import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  MinusCircle,
  PlusCircle,
  PieChart,
  FolderKanban,
  Target,
  Sparkles,
  BellRing,
  CreditCard,
  GraduationCap,
  Calendar,
  Activity,
  TrendingUp,
  FileSpreadsheet,
  Bell,
  HelpCircle,
  Settings,
  AlertTriangle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  items: {
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[];
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { activePage, setActivePage, analytics, unreadNotifCount, currency, user } = useApp();

  const dailyThreshold = user?.dailySpendingLimit || 400;
  const todaySpent = analytics?.todayExpense || 0;
  const dailyProgress = Math.min(100, Math.round((todaySpent / dailyThreshold) * 100));
  const isOverDailyLimit = todaySpent > dailyThreshold;

  const sections: NavSection[] = [
    {
      title: 'Daily money',
      items: [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'transactions', label: 'Money activity', icon: ArrowLeftRight },
        { id: 'add-expense', label: 'Add an expense', icon: MinusCircle },
        { id: 'add-income', label: 'Add income', icon: PlusCircle },
      ],
    },
    {
      title: 'Plan ahead',
      items: [
        { id: 'budgets', label: 'Budgets', icon: PieChart },
        { id: 'categories', label: 'Money groups', icon: FolderKanban },
        { id: 'savings-goals', label: 'Savings plans', icon: Target },
        { id: 'wishlist', label: 'Wishlist', icon: Sparkles },
      ],
    },
    {
      title: 'Regular payments',
      items: [
        { id: 'bills', label: 'Bills & reminders', icon: BellRing },
        { id: 'subscriptions', label: 'Monthly payments', icon: CreditCard },
      ],
    },
    {
      title: 'More tools',
      items: [
        { id: 'education', label: 'School costs', icon: GraduationCap },
        { id: 'calendar', label: 'Money calendar', icon: Calendar },
        { id: 'financial-health', label: 'Money check-up', icon: Activity },
        { id: 'ai-advisor', label: 'Money coach', icon: Sparkles },
      ],
    },
    {
      title: 'Reports',
      items: [
        { id: 'analytics', label: 'Where money goes', icon: TrendingUp },
        { id: 'reports', label: 'Money reports', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'Settings & help',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
        { id: 'help', label: 'Help', icon: HelpCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-indigo-500/25">
              M
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                Money Tracker
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Your personal finances
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  const isAi = item.id === 'ai-advisor';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                        isActive
                          ? isAi
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-xs'
                            : 'bg-emerald-50/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-semibold shadow-2xs ring-1 ring-emerald-300/30'
                          : isAi
                          ? 'text-amber-200 dark:text-amber-200 hover:bg-amber-50/10 dark:hover:bg-amber-950/40 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? isAi
                                ? 'text-white'
                                : 'text-emerald-700 dark:text-emerald-300'
                              : isAi
                              ? 'text-amber-200 dark:text-amber-200 animate-pulse'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                      {isAi && !isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-300/20 text-amber-100 font-bold uppercase tracking-wider">
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Daily spending limit alert */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-800/90 shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {isOverDailyLimit ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                Today's limit ({currency}{dailyThreshold})
              </span>
              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold tabular-nums">
                {currency}{todaySpent}
              </span>
            </div>

            {/* Progress meter */}
            <div className="w-full bg-slate-100 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverDailyLimit
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : dailyProgress >= 80
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${dailyProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              <span>{dailyProgress}% of today's limit</span>
              <span className="tabular-nums font-medium">
                {isOverDailyLimit
                  ? `+${currency}${todaySpent - dailyThreshold} over`
                  : `${currency}${dailyThreshold - todaySpent} left`}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
