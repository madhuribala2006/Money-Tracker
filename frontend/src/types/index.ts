export type PageId =
  | 'dashboard'
  | 'transactions'
  | 'add-expense'
  | 'add-income'
  | 'budgets'
  | 'categories'
  | 'savings-goals'
  | 'bills'
  | 'subscriptions'
  | 'reports'
  | 'analytics'
  | 'calendar'
  | 'education'
  | 'wishlist'
  | 'financial-health'
  | 'ai-advisor'
  | 'notifications'
  | 'help'
  | 'settings';

export type PaymentMethod = 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking';
export type TransactionType = 'expense' | 'income';

export interface User {
  id: string;
  name: string;
  email: string;
  university?: string;
  studentId?: string;
  course?: string;
  currency: string;
  dailySpendingLimit: number;
  monthlyAllowance: number;
  avatarUrl?: string;
}

export interface Transaction {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string | Date;
  paymentMethod: PaymentMethod;
  notes?: string;
  merchant?: string;
  isEducational?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface Category {
  id?: string;
  _id?: string;
  userId: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  monthlyBudget?: number;
  isCustom?: boolean;
}

export interface Budget {
  id?: string;
  _id?: string;
  userId: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly';
  month?: string;
  alertThreshold: number;
  notes?: string;
  spent?: number;
  percentage?: number;
  remaining?: number;
  isOverBudget?: boolean;
  isWarning?: boolean;
}

export interface SavingsGoal {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | Date;
  category: string;
  icon?: string;
  color?: string;
  isCompleted: boolean;
  notes?: string;
}

export interface Bill {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: string | Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
  category: string;
  isPaid: boolean;
  paidAt?: string | Date;
  dueDay?: number;
  lastPaymentMethod?: PaymentMethod;
  reminderDaysBefore: number;
  notes?: string;
}

export interface Subscription {
  id?: string;
  _id?: string;
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  category: string;
  nextBillingDate: string | Date;
  status: 'active' | 'paused' | 'cancelled';
  serviceUrl?: string;
  planName?: string;
  paymentMethod?: string;
  notes?: string;
}

export type EducationExpenseType = 'Tuition Fee' | 'Books & Materials' | 'Hostel & Mess' | 'Exam Fee' | 'Lab Supplies' | 'Tech & Equipment' | 'Other';

export interface EducationExpense {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  amount: number;
  type: EducationExpenseType;
  academicYear: string;
  dueDate?: string | Date;
  paidDate?: string | Date;
  isPaid: boolean;
  institution: string;
  receiptNumber?: string;
  notes?: string;
}

export interface WishlistItem {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  estimatedPrice: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  savedSoFar: number;
  targetMonth?: string;
  productUrl?: string;
  notes?: string;
  isPurchased: boolean;
}

export type NotificationType = 'daily_limit' | 'budget_warning' | 'bill_due' | 'savings_milestone' | 'subscription' | 'system';

export interface NotificationItem {
  id?: string;
  _id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'urgent';
  createdAt?: string;
}

export interface AnalyticsSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSaved: number;
  thisMonthIncome: number;
  thisMonthPocketMoney: number;
  thisMonthExpense: number;
  thisMonthSavings: number;
  thisYearIncome: number;
  thisYearPocketMoney: number;
  todayExpense: number;
  thisWeekExpense: number;
  thisYearExpense: number;
  thisYearSavings: number;
  dailySpendingLimit: number;
  isDailyLimitExceeded: boolean;
  dailyLimitPercentage: number;
  categoryPercentages: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  last7Days: {
    date: string;
    day: string;
    income: number;
    expense: number;
  }[];
  monthlyTrends: {
    month: string;
    monthKey: string;
    income: number;
    expense: number;
    pocketMoneyIncome: number;
    net: number;
    savingsRate: number;
  }[];
}
