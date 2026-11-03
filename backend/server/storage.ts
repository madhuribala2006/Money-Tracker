import fs from 'fs';
import path from 'path';
import { connectDB, getDatabaseStatus } from './db.js';
import { getSeedData, DEMO_USER_ID } from './seedData.js';
import { UserModel, IUser } from './models/User.js';
import { TransactionModel, ITransaction, PaymentMethod, TransactionType } from './models/Transaction.js';
import { CategoryModel, ICategory } from './models/Category.js';
import { BudgetModel, IBudget } from './models/Budget.js';
import { SavingsGoalModel, ISavingsGoal } from './models/SavingsGoal.js';
import { BillModel, IBill } from './models/Bill.js';
import { SubscriptionModel, ISubscription } from './models/Subscription.js';
import { EducationExpenseModel, IEducationExpense } from './models/EducationExpense.js';
import { WishlistModel, IWishlistItem } from './models/Wishlist.js';
import { NotificationModel, INotification } from './models/Notification.js';

interface MemoryStore {
  users: any[];
  categories: any[];
  transactions: any[];
  budgets: any[];
  savingsGoals: any[];
  bills: any[];
  subscriptions: any[];
  educationExpenses: any[];
  wishlist: any[];
  notifications: any[];
}

let memoryStore: MemoryStore | null = null;
const DATA_FILE = path.resolve(process.cwd(), '.finora_store.json');

