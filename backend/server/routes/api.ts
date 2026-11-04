import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthenticatedRequest, generateToken } from '../middleware/auth.js';
import * as storage from '../storage.js';
import { getDatabaseStatus } from '../db.js';
import { DEMO_USER_ID } from '../seedData.js';
import { aiRouter } from './ai.js';
import { randomUUID } from 'crypto';

export const apiRouter = express.Router();

// Public Health Check
apiRouter.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    app: 'Money Management System',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// ---------------- AUTH ROUTES ----------------
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const currency = typeof req.body.currency === 'string' ? req.body.currency : 'INR';

    if (!name || name.length > 80) {
      return res.status(400).json({ error: 'Enter your name (up to 80 characters)' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ error: 'Password must be 8–72 bytes long' });
    }
    if (!['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].includes(currency)) {
      return res.status(400).json({ error: 'Choose a supported currency' });
    }
    if (await storage.getUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await storage.createUserAccount({
      id: randomUUID(),
      name,
      email,
      passwordHash,
      currency,
    });
    const userId = user.email.toLowerCase() === '123@gmail.com'
      ? DEMO_USER_ID
      : String(user.id || user._id);
    const token = generateToken({ userId, email: user.email, name: user.name });
    res.status(201).json({
      message: 'Your account is ready',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR',
        dailySpendingLimit: user.dailySpendingLimit || 400,
        monthlyAllowance: user.monthlyAllowance ?? 0,
      },
    });
  } catch (err: any) {
    if (err?.code === 11000 || err?.message === 'An account with this email already exists') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Account registration failed:', err);
    res.status(500).json({ error: 'Could not create your account. Please try again.' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await storage.getUserByEmail(email) ||
      (email === '123@gmsil.com' ? await storage.getUserByEmail('123@gmail.com') : null);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.email.toLowerCase() === '123@gmail.com'
        ? DEMO_USER_ID
        : user.id || user._id || email,
      email: user.email,
      name: user.name,
    });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        university: user.university || '',
        course: user.course || '',
        studentId: user.studentId || '',
        currency: user.currency || 'INR',
        dailySpendingLimit: user.dailySpendingLimit || 400,
        monthlyAllowance: user.monthlyAllowance ?? 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

apiRouter.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await storage.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const safeUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      university: user.university || '',
      course: user.course || '',
      studentId: user.studentId || '',
      currency: user.currency || 'INR',
      dailySpendingLimit: user.dailySpendingLimit || 400,
      monthlyAllowance: user.monthlyAllowance ?? 0,
      avatarUrl: user.avatarUrl,
    };
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/auth/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    if (updates.currency !== undefined && !['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].includes(updates.currency)) {
      return res.status(400).json({ error: 'Choose a supported currency' });
    }
    delete updates.passwordHash;
    delete updates._id;
    delete updates.id;
    const updated = await storage.updateUser(req.user!.id, updates);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- TRANSACTIONS ----------------
apiRouter.get('/transactions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, category, type, paymentMethod, startDate, endDate, page, limit } = req.query;
    const result = await storage.getTransactions(req.user!.id, {
      search: search as string,
      category: category as string,
      type: type as string,
      paymentMethod: paymentMethod as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/transactions/export-csv', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await storage.getTransactions(req.user!.id, { limit: 10000 });
    const csvCell = (value: string | number) => {
      const text = String(value);
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const rows = [
      ['Transaction ID', 'Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Merchant/Payee', 'Notes'].map(csvCell).join(',')
    ];

    result.transactions.forEach((tx: any) => {
      const id = tx.id || tx._id || '';
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      const type = tx.type;
      const amount = tx.amount;
      const paymentMethod = tx.paymentMethod || 'UPI';
      rows.push([
        id,
        date,
        tx.title || '',
        type,
        tx.category || '',
        amount,
        paymentMethod,
        tx.merchant || '',
        tx.notes || '',
      ].map(csvCell).join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `attachment; filename="finora_transactions_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(rows.join('\n'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/transactions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes, merchant, isEducational, tags } = req.body;
    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({ error: 'Title, amount, type, and category are required' });
    }

    const tx = await storage.addTransaction({
      userId: req.user!.id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      notes: notes || '',
      merchant: merchant || '',
      isEducational: Boolean(isEducational),
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({ message: 'Transaction recorded successfully', transaction: tx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/transactions/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateTransaction(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction updated', transaction: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/transactions/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = await storage.deleteTransaction(req.params.id, req.user!.id);
    if (!ok) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CATEGORIES ----------------
apiRouter.get('/categories', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getCategories(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/categories', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type, icon, color, monthlyBudget } = req.body;
    const categoryName = typeof name === 'string' ? name.trim() : '';
    if (!categoryName) return res.status(400).json({ error: 'Category name is required' });
    if (type !== undefined && type !== 'expense' && type !== 'income') {
      return res.status(400).json({ error: 'Category type must be expense or income' });
    }

    const categoryType = type || 'expense';
    const existing = (await storage.getCategories(req.user!.id)).find((category: any) =>
      category.type === categoryType &&
      String(category.name).trim().toLowerCase() === categoryName.toLowerCase()
    );
    if (existing) {
      return res.status(409).json({ error: 'A category with this name and type already exists' });
    }

    const cat = await storage.addCategory({
      userId: req.user!.id,
      name: categoryName,
      type: categoryType,
      icon: icon || 'Tag',
      color: color || '#6366f1',
      monthlyBudget: Number(monthlyBudget) || 0,
    });
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/categories/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateCategory(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/categories/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteCategory(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- BUDGETS ----------------
apiRouter.get('/budgets', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budgets = await storage.getBudgets(req.user!.id);
    const summary = await storage.getAnalyticsSummary(req.user!.id);

    // Enrich budgets with actual spending from summary
    const enriched = budgets.map((b: any) => {
      let spent = 0;
      if (b.category === 'Overall') {
        spent = summary.thisMonthExpense;
      } else {
        const catStat = summary.categoryPercentages.find((cp: any) => cp.name.toLowerCase() === b.category.toLowerCase());
        spent = catStat ? catStat.amount : 0;
      }
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      const remaining = Math.max(0, b.amount - spent);
      const isOverBudget = spent > b.amount;
      const isWarning = percentage >= (b.alertThreshold || 80);

      return {
        ...b,
        spent,
        percentage,
        remaining,
        isOverBudget,
        isWarning,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/budgets', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, amount, period, alertThreshold, notes } = req.body;
    if (!category || amount === undefined) {
      return res.status(400).json({ error: 'Category and amount are required' });
    }
    const budget = await storage.addBudget({
      userId: req.user!.id,
      category,
      amount: Number(amount),
      period: period || 'monthly',
      alertThreshold: Number(alertThreshold) || 80,
      notes: notes || '',
    });
    res.status(201).json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/budgets/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateBudget(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Budget not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/budgets/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteBudget(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SAVINGS GOALS ----------------
apiRouter.get('/savings-goals', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getSavingsGoals(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/savings-goals', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, targetAmount, currentAmount, deadline, category, icon, color, notes } = req.body;
    if (!title || !targetAmount) {
      return res.status(400).json({ error: 'Title and target amount are required' });
    }
    const goal = await storage.addSavingsGoal({
      userId: req.user!.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      category: category || 'General',
      icon: icon || 'Target',
      color: color || '#10b981',
      notes: notes || '',
    });
    res.status(201).json(goal);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/savings-goals/:id/contribute', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, deductFromBalance } = req.body;
    const addAmt = Number(amount);
    if (!addAmt || addAmt <= 0) {
      return res.status(400).json({ error: 'Valid positive contribution amount required' });
    }

    const updated = await storage.contributeSavingsGoal(req.params.id, req.user!.id, addAmt);
    if (!updated) return res.status(404).json({ error: 'Savings goal not found' });

    if (deductFromBalance) {
      await storage.addTransaction({
        userId: req.user!.id,
        title: `Contribution to ${updated.title}`,
        amount: addAmt,
        type: 'expense',
        category: 'Other expenses',
        date: new Date(),
        paymentMethod: 'UPI',
        notes: `Savings goal deposit into ${updated.title}`,
      });
    }

    res.json({ message: 'Contribution added successfully', goal: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/savings-goals/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateSavingsGoal(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Savings goal not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/savings-goals/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteSavingsGoal(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Savings goal not found' });
    res.json({ message: 'Goal removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- BILLS & REMINDERS ----------------
apiRouter.get('/bills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getBills(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bills', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, amount, dueDate, frequency, category, reminderDaysBefore, notes } = req.body;
    if (!title || !amount || !dueDate) {
      return res.status(400).json({ error: 'Title, amount, and due date are required' });
    }
    const bill = await storage.addBill({
      userId: req.user!.id,
      title,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      dueDay: new Date(dueDate).getUTCDate(),
      frequency: frequency || 'monthly',
      category: category || 'Bills & Utilities',
      reminderDaysBefore: Number(reminderDaysBefore) || 3,
      notes: notes || '',
    });
    res.status(201).json(bill);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/bills/:id/pay', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { autoCreateTransaction, paymentMethod = 'UPI' } = req.body;
    const allowedPaymentMethods = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking'];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Choose a valid payment method' });
    }
    const bill = await storage.markBillPaid(
      req.params.id,
      req.user!.id,
      autoCreateTransaction !== false,
      paymentMethod,
    );
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Bill marked as paid', bill });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/bills/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateBill(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Bill not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/bills/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteBill(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Bill removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SUBSCRIPTIONS ----------------
apiRouter.get('/subscriptions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getSubscriptions(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/subscriptions', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, amount, billingCycle, category, nextBillingDate, status, planName, paymentMethod, notes } = req.body;
    if (!name || amount === undefined) {
      return res.status(400).json({ error: 'Subscription name and amount are required' });
    }
    const sub = await storage.addSubscription({
      userId: req.user!.id,
      name,
      amount: Number(amount),
      billingCycle: billingCycle || 'monthly',
      category: category || 'Entertainment',
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: status || 'active',
      planName: planName || 'Standard Plan',
      paymentMethod: paymentMethod || 'UPI Autopay',
      notes: notes || '',
    });
    res.status(201).json(sub);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/subscriptions/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateSubscription(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Subscription not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/subscriptions/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteSubscription(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ message: 'Subscription removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- EDUCATION EXPENSES ----------------
apiRouter.get('/education', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getEducationExpenses(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/education', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, amount, type, academicYear, dueDate, isPaid, institution, receiptNumber, notes } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }
    const item = await storage.addEducationExpense({
      userId: req.user!.id,
      title,
      amount: Number(amount),
      type: type || 'Tuition Fee',
      academicYear: academicYear || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      isPaid: Boolean(isPaid),
      institution: institution || '',
      receiptNumber: receiptNumber || '',
      notes: notes || '',
    });
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/education/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateEducationExpense(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Education expense not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/education/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteEducationExpense(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Education expense not found' });
    res.json({ message: 'Education expense deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- WISHLIST ----------------
apiRouter.get('/wishlist', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getWishlist(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/wishlist', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, estimatedPrice, priority, category, savedSoFar, targetMonth, productUrl, notes } = req.body;
    if (!title || estimatedPrice === undefined) {
      return res.status(400).json({ error: 'Title and estimated price are required' });
    }
    const item = await storage.addWishlistItem({
      userId: req.user!.id,
      title,
      estimatedPrice: Number(estimatedPrice),
      priority: priority || 'medium',
      category: category || 'Tech & Gadgets',
      savedSoFar: Number(savedSoFar) || 0,
      targetMonth: targetMonth || '',
      productUrl: productUrl || '',
      notes: notes || '',
    });
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/wishlist/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateWishlistItem(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Wishlist item not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/wishlist/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteWishlistItem(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Wishlist item not found' });
    res.json({ message: 'Wishlist item removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- NOTIFICATIONS ----------------
apiRouter.get('/notifications', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await storage.getNotifications(req.user!.id);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notif = await storage.markNotificationAsRead(req.params.id, req.user!.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    res.json(notif);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/notifications/mark-all-read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await storage.markAllNotificationsRead(req.user!.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/notifications/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await storage.deleteNotification(req.params.id, req.user!.id);
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- ANALYTICS & SUMMARY ----------------
apiRouter.get('/analytics/summary', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await storage.getAnalyticsSummary(req.user!.id);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SYSTEM / DEMO RESET ----------------
apiRouter.post('/system/reset-demo', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await storage.resetStorageToSeed(req.user!.id);
    res.json({ message: 'Your money data has been reset' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- AI ASSISTANT ROUTES ----------------
apiRouter.use('/ai', aiRouter);
