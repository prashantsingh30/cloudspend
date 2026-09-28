import bcrypt from 'bcryptjs';

export interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  googleId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryExpense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryBudget {
  id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory collections
export const memoryDb = {
  users: new Map<string, InMemoryUser>(),
  expenses: new Map<string, InMemoryExpense>(),
  budgets: new Map<string, InMemoryBudget>(),
};

// Seed default demo user and sample records
(async () => {
  const demoEmail = 'demo@cloudspend.io';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('demo1234', salt);

  const demoUserId = 'usr_demo_account_1';
  memoryDb.users.set(demoUserId, {
    id: demoUserId,
    name: 'Alex Morgan',
    email: demoEmail,
    passwordHash: hash,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');

  const demoExpenses: InMemoryExpense[] = [
    {
      id: 'exp_demo_1',
      userId: demoUserId,
      amount: 85.50,
      description: 'Weekly Organic Grocery Restock',
      category: 'Groceries',
      date: `${y}-${m}-04`,
      paymentMethod: 'Credit Card',
      notes: 'Produce and pantry essentials',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'exp_demo_2',
      userId: demoUserId,
      amount: 14.25,
      description: 'Morning Espresso & Croissant',
      category: 'Food',
      date: `${y}-${m}-08`,
      paymentMethod: 'UPI',
      notes: 'Coffee with peer',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'exp_demo_3',
      userId: demoUserId,
      amount: 68.00,
      description: 'High-speed Fiber Internet Bill',
      category: 'Bills & Utilities',
      date: `${y}-${m}-11`,
      paymentMethod: 'Net Banking',
      notes: 'Monthly billing cycle',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'exp_demo_4',
      userId: demoUserId,
      amount: 32.40,
      description: 'City Metro Pass',
      category: 'Transportation',
      date: `${y}-${m}-15`,
      paymentMethod: 'Debit Card',
      notes: 'Lab commute travel pass',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  demoExpenses.forEach((e) => memoryDb.expenses.set(e.id, e));

  memoryDb.budgets.set(`b_${demoUserId}_${y}_${now.getMonth() + 1}`, {
    id: `b_${demoUserId}_${y}_${now.getMonth() + 1}`,
    userId: demoUserId,
    month: now.getMonth() + 1,
    year: y,
    amount: 850.00,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
})();
