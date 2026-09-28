import { Response } from 'express';
import { Budget } from '../models/Budget';
import { memoryDb, InMemoryBudget } from '../services/dbFallback';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (isNaN(month) || isNaN(year)) {
      res.status(400).json({ message: 'Month and year are required query parameters.' });
      return;
    }

    const conn = await connectToDatabase();

    if (conn) {
      try {
        const budget = await Budget.findOne({ userId, month, year });
        if (!budget) {
          res.json({ budget: null });
          return;
        }
        res.json({
          budget: {
            id: budget._id.toString(),
            userId: budget.userId,
            month: budget.month,
            year: budget.year,
            amount: budget.amount,
            categoryLimits: budget.categoryLimits || [],
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt,
          },
        });
        return;
      } catch (dbErr: any) {
        console.warn('MongoDB query warning in getBudget, using fallback store:', dbErr.message);
      }
    }

    const key = `b_${userId}_${year}_${month}`;
    const found = memoryDb.budgets.get(key) || null;
    res.json({ budget: found });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching budget.' });
  }
};

export const setBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { month, year, amount, categoryLimits } = req.body;

    if (!month || !year || !amount || amount <= 0) {
      res.status(400).json({ message: 'Month, year, and a positive amount are required.' });
      return;
    }

    const conn = await connectToDatabase();
    const cleanLimits = Array.isArray(categoryLimits)
      ? categoryLimits
          .filter((cl) => cl.category && cl.amount >= 0)
          .map((cl) => ({ category: String(cl.category).trim(), amount: Number(cl.amount) }))
      : [];

    if (conn) {
      const budget = await Budget.findOneAndUpdate(
        { userId, month, year },
        {
          amount: Number(parseFloat(amount).toFixed(2)),
          categoryLimits: cleanLimits,
        },
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        budget: {
          id: budget._id.toString(),
          userId: budget.userId,
          month: budget.month,
          year: budget.year,
          amount: budget.amount,
          categoryLimits: budget.categoryLimits || [],
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
        },
      });
    } else {
      const key = `b_${userId}_${year}_${month}`;
      const existing = memoryDb.budgets.get(key);

      const updated: any = {
        id: existing ? existing.id : `b_${Date.now()}`,
        userId,
        month: Number(month),
        year: Number(year),
        amount: Number(parseFloat(amount).toFixed(2)),
        categoryLimits: cleanLimits,
        createdAt: existing ? existing.createdAt : new Date(),
        updatedAt: new Date(),
      };

      memoryDb.budgets.set(key, updated);
      res.json({ budget: updated });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error setting budget.' });
  }
};
