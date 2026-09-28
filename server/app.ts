import express, { Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  changePassword,
  exportUserData,
  deleteAccount,
} from './controllers/authController';
import {
  getExpenses,
  createExpense,
  bulkCreateExpenses,
  updateExpense,
  deleteExpense,
} from './controllers/expenseController';
import { getBudget, setBudget } from './controllers/budgetController';
import { getDashboardSummary } from './controllers/dashboardController';
import {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from './controllers/walletController';
import {
  getRecurringPayments,
  createRecurringPayment,
  markRecurringAsPaid,
  updateRecurringPayment,
  deleteRecurringPayment,
} from './controllers/recurringController';
import {
  getCategories,
  addCategory,
  deleteCategory,
} from './controllers/categoryController';
import { authMiddleware } from './middleware/authMiddleware';
import { getDatabaseStatus, connectToDatabase } from './config/db';

const app = express();

// Middleware
app.use(express.json());

// CORS configuration - allow configured CLIENT_ORIGIN or incoming origin
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', origin || allowedOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  if (process.env.MONGODB_URI) {
    await connectToDatabase();
  }
  const dbStatus = getDatabaseStatus();

  res.json({
    status: 'healthy',
    service: 'CloudSpend API',
    runtime: 'AWS Lambda / Express Compatible',
    timestamp: new Date().toISOString(),
    database: {
      provider: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'In-Memory Distributed Fallback Store',
      configured: Boolean(process.env.MONGODB_URI),
      connected: dbStatus.connected,
      cluster: dbStatus.cluster,
      error: dbStatus.error,
    },
  });
});

// Authentication routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/google', googleAuth);
app.get('/api/auth/me', authMiddleware as any, getMe);
app.put('/api/auth/profile', authMiddleware as any, updateProfile);
app.post('/api/auth/change-password', authMiddleware as any, changePassword);
app.get('/api/auth/export', authMiddleware as any, exportUserData);
app.delete('/api/auth/account', authMiddleware as any, deleteAccount);

// Transaction / Expense routes (Protected)
app.get('/api/expenses', authMiddleware as any, getExpenses);
app.post('/api/expenses', authMiddleware as any, createExpense);
app.post('/api/expenses/bulk', authMiddleware as any, bulkCreateExpenses);
app.put('/api/expenses/:id', authMiddleware as any, updateExpense);
app.delete('/api/expenses/:id', authMiddleware as any, deleteExpense);

// Budget routes (Protected)
app.get('/api/budgets', authMiddleware as any, getBudget);
app.post('/api/budgets', authMiddleware as any, setBudget);

// Dashboard routes (Protected)
app.get('/api/dashboard/summary', authMiddleware as any, getDashboardSummary);

// Wallet routes (Protected)
app.get('/api/wallets', authMiddleware as any, getWallets);
app.post('/api/wallets', authMiddleware as any, createWallet);
app.put('/api/wallets/:id', authMiddleware as any, updateWallet);
app.delete('/api/wallets/:id', authMiddleware as any, deleteWallet);

// Recurring payment routes (Protected)
app.get('/api/recurring', authMiddleware as any, getRecurringPayments);
app.post('/api/recurring', authMiddleware as any, createRecurringPayment);
app.post('/api/recurring/:id/pay', authMiddleware as any, markRecurringAsPaid);
app.put('/api/recurring/:id', authMiddleware as any, updateRecurringPayment);
app.delete('/api/recurring/:id', authMiddleware as any, deleteRecurringPayment);

// Custom Category routes (Protected)
app.get('/api/categories', authMiddleware as any, getCategories);
app.post('/api/categories', authMiddleware as any, addCategory);
app.delete('/api/categories/:name', authMiddleware as any, deleteCategory);

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
