import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  PageId,
  User,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  Bill,
  Subscription,
  EducationExpense,
  WishlistItem,
  NotificationItem,
  AnalyticsSummary,
  PaymentMethod,
} from '../types';
import { api } from '../services/api';

interface AppContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (account: { name: string; email: string; password: string; currency: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Data lists
  transactions: Transaction[];
  totalTransactions: number;
  txPage: number;
  setTxPage: (page: number) => void;
  txFilters: any;
  setTxFilters: React.Dispatch<React.SetStateAction<any>>;
  refreshTransactions: () => Promise<void>;
  addTransaction: (data: Partial<Transaction>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  categories: Category[];
  refreshCategories: () => Promise<void>;
  addCategory: (data: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  budgets: Budget[];
  refreshBudgets: () => Promise<void>;
  addBudget: (data: Partial<Budget>) => Promise<void>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  savingsGoals: SavingsGoal[];
  refreshSavingsGoals: () => Promise<void>;
  addSavingsGoal: (data: Partial<SavingsGoal>) => Promise<void>;
  contributeSavingsGoal: (id: string, amount: number, deductFromBalance?: boolean) => Promise<void>;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  bills: Bill[];
  refreshBills: () => Promise<void>;
  addBill: (data: Partial<Bill>) => Promise<void>;
  markBillPaid: (
    id: string,
    autoCreateTransaction?: boolean,
    paymentMethod?: PaymentMethod,
  ) => Promise<void>;
  updateBill: (id: string, data: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;

  subscriptions: Subscription[];
  refreshSubscriptions: () => Promise<void>;
  addSubscription: (data: Partial<Subscription>) => Promise<void>;
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  educationExpenses: EducationExpense[];
  refreshEducation: () => Promise<void>;
  addEducationExpense: (data: Partial<EducationExpense>) => Promise<void>;
  updateEducationExpense: (id: string, data: Partial<EducationExpense>) => Promise<void>;
  deleteEducationExpense: (id: string) => Promise<void>;

  wishlist: WishlistItem[];
  refreshWishlist: () => Promise<void>;
  addWishlistItem: (data: Partial<WishlistItem>) => Promise<void>;
  updateWishlistItem: (id: string, data: Partial<WishlistItem>) => Promise<void>;
  deleteWishlistItem: (id: string) => Promise<void>;

  notifications: NotificationItem[];
  unreadNotifCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  analytics: AnalyticsSummary | null;
  refreshAnalytics: () => Promise<void>;

  // Controls & Preferences
  currency: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  resetDemoData: () => Promise<void>;
  isDailyAlertDismissed: boolean;
  setIsDailyAlertDismissed: (dismissed: boolean) => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txFilters, setTxFilters] = useState<any>({
    search: '',
    category: 'All',
    type: 'all',
    paymentMethod: 'all',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [educationExpenses, setEducationExpenses] = useState<EducationExpense[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('finora_theme') === 'dark';
  });
  const [isDailyAlertDismissed, setIsDailyAlertDismissed] = useState(false);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('finora_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('finora_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Core Refresh Handlers
  const refreshAnalytics = useCallback(async () => {
    try {
      const data = await api.analytics.getSummary();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      const res = await api.transactions.getAll({
        ...txFilters,
        page: txPage,
        limit: 25,
      });
      setTransactions(res.transactions);
      setTotalTransactions(res.total);
    } catch (err) {
      console.error('Failed to load transactions', err);
    }
  }, [txFilters, txPage]);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const refreshBudgets = useCallback(async () => {
    try {
      const data = await api.budgets.getAll();
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets', err);
    }
  }, []);

  const refreshSavingsGoals = useCallback(async () => {
    try {
      const data = await api.savingsGoals.getAll();
      setSavingsGoals(data);
    } catch (err) {
      console.error('Failed to load savings goals', err);
    }
  }, []);

  const refreshBills = useCallback(async () => {
    try {
      const data = await api.bills.getAll();
      setBills(data);
    } catch (err) {
      console.error('Failed to load bills', err);
    }
  }, []);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const data = await api.subscriptions.getAll();
      setSubscriptions(data);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
    }
  }, []);

  const refreshEducation = useCallback(async () => {
    try {
      const data = await api.education.getAll();
      setEducationExpenses(data);
    } catch (err) {
      console.error('Failed to load education expenses', err);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      const data = await api.wishlist.getAll();
      setWishlist(data);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    await Promise.allSettled([
      refreshAnalytics(),
      refreshTransactions(),
      refreshCategories(),
      refreshBudgets(),
      refreshSavingsGoals(),
      refreshBills(),
      refreshSubscriptions(),
      refreshEducation(),
      refreshWishlist(),
      refreshNotifications(),
    ]);
  }, [
    refreshAnalytics,
    refreshTransactions,
    refreshCategories,
    refreshBudgets,
    refreshSavingsGoals,
    refreshBills,
    refreshSubscriptions,
    refreshEducation,
    refreshWishlist,
    refreshNotifications,
  ]);

  // Initial Boot
  useEffect(() => {
    async function boot() {
      setLoading(true);
      try {
        if (!localStorage.getItem('finora_auth_token')) {
          setUser(null);
          return;
        }

        const currentUser = await api.auth.getMe();
        setUser(currentUser);
        await refreshAllData();
      } catch (err) {
        setUser(null);
        console.warn('Could not load user profile. Please sign in again.', err);
        api.auth.logout();
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, [refreshAllData]);

  // Re-fetch transactions on filter/page changes
  useEffect(() => {
    if (!loading && user) {
      refreshTransactions();
    }
  }, [txFilters, txPage, loading, user, refreshTransactions]);

  // Auth functions
  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    setUser(res.user);
    await refreshAllData();
  };

  const register = async (account: { name: string; email: string; password: string; currency: string }) => {
    const res = await api.auth.register(account);
    setUser(res.user);
    await refreshAllData();
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setTransactions([]);
    setTotalTransactions(0);
    setCategories([]);
    setBudgets([]);
    setSavingsGoals([]);
    setBills([]);
    setSubscriptions([]);
    setEducationExpenses([]);
    setWishlist([]);
    setNotifications([]);
    setAnalytics(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.auth.updateProfile(updates);
    setUser(res.user);
    await refreshAnalytics();
  };

  // Transaction mutations
  const addTransaction = async (data: Partial<Transaction>) => {
    const res = await api.transactions.create(data);
    await Promise.all([refreshTransactions(), refreshAnalytics(), refreshBudgets(), refreshNotifications()]);
    return res.transaction;
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    await api.transactions.update(id, data);
    await Promise.all([refreshTransactions(), refreshAnalytics(), refreshBudgets()]);
  };

  const deleteTransaction = async (id: string) => {
    await api.transactions.delete(id);
    await Promise.all([refreshTransactions(), refreshAnalytics(), refreshBudgets()]);
  };

  // Category mutations
  const addCategory = async (data: Partial<Category>) => {
    await api.categories.create(data);
    await refreshCategories();
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    await api.categories.update(id, data);
    await refreshCategories();
  };

  const deleteCategory = async (id: string) => {
    await api.categories.delete(id);
    await refreshCategories();
  };

  // Budget mutations
  const addBudget = async (data: Partial<Budget>) => {
    await api.budgets.create(data);
    await refreshBudgets();
  };

  const updateBudget = async (id: string, data: Partial<Budget>) => {
    await api.budgets.update(id, data);
    await refreshBudgets();
  };

  const deleteBudget = async (id: string) => {
    await api.budgets.delete(id);
    await refreshBudgets();
  };

  // Savings Goal mutations
  const addSavingsGoal = async (data: Partial<SavingsGoal>) => {
    await api.savingsGoals.create(data);
    await refreshSavingsGoals();
  };

  const contributeSavingsGoal = async (id: string, amount: number, deductFromBalance = false) => {
    const res = await api.savingsGoals.contribute(id, amount, deductFromBalance);
    // Confetti celebration if goal reached
    if (res.goal.isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    await Promise.all([refreshSavingsGoals(), refreshAnalytics()]);
    if (deductFromBalance) {
      await refreshTransactions();
    }
  };

  const updateSavingsGoal = async (id: string, data: Partial<SavingsGoal>) => {
    await api.savingsGoals.update(id, data);
    await refreshSavingsGoals();
  };

  const deleteSavingsGoal = async (id: string) => {
    await api.savingsGoals.delete(id);
    await refreshSavingsGoals();
  };

  // Bill mutations
  const addBill = async (data: Partial<Bill>) => {
    await api.bills.create(data);
    await refreshBills();
  };

  const markBillPaid = async (
    id: string,
    autoCreateTransaction = true,
    paymentMethod: PaymentMethod = 'UPI',
  ) => {
    await api.bills.markPaid(id, autoCreateTransaction, paymentMethod);
    await Promise.all([refreshBills(), refreshTransactions(), refreshAnalytics()]);
  };

  const updateBill = async (id: string, data: Partial<Bill>) => {
    await api.bills.update(id, data);
    await refreshBills();
  };

  const deleteBill = async (id: string) => {
    await api.bills.delete(id);
    await refreshBills();
  };

  // Subscription mutations
  const addSubscription = async (data: Partial<Subscription>) => {
    await api.subscriptions.create(data);
    await refreshSubscriptions();
  };

  const updateSubscription = async (id: string, data: Partial<Subscription>) => {
    await api.subscriptions.update(id, data);
    await refreshSubscriptions();
  };

  const deleteSubscription = async (id: string) => {
    await api.subscriptions.delete(id);
    await refreshSubscriptions();
  };

  // Education mutations
  const addEducationExpense = async (data: Partial<EducationExpense>) => {
    await api.education.create(data);
    await refreshEducation();
  };

  const updateEducationExpense = async (id: string, data: Partial<EducationExpense>) => {
    await api.education.update(id, data);
    await refreshEducation();
  };

  const deleteEducationExpense = async (id: string) => {
    await api.education.delete(id);
    await refreshEducation();
  };

  // Wishlist mutations
  const addWishlistItem = async (data: Partial<WishlistItem>) => {
    await api.wishlist.create(data);
    await refreshWishlist();
  };

  const updateWishlistItem = async (id: string, data: Partial<WishlistItem>) => {
    await api.wishlist.update(id, data);
    await refreshWishlist();
  };

  const deleteWishlistItem = async (id: string) => {
    await api.wishlist.delete(id);
    await refreshWishlist();
  };

  // Notification mutations
  const markNotificationRead = async (id: string) => {
    await api.notifications.markRead(id);
    await refreshNotifications();
  };

  const markAllNotificationsRead = async () => {
    await api.notifications.markAllRead();
    await refreshNotifications();
  };

  const deleteNotification = async (id: string) => {
    await api.notifications.delete(id);
    await refreshNotifications();
  };

  const resetDemoData = async () => {
    await api.system.resetDemo();
    await refreshAllData();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Money Tracker alerts are on', {
          body: 'You will receive reminders for upcoming bills and when spending approaches your daily limit.',
          icon: '/favicon.ico',
        });
      }
      return permission;
    }
    return 'denied' as NotificationPermission;
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        transactions,
        totalTransactions,
        txPage,
        setTxPage,
        txFilters,
        setTxFilters,
        refreshTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        budgets,
        refreshBudgets,
        addBudget,
        updateBudget,
        deleteBudget,
        savingsGoals,
        refreshSavingsGoals,
        addSavingsGoal,
        contributeSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        bills,
        refreshBills,
        addBill,
        markBillPaid,
        updateBill,
        deleteBill,
        subscriptions,
        refreshSubscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        educationExpenses,
        refreshEducation,
        addEducationExpense,
        updateEducationExpense,
        deleteEducationExpense,
        wishlist,
        refreshWishlist,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
        notifications,
        unreadNotifCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        analytics,
        refreshAnalytics,
        currency: ({
          INR: '₹',
          USD: '$',
          EUR: '€',
          GBP: '£',
          CAD: 'C$',
          AUD: 'A$',
          JPY: '¥',
        } as Record<string, string>)[user?.currency || 'INR'] || '₹',
        darkMode,
        toggleDarkMode,
        resetDemoData,
        isDailyAlertDismissed,
        setIsDailyAlertDismissed,
        requestNotificationPermission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