function uniqueCategories(categories: any[]) {
  const seen = new Set<string>();
  return categories.filter((category) => {
    const name = String(category.name || '').trim().toLowerCase();
    if (!name) return true;

    const key = `${category.type || 'expense'}:${name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function initStorage() {
  const isMongo = await connectDB();

  if (isMongo) {
    // If connected to MongoDB, ensure demo user exists
    const existingUser = await UserModel.findOne({ email: '123@gmail.com' });
    if (!existingUser) {
      console.log('[Storage] Seeding MongoDB with initial demo dataset...');
      const seed = await getSeedData();
      await UserModel.create(seed.user);
      await CategoryModel.insertMany(seed.categories);
      await TransactionModel.insertMany(seed.transactions);
      await BudgetModel.insertMany(seed.budgets);
      await SavingsGoalModel.insertMany(seed.savingsGoals);
      await BillModel.insertMany(seed.bills);
      await SubscriptionModel.insertMany(seed.subscriptions);
      await EducationExpenseModel.insertMany(seed.educationExpenses);
      await WishlistModel.insertMany(seed.wishlist);
      await NotificationModel.insertMany(seed.notifications);
      console.log('[Storage] MongoDB successfully populated with demo data.');
    } else if (existingUser.name !== 'Demo Account' && existingUser.email === '123@gmail.com') {
      await UserModel.updateOne({ _id: existingUser._id }, {
        $set: { name: 'Demo Account', university: '', studentId: '', course: '' },
      });
    }
  } else {
    // Persistent file/in-memory engine
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const storedData = JSON.parse(raw);
        const migratedStore: MemoryStore & { user?: any } = {
          ...storedData,
          users: Array.isArray(storedData.users)
            ? storedData.users
            : storedData.user
              ? [storedData.user]
              : [],
        };
        delete migratedStore.user;
        memoryStore = migratedStore;
        const demoUser = migratedStore.users.find((storedUser) =>
          storedUser.email?.toLowerCase() === '123@gmail.com'
        );
        if (demoUser && ['Aarav Sharma', 'Madhuri Bala'].includes(demoUser.name)) {
          demoUser.name = 'Demo Account';
          persistLocalStore();
        }
        console.log('[Storage] Loaded local money management data from disk.');
      } catch (err) {
        console.warn('[Storage] Error reading local store file, re-initializing seed data.');
      }
    }

    if (!memoryStore) {
      const seed = await getSeedData();
      memoryStore = { ...seed, users: [seed.user] };
      delete (memoryStore as MemoryStore & { user?: any }).user;
      persistLocalStore();
      console.log('[Storage] Initialized the local demo data.');
    }
  }
}

function persistLocalStore() {
  if (!memoryStore) return;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Failed to persist local data store:', err);
    throw err;
  }
}

// ---------------- USER OPERATIONS ----------------
const DEFAULT_CATEGORIES = [
  ['Housing', 'Home', '#0f766e', 'expense'],
  ['Utilities', 'Zap', '#d97706', 'expense'],
  ['Groceries', 'ShoppingBag', '#16a34a', 'expense'],
  ['Transportation', 'Bus', '#0284c7', 'expense'],
  ['Health', 'HeartPulse', '#e11d48', 'expense'],
  ['Dining', 'Utensils', '#f97316', 'expense'],
  ['Entertainment', 'Film', '#8b5cf6', 'expense'],
  ['Personal', 'User', '#ec4899', 'expense'],
  ['Other expenses', 'Receipt', '#64748b', 'expense'],
  ['Salary', 'Briefcase', '#0f766e', 'income'],
  ['Other income', 'Wallet', '#16a34a', 'income'],
] as const;

function getDefaultCategories(userId: string) {
  return DEFAULT_CATEGORIES.map(([name, icon, color, type], index) => ({
    id: `${userId}-category-${index + 1}`,
    userId,
    name,
    icon,
    color,
    type,
    monthlyBudget: 0,
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function getUserByEmail(email: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await UserModel.findOne({ email: email.toLowerCase() });
  }
  return memoryStore?.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    if (id === DEMO_USER_ID) {
      return await UserModel.findOne({ email: '123@gmail.com' });
    }
    return await UserModel.findById(id) || await UserModel.findOne({ _id: id });
  }
  return memoryStore?.users.find((user) => user.id === id || user._id === id) || null;
}

export async function createUserAccount(userData: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
}) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    const user = await UserModel.create(userData);
    const categories = getDefaultCategories(String(user._id)).map(({ id, ...category }) => category);
    await CategoryModel.insertMany(categories);
    return user;
  }
  if (!memoryStore) throw new Error('Store not ready');
  if (memoryStore.users.some((user) => user.email?.toLowerCase() === userData.email.toLowerCase())) {
    throw new Error('An account with this email already exists');
  }
  const user = {
    ...userData,
    currency: userData.currency,
    dailySpendingLimit: 400,
    monthlyAllowance: 0,
    avatarUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.users.push(user);
  memoryStore.categories.push(...getDefaultCategories(userData.id));
  persistLocalStore();
  return user;
}

export async function updateUser(id: string, updates: Partial<IUser>) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    const user = id === DEMO_USER_ID
      ? await UserModel.findOne({ email: '123@gmail.com' })
      : await UserModel.findById(id);
    return user ? await UserModel.findByIdAndUpdate(user._id, updates, { new: true }) : null;
  }
  if (memoryStore) {
    const index = memoryStore.users.findIndex((user) => user.id === id || user._id === id);
    if (index === -1) return null;
    memoryStore.users[index] = { ...memoryStore.users[index], ...updates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.users[index];
  }
  return null;
}

// ---------------- TRANSACTIONS ----------------
export async function getTransactions(userId: string, filters: {
  search?: string;
  category?: string;
  type?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const status = getDatabaseStatus();
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 20);

  if (status.isConnected) {
    const query: any = { userId };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { merchant: { $regex: filters.search, $options: 'i' } },
        { notes: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.category && filters.category !== 'All') {
      query.category = filters.category;
    }
    if (filters.type && filters.type !== 'all') {
      query.type = filters.type;
    }
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      query.paymentMethod = filters.paymentMethod;
    }
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const total = await TransactionModel.countDocuments(query);
    const transactions = await TransactionModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Memory store fallback
  let list = (memoryStore?.transactions || []).filter((transaction) => transaction.userId === userId);

  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(t =>
      (t.title && t.title.toLowerCase().includes(s)) ||
      (t.merchant && t.merchant.toLowerCase().includes(s)) ||
      (t.notes && t.notes.toLowerCase().includes(s)) ||
      (t.category && t.category.toLowerCase().includes(s))
    );
  }
  if (filters.category && filters.category !== 'All') {
    list = list.filter(t => t.category === filters.category);
  }
  if (filters.type && filters.type !== 'all') {
    list = list.filter(t => t.type === filters.type);
  }
  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    list = list.filter(t => t.paymentMethod === filters.paymentMethod);
  }
  if (filters.startDate) {
    const sDate = new Date(filters.startDate).getTime();
    list = list.filter(t => new Date(t.date).getTime() >= sDate);
  }
  if (filters.endDate) {
    const eDate = new Date(filters.endDate).getTime();
    list = list.filter(t => new Date(t.date).getTime() <= eDate);
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return { transactions: paginated, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function addTransaction(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await TransactionModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newTx = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...data,
    date: data.date ? new Date(data.date) : new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.transactions.unshift(newTx);
  persistLocalStore();
  checkAndTriggerAlerts(data.userId);
  return newTx;
}

export async function updateTransaction(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await TransactionModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) throw new Error('Store not ready');
  const idx = memoryStore.transactions.findIndex(t =>
    (t.id === id || t._id === id) && t.userId === userId
  );
  if (idx !== -1) {
    memoryStore.transactions[idx] = { ...memoryStore.transactions[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.transactions[idx];
  }
  return null;
}

export async function deleteTransaction(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await TransactionModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLen = memoryStore.transactions.length;
  memoryStore.transactions = memoryStore.transactions.filter(t =>
    (t.id !== id && t._id !== id) || t.userId !== userId
  );
  persistLocalStore();
  return memoryStore.transactions.length < initialLen;
}

// ---------------- CATEGORIES ----------------
export async function getCategories(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    const categories = await CategoryModel.find({ userId }).sort({ createdAt: 1, _id: 1 });
    return uniqueCategories(categories);
  }
  return uniqueCategories((memoryStore?.categories || []).filter((category) => category.userId === userId));
}

export async function addCategory(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await CategoryModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newCat = {
    id: `cat-${Date.now()}`,
    ...data,
    isCustom: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.categories.push(newCat);
  persistLocalStore();
  return newCat;
}

export async function updateCategory(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await CategoryModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.categories.findIndex(c =>
    (c.id === id || c._id === id) && c.userId === userId
  );
  if (idx !== -1) {
    memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.categories[idx];
  }
  return null;
}

export async function deleteCategory(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await CategoryModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.categories.length;
  memoryStore.categories = memoryStore.categories.filter(c =>
    (c.id !== id && c._id !== id) || c.userId !== userId
  );
  persistLocalStore();
  return memoryStore.categories.length < initialLength;
}

// ---------------- BUDGETS ----------------
export async function getBudgets(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BudgetModel.find({ userId });
  }
  return (memoryStore?.budgets || []).filter((budget) => budget.userId === userId);
}

export async function addBudget(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BudgetModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newBudget = {
    id: `bdg-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.budgets.push(newBudget);
  persistLocalStore();
  return newBudget;
}

export async function updateBudget(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BudgetModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.budgets.findIndex(b =>
    (b.id === id || b._id === id) && b.userId === userId
  );
  if (idx !== -1) {
    memoryStore.budgets[idx] = { ...memoryStore.budgets[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.budgets[idx];
  }
  return null;
}

export async function deleteBudget(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BudgetModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.budgets.length;
  memoryStore.budgets = memoryStore.budgets.filter(b =>
    (b.id !== id && b._id !== id) || b.userId !== userId
  );
  persistLocalStore();
  return memoryStore.budgets.length < initialLength;
}

// ---------------- SAVINGS GOALS ----------------
export async function getSavingsGoals(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SavingsGoalModel.find({ userId });
  }
  return (memoryStore?.savingsGoals || []).filter((goal) => goal.userId === userId);
}

export async function addSavingsGoal(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SavingsGoalModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newGoal = {
    id: `sg-${Date.now()}`,
    ...data,
    currentAmount: Number(data.currentAmount || 0),
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.savingsGoals.push(newGoal);
  persistLocalStore();
  return newGoal;
}

export async function contributeSavingsGoal(id: string, userId: string, amount: number) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    const goal = await SavingsGoalModel.findOne({ _id: id, userId });
    if (!goal) return null;
    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    await goal.save();
    return goal;
  }
  if (!memoryStore) return null;
  const idx = memoryStore.savingsGoals.findIndex(g =>
    (g.id === id || g._id === id) && g.userId === userId
  );
  if (idx !== -1) {
    const g = memoryStore.savingsGoals[idx];
    g.currentAmount = (g.currentAmount || 0) + amount;
    if (g.currentAmount >= g.targetAmount) {
      g.isCompleted = true;
    }
    g.updatedAt = new Date();
    persistLocalStore();
    return g;
  }
  return null;
}

export async function updateSavingsGoal(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SavingsGoalModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.savingsGoals.findIndex(g =>
    (g.id === id || g._id === id) && g.userId === userId
  );
  if (idx !== -1) {
    memoryStore.savingsGoals[idx] = { ...memoryStore.savingsGoals[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.savingsGoals[idx];
  }
  return null;
}

export async function deleteSavingsGoal(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SavingsGoalModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.savingsGoals.length;
  memoryStore.savingsGoals = memoryStore.savingsGoals.filter(g =>
    (g.id !== id && g._id !== id) || g.userId !== userId
  );
  persistLocalStore();
  return memoryStore.savingsGoals.length < initialLength;
}

// ---------------- BILLS AND REMINDERS ----------------
export async function getBills(userId: string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const period = `${year}-${String(month + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const forCurrentMonth = (bill: any) => {
    const plainBill = typeof bill.toObject === 'function' ? bill.toObject() : { ...bill };
    if (plainBill.frequency !== 'monthly') return plainBill;
    const anchorDate = new Date(plainBill.dueDate);
    const dueDay = Number(plainBill.dueDay) || anchorDate.getUTCDate();
    const paidPeriod = plainBill.paidAt
      ? new Date(plainBill.paidAt).toISOString().slice(0, 7)
      : null;
    return {
      ...plainBill,
      dueDay,
      dueDate: new Date(Date.UTC(year, month, Math.min(dueDay, daysInMonth), 12)),
      isPaid: paidPeriod === period,
    };
  };
  const status = getDatabaseStatus();
  if (status.isConnected) {
    const bills = await BillModel.find({ userId }).sort({ dueDate: 1 });
    return bills.map(forCurrentMonth).sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }
  const bills = (memoryStore?.bills || [])
    .filter((bill) => bill.userId === userId)
    .map(forCurrentMonth);
  bills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  return bills;
}

export async function addBill(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BillModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newBill = {
    id: `bill-${Date.now()}`,
    ...data,
    isPaid: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.bills.push(newBill);
  persistLocalStore();
  return newBill;
}

export async function markBillPaid(
  id: string,
  userId: string,
  autoCreateTransaction = true,
  paymentMethod: 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Net Banking' = 'UPI',
) {
  const now = new Date();
  const currentPeriod = now.toISOString().slice(0, 7);
  const recordPayment = async (bill: any) => {
    const alreadyPaidThisMonth = bill.frequency === 'monthly'
      && bill.paidAt
      && new Date(bill.paidAt).toISOString().slice(0, 7) === currentPeriod;
    if (alreadyPaidThisMonth) return bill;

    bill.isPaid = true;
    bill.paidAt = now;
    bill.lastPaymentMethod = paymentMethod;
    if (typeof bill.save === 'function') await bill.save();
    else bill.updatedAt = now;

    if (autoCreateTransaction) {
      const transactionData = {
        userId: bill.userId,
        title: `Bill Paid: ${bill.title}`,
        amount: bill.amount,
        type: 'expense' as const,
        category: bill.category || 'Electricity/current bill',
        date: now,
        paymentMethod,
        notes: `Bill payment record for ${bill.title}`,
      };
      if (getDatabaseStatus().isConnected) {
        await TransactionModel.create(transactionData);
      } else {
        await addTransaction(transactionData);
      }
    }
    return bill;
  };
  const status = getDatabaseStatus();
  if (status.isConnected) {
    const bill = await BillModel.findOne({ _id: id, userId });
    if (!bill) return null;
    return recordPayment(bill);
  }
  if (!memoryStore) return null;
  const idx = memoryStore.bills.findIndex(b =>
    (b.id === id || b._id === id) && b.userId === userId
  );
  if (idx !== -1) {
    const b = memoryStore.bills[idx];
    await recordPayment(b);
    persistLocalStore();
    return b;
  }
  return null;
}

export async function updateBill(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  if (safeUpdates.dueDate) {
    safeUpdates.dueDate = new Date(safeUpdates.dueDate);
    safeUpdates.dueDay = safeUpdates.dueDate.getUTCDate();
  }
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BillModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.bills.findIndex(b =>
    (b.id === id || b._id === id) && b.userId === userId
  );
  if (idx !== -1) {
    memoryStore.bills[idx] = { ...memoryStore.bills[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.bills[idx];
  }
  return null;
}

export async function deleteBill(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await BillModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.bills.length;
  memoryStore.bills = memoryStore.bills.filter(b =>
    (b.id !== id && b._id !== id) || b.userId !== userId
  );
  persistLocalStore();
  return memoryStore.bills.length < initialLength;
}

// ---------------- SUBSCRIPTIONS ----------------
export async function getSubscriptions(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SubscriptionModel.find({ userId });
  }
  return (memoryStore?.subscriptions || []).filter((subscription) => subscription.userId === userId);
}

export async function addSubscription(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SubscriptionModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newSub = {
    id: `sub-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.subscriptions.push(newSub);
  persistLocalStore();
  return newSub;
}

export async function updateSubscription(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SubscriptionModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.subscriptions.findIndex(s =>
    (s.id === id || s._id === id) && s.userId === userId
  );
  if (idx !== -1) {
    memoryStore.subscriptions[idx] = { ...memoryStore.subscriptions[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.subscriptions[idx];
  }
  return null;
}

export async function deleteSubscription(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await SubscriptionModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.subscriptions.length;
  memoryStore.subscriptions = memoryStore.subscriptions.filter(s =>
    (s.id !== id && s._id !== id) || s.userId !== userId
  );
  persistLocalStore();
  return memoryStore.subscriptions.length < initialLength;
}

// ---------------- EDUCATION EXPENSES ----------------
export async function getEducationExpenses(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await EducationExpenseModel.find({ userId });
  }
  return (memoryStore?.educationExpenses || []).filter((expense) => expense.userId === userId);
}

export async function addEducationExpense(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await EducationExpenseModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newEdu = {
    id: `edu-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.educationExpenses.push(newEdu);
  persistLocalStore();
  return newEdu;
}

export async function updateEducationExpense(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await EducationExpenseModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.educationExpenses.findIndex(e =>
    (e.id === id || e._id === id) && e.userId === userId
  );
  if (idx !== -1) {
    memoryStore.educationExpenses[idx] = { ...memoryStore.educationExpenses[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.educationExpenses[idx];
  }
  return null;
}

export async function deleteEducationExpense(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await EducationExpenseModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.educationExpenses.length;
  memoryStore.educationExpenses = memoryStore.educationExpenses.filter(e =>
    (e.id !== id && e._id !== id) || e.userId !== userId
  );
  persistLocalStore();
  return memoryStore.educationExpenses.length < initialLength;
}

// ---------------- WISHLIST ----------------
export async function getWishlist(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await WishlistModel.find({ userId });
  }
  return (memoryStore?.wishlist || []).filter((item) => item.userId === userId);
}

export async function addWishlistItem(data: any) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await WishlistModel.create(data);
  }
  if (!memoryStore) throw new Error('Store not ready');
  const newItem = {
    id: `wish-${Date.now()}`,
    ...data,
    savedSoFar: Number(data.savedSoFar || 0),
    isPurchased: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryStore.wishlist.push(newItem);
  persistLocalStore();
  return newItem;
}

export async function updateWishlistItem(id: string, userId: string, updates: any) {
  const { userId: _ignoredUserId, ...safeUpdates } = updates;
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await WishlistModel.findOneAndUpdate({ _id: id, userId }, safeUpdates, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.wishlist.findIndex(w =>
    (w.id === id || w._id === id) && w.userId === userId
  );
  if (idx !== -1) {
    memoryStore.wishlist[idx] = { ...memoryStore.wishlist[idx], ...safeUpdates, updatedAt: new Date() };
    persistLocalStore();
    return memoryStore.wishlist[idx];
  }
  return null;
}

export async function deleteWishlistItem(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await WishlistModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.wishlist.length;
  memoryStore.wishlist = memoryStore.wishlist.filter(w =>
    (w.id !== id && w._id !== id) || w.userId !== userId
  );
  persistLocalStore();
  return memoryStore.wishlist.length < initialLength;
}

// ---------------- NOTIFICATIONS ----------------
export async function getNotifications(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await NotificationModel.find({ userId }).sort({ createdAt: -1 });
  }
  return (memoryStore?.notifications || []).filter((notification) => notification.userId === userId);
}

export async function markNotificationAsRead(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await NotificationModel.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
  }
  if (!memoryStore) return null;
  const idx = memoryStore.notifications.findIndex(n =>
    (n.id === id || n._id === id) && n.userId === userId
  );
  if (idx !== -1) {
    memoryStore.notifications[idx].isRead = true;
    persistLocalStore();
    return memoryStore.notifications[idx];
  }
  return null;
}

export async function markAllNotificationsRead(userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    await NotificationModel.updateMany({ userId }, { isRead: true });
    return true;
  }
  if (!memoryStore) return false;
  memoryStore.notifications.forEach((notification) => {
    if (notification.userId === userId) notification.isRead = true;
  });
  persistLocalStore();
  return true;
}

export async function deleteNotification(id: string, userId: string) {
  const status = getDatabaseStatus();
  if (status.isConnected) {
    return await NotificationModel.findOneAndDelete({ _id: id, userId });
  }
  if (!memoryStore) return false;
  const initialLength = memoryStore.notifications.length;
  memoryStore.notifications = memoryStore.notifications.filter(n =>
    (n.id !== id && n._id !== id) || n.userId !== userId
  );
  persistLocalStore();
  return memoryStore.notifications.length < initialLength;
}

// ---------------- ANALYTICS & SUMMARY ENGINE ----------------
export async function getAnalyticsSummary(userId: string) {
  const { transactions } = await getTransactions(userId, { limit: 1000 });
  const user = await getUserById(userId);
  const dailyThreshold = user?.dailySpendingLimit || 400;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);
  const currentYear = now.getUTCFullYear();

  let totalIncome = 0;
  let totalExpense = 0;
  let todayExpense = 0;
  let thisWeekExpense = 0;
  let thisMonthIncome = 0;
  let thisMonthPocketMoney = 0;
  let thisMonthExpense = 0;
  let thisYearIncome = 0;
  let thisYearPocketMoney = 0;
  let thisYearExpense = 0;

  const categoryTotals: Record<string, number> = {};
  const dailyHistory: Record<string, { income: number; expense: number }> = {};
  const monthlyHistory: Record<string, { income: number; expense: number; pocketMoney: number }> = {};

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  transactions.forEach((tx: any) => {
    const txDate = new Date(tx.date);
    const dateStr = txDate.toISOString().slice(0, 10);
    const monthStr = txDate.toISOString().slice(0, 7);
    const amt = Number(tx.amount);

    if (!dailyHistory[dateStr]) {
      dailyHistory[dateStr] = { income: 0, expense: 0 };
    }
    if (!monthlyHistory[monthStr]) {
      monthlyHistory[monthStr] = { income: 0, expense: 0, pocketMoney: 0 };
    }

    if (tx.type === 'income') {
      totalIncome += amt;
      dailyHistory[dateStr].income += amt;
      monthlyHistory[monthStr].income += amt;
      const isPocketMoney = /pocket money|allowance/i.test(String(tx.category || ''));
      if (isPocketMoney) {
        monthlyHistory[monthStr].pocketMoney += amt;
      }
      if (monthStr === currentMonthStr) {
        thisMonthIncome += amt;
        if (isPocketMoney) thisMonthPocketMoney += amt;
      }
      if (txDate.getUTCFullYear() === currentYear) {
        thisYearIncome += amt;
        if (isPocketMoney) thisYearPocketMoney += amt;
      }
    } else {
      totalExpense += amt;
      dailyHistory[dateStr].expense += amt;
      monthlyHistory[monthStr].expense += amt;

      // Category breakdown
      const cat = tx.category || 'Other expenses';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      // Today
      if (dateStr === todayStr) {
        todayExpense += amt;
      }
      // This week
      if (txDate >= oneWeekAgo) {
        thisWeekExpense += amt;
      }
      // This month
      if (monthStr === currentMonthStr) {
        thisMonthExpense += amt;
      }
      // This year
      if (txDate.getUTCFullYear() === currentYear) {
        thisYearExpense += amt;
      }
    }
  });

  const totalBalance = totalIncome - totalExpense;

  // Category percentage breakdown
  const categoryPercentages = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100 * 10) / 10 : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Daily alert status
  const isDailyLimitExceeded = todayExpense > dailyThreshold;
  const dailyLimitPercentage = Math.round((todayExpense / dailyThreshold) * 100);

  // Recent 7 days chart points
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    last7Days.push({
      date: dStr,
      day: dayLabel,
      income: dailyHistory[dStr]?.income || 0,
      expense: dailyHistory[dStr]?.expense || 0,
    });
  }

  // Show every month in the current calendar year, including months with no activity.
  const monthlyTrends = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(currentYear, i, 1, 12));
    const mStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    const mLabel = d.toLocaleDateString('en-US', { month: 'short' });

    const mInc = monthlyHistory[mStr]?.income || 0;
    const mExp = monthlyHistory[mStr]?.expense || 0;
    const net = mInc - mExp;

    monthlyTrends.push({
      month: mLabel,
      monthKey: mStr,
      income: mInc,
      expense: mExp,
      pocketMoneyIncome: monthlyHistory[mStr]?.pocketMoney || 0,
      net,
      savingsRate: mInc > 0 ? Math.round((net / mInc) * 100) : 0,
    });
  }

  const savingsGoals = await getSavingsGoals(userId);
  const totalSaved = savingsGoals.reduce((sum: number, g: any) => sum + (Number(g.currentAmount) || 0), 0);

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    totalSaved,
    thisMonthIncome,
    thisMonthPocketMoney,
    thisMonthExpense,
    thisMonthSavings: thisMonthIncome - thisMonthExpense,
    thisYearIncome,
    thisYearPocketMoney,
    todayExpense,
    thisWeekExpense,
    thisYearExpense,
    thisYearSavings: thisYearIncome - thisYearExpense,
    dailySpendingLimit: dailyThreshold,
    isDailyLimitExceeded,
    dailyLimitPercentage,
    categoryPercentages,
    last7Days,
    monthlyTrends,
  };
}

// Check and trigger daily limit notification if applicable
async function checkAndTriggerAlerts(userId: string) {
  try {
    const summary = await getAnalyticsSummary(userId);
    if (summary.isDailyLimitExceeded) {
      const existing = (await getNotifications(userId)).find(
        (n: any) => n.type === 'daily_limit' && new Date(n.createdAt).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
      );
      if (!existing) {
        const notifData = {
          userId,
          type: 'daily_limit',
          title: `Daily Limit Exceeded: ₹${summary.todayExpense} spent`,
          message: `Your daily expenses today have surpassed the ₹${summary.dailySpendingLimit} threshold by ₹${summary.todayExpense - summary.dailySpendingLimit}.`,
          isRead: false,
          priority: 'urgent',
        };
        const status = getDatabaseStatus();
        if (status.isConnected) {
          await NotificationModel.create(notifData);
        } else if (memoryStore) {
          memoryStore.notifications.unshift({
            id: `notif-${Date.now()}`,
            ...notifData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          persistLocalStore();
        }
      }
    }
  } catch (err) {
    console.error('Error triggering spend alerts:', err);
  }
}

export async function resetStorageToSeed(userId: string) {
  const seed = await getSeedData();
  const status = getDatabaseStatus();
  if (status.isConnected) {
    await Promise.all([
      CategoryModel.deleteMany({ userId }),
      TransactionModel.deleteMany({ userId }),
      BudgetModel.deleteMany({ userId }),
      SavingsGoalModel.deleteMany({ userId }),
      BillModel.deleteMany({ userId }),
      SubscriptionModel.deleteMany({ userId }),
      EducationExpenseModel.deleteMany({ userId }),
      WishlistModel.deleteMany({ userId }),
      NotificationModel.deleteMany({ userId }),
    ]);
    if (userId === DEMO_USER_ID) {
      await CategoryModel.insertMany(seed.categories);
      await TransactionModel.insertMany(seed.transactions);
      await BudgetModel.insertMany(seed.budgets);
      await SavingsGoalModel.insertMany(seed.savingsGoals);
      await BillModel.insertMany(seed.bills);
      await SubscriptionModel.insertMany(seed.subscriptions);
      await EducationExpenseModel.insertMany(seed.educationExpenses);
      await WishlistModel.insertMany(seed.wishlist);
      await NotificationModel.insertMany(seed.notifications);
    } else {
      const categories = getDefaultCategories(userId).map(({ id, ...category }) => category);
      await CategoryModel.insertMany(categories);
    }
  } else {
    if (!memoryStore) throw new Error('Store not ready');
    const collections: (keyof Pick<MemoryStore,
      'categories' | 'transactions' | 'budgets' | 'savingsGoals' | 'bills' |
      'subscriptions' | 'educationExpenses' | 'wishlist' | 'notifications'
    >)[] = [
      'categories', 'transactions', 'budgets', 'savingsGoals', 'bills',
      'subscriptions', 'educationExpenses', 'wishlist', 'notifications',
    ];
    for (const collection of collections) {
      memoryStore[collection] = memoryStore[collection].filter((entry: any) => entry.userId !== userId) as never;
    }
    if (userId === DEMO_USER_ID) {
      for (const collection of collections) {
        memoryStore[collection].push(...(seed[collection] as any[]).filter((entry: any) => entry.userId === userId));
      }
    } else {
      memoryStore.categories.push(...getDefaultCategories(userId));
    }
    persistLocalStore();
  }
  return true;
}
