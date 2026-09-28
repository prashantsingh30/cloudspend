import { Response } from 'express';
import { RecurringPayment } from '../models/RecurringPayment';
import { Expense } from '../models/Expense';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const fallbackRecurring = new Map<string, any>();

function calculateNextDueDate(currentDueDateStr: string, frequency: string): string {
  const date = new Date(currentDueDateStr);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'monthly':
    default:
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date.toISOString().slice(0, 10);
}

export const getRecurringPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    let recurring: any[] = [];

    if (conn) {
      try {
        recurring = await RecurringPayment.find({ userId }).sort({ nextDueDate: 1 });
      } catch (err) {
        console.warn('Mongo recurring query failed:', err);
      }
    }

    if (recurring.length === 0) {
      recurring = Array.from(fallbackRecurring.values()).filter((r) => r.userId === userId);
    }

    const formatted = recurring.map((r: any) => ({
      id: r._id ? r._id.toString() : r.id,
      userId: r.userId,
      name: r.name,
      amount: r.amount,
      type: r.type || 'expense',
      category: r.category,
      paymentMethod: r.paymentMethod,
      wallet: r.wallet || 'Cash',
      frequency: r.frequency,
      nextDueDate: r.nextDueDate,
      status: r.status,
      notes: r.notes,
      lastPaidDate: r.lastPaidDate,
      createdAt: r.createdAt,
    }));

    res.json({ recurring: formatted });
  } catch (err: any) {
    console.error('getRecurringPayments error:', err);
    res.status(500).json({ message: 'Failed to retrieve recurring payments.' });
  }
};

export const createRecurringPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, amount, type, category, paymentMethod, wallet, frequency, nextDueDate, notes } = req.body;

    if (!name || !amount || !category || !nextDueDate) {
      res.status(400).json({ message: 'Name, amount, category, and nextDueDate are required.' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ message: 'Amount must be greater than zero.' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const item = await RecurringPayment.create({
          userId,
          name: name.trim(),
          amount: parseFloat(numAmount.toFixed(2)),
          type: type || 'expense',
          category: category.trim(),
          paymentMethod: paymentMethod || 'Cash',
          wallet: wallet || 'Cash',
          frequency: frequency || 'monthly',
          nextDueDate,
          status: 'active',
          notes: notes?.trim(),
        });

        res.status(201).json({
          recurring: {
            id: item._id.toString(),
            userId: item.userId,
            name: item.name,
            amount: item.amount,
            type: item.type,
            category: item.category,
            paymentMethod: item.paymentMethod,
            wallet: item.wallet,
            frequency: item.frequency,
            nextDueDate: item.nextDueDate,
            status: item.status,
            notes: item.notes,
            createdAt: item.createdAt,
          },
        });
        return;
      } catch (err) {
        console.warn('Mongo createRecurring failed:', err);
      }
    }

    const id = `rec_${Date.now()}`;
    const fallbackItem = {
      id,
      userId,
      name: name.trim(),
      amount: parseFloat(numAmount.toFixed(2)),
      type: type || 'expense',
      category: category.trim(),
      paymentMethod: paymentMethod || 'Cash',
      wallet: wallet || 'Cash',
      frequency: frequency || 'monthly',
      nextDueDate,
      status: 'active',
      notes: notes?.trim(),
      createdAt: new Date(),
    };
    fallbackRecurring.set(id, fallbackItem);

    res.status(201).json({ recurring: fallbackItem });
  } catch (err: any) {
    console.error('createRecurringPayment error:', err);
    res.status(500).json({ message: 'Failed to create recurring payment.' });
  }
};

export const markRecurringAsPaid = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    let recurringDoc: any = null;

    if (conn) {
      try {
        recurringDoc = await RecurringPayment.findOne({ _id: id, userId });
      } catch (err) {
        // fallback
      }
    }

    if (!recurringDoc) {
      recurringDoc = fallbackRecurring.get(id);
    }

    if (!recurringDoc || recurringDoc.userId !== userId) {
      res.status(404).json({ message: 'Recurring payment not found.' });
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const nextDate = calculateNextDueDate(recurringDoc.nextDueDate || todayStr, recurringDoc.frequency);

    // 1. Create matching transaction in Expense model
    if (conn) {
      try {
        await Expense.create({
          userId,
          type: recurringDoc.type || 'expense',
          amount: recurringDoc.amount,
          description: `${recurringDoc.name} (Recurring Payment)`,
          category: recurringDoc.category,
          date: todayStr,
          paymentMethod: recurringDoc.paymentMethod || 'Cash',
          wallet: recurringDoc.wallet || 'Cash',
          notes: `Auto-recorded from bill schedule: ${recurringDoc.frequency}`,
        });

        recurringDoc.lastPaidDate = todayStr;
        recurringDoc.nextDueDate = nextDate;
        await recurringDoc.save();

        res.json({
          message: 'Payment recorded and schedule updated.',
          nextDueDate: nextDate,
          lastPaidDate: todayStr,
        });
        return;
      } catch (err) {
        console.warn('Mongo markRecurringAsPaid error:', err);
      }
    }

    // Fallback
    recurringDoc.lastPaidDate = todayStr;
    recurringDoc.nextDueDate = nextDate;
    fallbackRecurring.set(id, recurringDoc);

    res.json({
      message: 'Payment recorded and schedule updated.',
      nextDueDate: nextDate,
      lastPaidDate: todayStr,
    });
  } catch (err: any) {
    console.error('markRecurringAsPaid error:', err);
    res.status(500).json({ message: 'Failed to process recurring payment.' });
  }
};

export const updateRecurringPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const updated = await RecurringPayment.findOneAndUpdate(
          { _id: id, userId },
          { $set: req.body },
          { new: true }
        );
        if (updated) {
          res.json({ recurring: updated });
          return;
        }
      } catch (err) {
        // fallback
      }
    }

    const existing = fallbackRecurring.get(id);
    if (existing && existing.userId === userId) {
      const merged = { ...existing, ...req.body };
      fallbackRecurring.set(id, merged);
      res.json({ recurring: merged });
      return;
    }

    res.status(404).json({ message: 'Recurring payment not found.' });
  } catch (err: any) {
    console.error('updateRecurringPayment error:', err);
    res.status(500).json({ message: 'Failed to update recurring payment.' });
  }
};

export const deleteRecurringPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await RecurringPayment.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        // ignore
      }
    }

    fallbackRecurring.delete(id);
    res.json({ message: 'Recurring payment removed.' });
  } catch (err: any) {
    console.error('deleteRecurringPayment error:', err);
    res.status(500).json({ message: 'Failed to delete recurring payment.' });
  }
};
