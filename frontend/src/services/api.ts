import axios from 'axios';
import {
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
  User,
  PaymentMethod,
} from '../types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('finora_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  auth: {
    register: async (account: { name: string; email: string; password: string; currency: string }) => {
      const res = await apiClient.post<{ token: string; user: User; message: string }>('/auth/register', account);
      if (res.data.token) {
        localStorage.setItem('finora_auth_token', res.data.token);
      }
      return res.data;
    },
    login: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post<{ token: string; user: User; message: string }>('/auth/login', credentials);
      if (res.data.token) {
        localStorage.setItem('finora_auth_token', res.data.token);
      }
      return res.data;
    },
    getMe: async () => {
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    },
    updateProfile: async (updates: Partial<User>) => {
      const res = await apiClient.put<{ message: string; user: User }>('/auth/profile', updates);
      return res.data;
    },
    logout: () => {
      localStorage.removeItem('finora_auth_token');
    },
  },

  // Transactions
  transactions: {
    getAll: async (params?: {
      search?: string;
      category?: string;
      type?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) => {
      const res = await apiClient.get<{
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/transactions', { params });
      return res.data;
    },
    create: async (data: Partial<Transaction>) => {
      const res = await apiClient.post<{ message: string; transaction: Transaction }>('/transactions', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Transaction>) => {
      const res = await apiClient.put<{ message: string; transaction: Transaction }>(`/transactions/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete<{ message: string }>(`/transactions/${id}`);
      return res.data;
    },
    downloadCsv: async () => {
      const res = await apiClient.get<Blob>('/transactions/export-csv', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  },

  // Categories
  categories: {
    getAll: async () => {
      const res = await apiClient.get<Category[]>('/categories');
      return res.data;
    },
    create: async (data: Partial<Category>) => {
      const res = await apiClient.post<Category>('/categories', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Category>) => {
      const res = await apiClient.put<Category>(`/categories/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/categories/${id}`);
      return res.data;
    },
  },

  // Budgets
  budgets: {
    getAll: async () => {
      const res = await apiClient.get<Budget[]>('/budgets');
      return res.data;
    },
    create: async (data: Partial<Budget>) => {
      const res = await apiClient.post<Budget>('/budgets', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Budget>) => {
      const res = await apiClient.put<Budget>(`/budgets/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/budgets/${id}`);
      return res.data;
    },
  },

  // Savings Goals
  savingsGoals: {
    getAll: async () => {
      const res = await apiClient.get<SavingsGoal[]>('/savings-goals');
      return res.data;
    },
    create: async (data: Partial<SavingsGoal>) => {
      const res = await apiClient.post<SavingsGoal>('/savings-goals', data);
      return res.data;
    },
    contribute: async (id: string, amount: number, deductFromBalance = false) => {
      const res = await apiClient.post<{ message: string; goal: SavingsGoal }>(`/savings-goals/${id}/contribute`, {
        amount,
        deductFromBalance,
      });
      return res.data;
    },
    update: async (id: string, data: Partial<SavingsGoal>) => {
      const res = await apiClient.put<SavingsGoal>(`/savings-goals/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/savings-goals/${id}`);
      return res.data;
    },
  },

  // Bills
  bills: {
    getAll: async () => {
      const res = await apiClient.get<Bill[]>('/bills');
      return res.data;
    },
    create: async (data: Partial<Bill>) => {
      const res = await apiClient.post<Bill>('/bills', data);
      return res.data;
    },
    markPaid: async (
      id: string,
      autoCreateTransaction = true,
      paymentMethod: PaymentMethod = 'UPI',
    ) => {
      const res = await apiClient.post<{ message: string; bill: Bill }>(`/bills/${id}/pay`, {
        autoCreateTransaction,
        paymentMethod,
      });
      return res.data;
    },
    update: async (id: string, data: Partial<Bill>) => {
      const res = await apiClient.put<Bill>(`/bills/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/bills/${id}`);
      return res.data;
    },
  },

  // Subscriptions
  subscriptions: {
    getAll: async () => {
      const res = await apiClient.get<Subscription[]>('/subscriptions');
      return res.data;
    },
    create: async (data: Partial<Subscription>) => {
      const res = await apiClient.post<Subscription>('/subscriptions', data);
      return res.data;
    },
    update: async (id: string, data: Partial<Subscription>) => {
      const res = await apiClient.put<Subscription>(`/subscriptions/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/subscriptions/${id}`);
      return res.data;
    },
  },

  // Education Expenses
  education: {
    getAll: async () => {
      const res = await apiClient.get<EducationExpense[]>('/education');
      return res.data;
    },
    create: async (data: Partial<EducationExpense>) => {
      const res = await apiClient.post<EducationExpense>('/education', data);
      return res.data;
    },
    update: async (id: string, data: Partial<EducationExpense>) => {
      const res = await apiClient.put<EducationExpense>(`/education/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/education/${id}`);
      return res.data;
    },
  },

  // Wishlist
  wishlist: {
    getAll: async () => {
      const res = await apiClient.get<WishlistItem[]>('/wishlist');
      return res.data;
    },
    create: async (data: Partial<WishlistItem>) => {
      const res = await apiClient.post<WishlistItem>('/wishlist', data);
      return res.data;
    },
    update: async (id: string, data: Partial<WishlistItem>) => {
      const res = await apiClient.put<WishlistItem>(`/wishlist/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/wishlist/${id}`);
      return res.data;
    },
  },

  // Notifications
  notifications: {
    getAll: async () => {
      const res = await apiClient.get<NotificationItem[]>('/notifications');
      return res.data;
    },
    markRead: async (id: string) => {
      const res = await apiClient.put<NotificationItem>(`/notifications/${id}/read`);
      return res.data;
    },
    markAllRead: async () => {
      const res = await apiClient.post<{ message: string }>('/notifications/mark-all-read');
      return res.data;
    },
    delete: async (id: string) => {
      const res = await apiClient.delete(`/notifications/${id}`);
      return res.data;
    },
  },

  // Analytics
  analytics: {
    getSummary: async () => {
      const res = await apiClient.get<AnalyticsSummary>('/analytics/summary');
      return res.data;
    },
  },

  // AI Assistant
  ai: {
    chat: async (messages: { role: string; content: string }[], modelPreference?: 'standard' | 'fast') => {
      const res = await apiClient.post<{ reply: string; model: string }>('/ai/chat', {
        messages,
        modelPreference,
      });
      return res.data;
    },
  },

  // System
  system: {
    getHealth: async () => {
      const res = await apiClient.get('/health');
      return res.data;
    },
    resetDemo: async () => {
      const res = await apiClient.post<{ message: string }>('/system/reset-demo');
      return res.data;
    },
  },
};
