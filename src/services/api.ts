import {
  User,
  Transaction,
  Expense,
  Budget,
  DashboardSummary,
  FilterParams,
  Wallet,
  RecurringPayment,
  CurrencyCode,
} from '../types';

const TOKEN_KEY = 'cloudspend_token';
const USER_KEY = 'cloudspend_user';

// Token Management
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
// If VITE_API_URL was set to 5173, fallback to current origin (empty string for relative API path)
const API_BASE_URL = (rawApiUrl.includes('localhost:5173') ? '' : rawApiUrl).replace(/\/$/, '');

// Unified API Caller with Token injection and JSON parsing
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
      removeToken();
    }
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Authentication
  async register(name: string, email: string, password: string, currency: CurrencyCode = 'USD'): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, currency }),
    });
    if (data.token) setToken(data.token);
    if (data.user) setStoredUser(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    if (data.user) setStoredUser(data.user);
    return data;
  },

  async googleLogin(payload: { credential?: string; accessToken?: string } | string): Promise<{ token: string; user: User }> {
    const body = typeof payload === 'string' ? { credential: payload } : payload;
    const data = await request<{ token: string; user: User }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) setToken(data.token);
    if (data.user) setStoredUser(data.user);
    return data;
  },

  async getMe(): Promise<User> {
    const data = await request<{ user: User }>('/api/auth/me');
    if (data.user) setStoredUser(data.user);
    return data.user;
  },

  async updateProfile(name: string, currency: CurrencyCode, dateFormat?: string, themePreference?: string): Promise<User> {
    const data = await request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, currency, dateFormat, themePreference }),
    });
    if (data.user) setStoredUser(data.user);
    return data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async exportUserData(): Promise<any> {
    return request<any>('/api/auth/export');
  },

  async deleteAccount(): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/account', {
      method: 'DELETE',
    });
  },

  // Transactions / Expenses
  async getExpenses(filters?: Partial<FilterParams>): Promise<Transaction[]> {
    try {
      const searchParams = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') searchParams.set('type', filters.type);
      if (filters?.search) searchParams.set('search', filters.search);
      if (filters?.category && filters.category !== 'all') searchParams.set('category', filters.category);
      if (filters?.paymentMethod && filters.paymentMethod !== 'all') searchParams.set('paymentMethod', filters.paymentMethod);
      if (filters?.wallet && filters.wallet !== 'all') searchParams.set('wallet', filters.wallet);
      if (filters?.startDate) searchParams.set('startDate', filters.startDate);
      if (filters?.endDate) searchParams.set('endDate', filters.endDate);
      if (filters?.sortBy) searchParams.set('sortBy', filters.sortBy);

      const qs = searchParams.toString();
      const res = await request<{ expenses: Transaction[] }>(`/api/expenses${qs ? `?${qs}` : ''}`);
      return res.expenses || [];
    } catch (err: any) {
      console.warn('getExpenses API error, returning empty list:', err.message);
      return [];
    }
  },

  async createExpense(data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const res = await request<{ expense: Transaction }>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.expense;
  },

  async bulkImportTransactions(transactions: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<{ message: string; count: number }> {
    return request<{ message: string; count: number }>('/api/expenses/bulk', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  async updateExpense(id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Transaction> {
    const res = await request<{ expense: Transaction }>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.expense;
  },

  async deleteExpense(id: string): Promise<void> {
    await request(`/api/expenses/${id}`, { method: 'DELETE' });
  },

  // Budgets
  async getBudget(month: number, year: number): Promise<Budget | null> {
    try {
      const res = await request<{ budget: Budget | null }>(`/api/budgets?month=${month}&year=${year}`);
      return res.budget;
    } catch (err: any) {
      console.warn('getBudget API error:', err.message);
      return null;
    }
  },

  async setBudget(month: number, year: number, amount: number, categoryLimits?: Array<{ category: string; amount: number }>): Promise<Budget> {
    const res = await request<{ budget: Budget }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ month, year, amount, categoryLimits }),
    });
    return res.budget;
  },

  // Dashboard Metrics
  async getDashboardSummary(
    month: number,
    year: number,
    period: string = 'this-month',
    startDate?: string,
    endDate?: string
  ): Promise<DashboardSummary> {
    try {
      const searchParams = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        period,
      });
      if (startDate) searchParams.set('startDate', startDate);
      if (endDate) searchParams.set('endDate', endDate);

      const res = await request<{ summary: DashboardSummary }>(`/api/dashboard/summary?${searchParams.toString()}`);
      return res.summary;
    } catch (err: any) {
      console.warn('getDashboardSummary error, falling back to clean zero state:', err.message);
      return {
        totalMonthExpenses: 0,
        totalMonthIncome: 0,
        netBalance: 0,
        monthlyBudget: 0,
        remainingBudget: 0,
        budgetUsedPercentage: 0,
        transactionCount: 0,
        averageDailySpend: 0,
        spendingByCategory: [],
        incomeByCategory: [],
        dailySpendingTrend: [],
        upcomingRecurring: [],
      };
    }
  },

  // Wallets
  async getWallets(): Promise<Wallet[]> {
    try {
      const res = await request<{ wallets: Wallet[] }>('/api/wallets');
      return res.wallets || [];
    } catch (err: any) {
      console.warn('getWallets error:', err.message);
      return [];
    }
  },

  async createWallet(data: { name: string; type: string; openingBalance: number; color?: string; icon?: string }): Promise<Wallet> {
    const res = await request<{ wallet: Wallet }>('/api/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.wallet;
  },

  async updateWallet(id: string, data: Partial<Wallet>): Promise<Wallet> {
    const res = await request<{ wallet: Wallet }>(`/api/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.wallet;
  },

  async deleteWallet(id: string): Promise<void> {
    await request(`/api/wallets/${id}`, { method: 'DELETE' });
  },

  // Recurring Payments
  async getRecurringPayments(): Promise<RecurringPayment[]> {
    try {
      const res = await request<{ recurring: RecurringPayment[] }>('/api/recurring');
      return res.recurring || [];
    } catch (err: any) {
      console.warn('getRecurringPayments error:', err.message);
      return [];
    }
  },

  async createRecurringPayment(data: Omit<RecurringPayment, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastPaidDate'>): Promise<RecurringPayment> {
    const res = await request<{ recurring: RecurringPayment }>('/api/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.recurring;
  },

  async markRecurringAsPaid(id: string): Promise<{ message: string; nextDueDate: string; lastPaidDate: string }> {
    return request<{ message: string; nextDueDate: string; lastPaidDate: string }>(`/api/recurring/${id}/pay`, {
      method: 'POST',
    });
  },

  async updateRecurringPayment(id: string, data: Partial<RecurringPayment>): Promise<RecurringPayment> {
    const res = await request<{ recurring: RecurringPayment }>(`/api/recurring/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.recurring;
  },

  async deleteRecurringPayment(id: string): Promise<void> {
    await request(`/api/recurring/${id}`, { method: 'DELETE' });
  },

  // Custom Categories
  async getCategories(): Promise<Array<{ name: string; type: 'expense' | 'income'; color?: string }>> {
    try {
      const res = await request<{ categories: Array<{ name: string; type: 'expense' | 'income'; color?: string }> }>('/api/categories');
      return res.categories || [];
    } catch (err: any) {
      console.warn('getCategories error:', err.message);
      return [];
    }
  },

  async addCategory(name: string, type: 'expense' | 'income', color?: string): Promise<{ name: string; type: 'expense' | 'income'; color?: string }> {
    const res = await request<{ category: { name: string; type: 'expense' | 'income'; color?: string } }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, type, color }),
    });
    return res.category;
  },

  async deleteCategory(name: string): Promise<void> {
    await request(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' });
  },
};
