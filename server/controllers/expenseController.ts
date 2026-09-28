import { Response } from 'express';
import { Expense } from '../models/Expense';
import { memoryDb, InMemoryExpense } from '../services/dbFallback';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getExpenses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { type, category, paymentMethod, wallet, startDate, endDate, search, sortBy } = req.query;
    const conn = await connectToDatabase();

    if (conn) {
      try {
        const query: any = { userId };

        if (type && type !== 'all') query.type = type;
        if (category && category !== 'all') query.category = category;
        if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod;
        if (wallet && wallet !== 'all') query.wallet = wallet;

        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = startDate;
          if (endDate) query.date.$lte = endDate;
        }

        if (search) {
          query.$or = [
            { description: { $regex: search, $options: 'i' } },
            { notes: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
          ];
        }

        let sortObj: any = { date: -1, createdAt: -1 };
        if (sortBy === 'date-asc') sortObj = { date: 1, createdAt: 1 };
        if (sortBy === 'amount-desc') sortObj = { amount: -1 };
        if (sortBy === 'amount-asc') sortObj = { amount: 1 };

        const records = await Expense.find(query).sort(sortObj);
        res.json({
          expenses: records.map((e) => ({
            id: e._id.toString(),
            userId: e.userId,
            type: e.type || 'expense',
            amount: e.amount,
            description: e.description,
            category: e.category,
            date: e.date,
            paymentMethod: e.paymentMethod,
            wallet: e.wallet || 'Cash',
            notes: e.notes,
            tags: e.tags,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
          })),
        });
        return;
      } catch (dbErr: any) {
        console.warn('MongoDB query warning in getExpenses, using fallback store:', dbErr.message);
      }
    }

    // In-memory fallback
    let list: any[] = Array.from(memoryDb.expenses.values()).filter((e) => e.userId === userId);

    if (type && type !== 'all') list = list.filter((e) => (e.type || 'expense') === type);
    if (category && category !== 'all') list = list.filter((e) => e.category === category);
    if (paymentMethod && paymentMethod !== 'all') list = list.filter((e) => e.paymentMethod === paymentMethod);
    if (wallet && wallet !== 'all') list = list.filter((e) => (e.wallet || 'Cash') === wallet);
    if (startDate) list = list.filter((e) => e.date >= (startDate as string));
    if (endDate) list = list.filter((e) => e.date <= (endDate as string));
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
      );
    }

    const sort = (sortBy as string) || 'date-desc';
    list.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    res.json({ expenses: list });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching transactions' });
  }
};

export const createExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { amount, description, category, date, paymentMethod, wallet, type, notes, tags } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'A positive amount is required.' });
      return;
    }

    if (!description || !category || !date) {
      res.status(400).json({ message: 'Description, category, and date are required.' });
      return;
    }

    const conn = await connectToDatabase();
    const txType = type === 'income' ? 'income' : 'expense';
    const txPaymentMethod = paymentMethod || 'Cash';
    const txWallet = wallet || 'Cash';

    if (conn) {
      const exp = await Expense.create({
        userId,
        type: txType,
        amount: Number(parseFloat(amount).toFixed(2)),
        description: description.trim(),
        category: category.trim(),
        date,
        paymentMethod: txPaymentMethod,
        wallet: txWallet,
        notes: notes ? notes.trim() : undefined,
        tags: Array.isArray(tags) ? tags : undefined,
      });

      res.status(201).json({
        expense: {
          id: exp._id.toString(),
          userId: exp.userId,
          type: exp.type,
          amount: exp.amount,
          description: exp.description,
          category: exp.category,
          date: exp.date,
          paymentMethod: exp.paymentMethod,
          wallet: exp.wallet,
          notes: exp.notes,
          tags: exp.tags,
          createdAt: exp.createdAt,
          updatedAt: exp.updatedAt,
        },
      });
    } else {
      const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const exp: any = {
        id,
        userId,
        type: txType,
        amount: Number(parseFloat(amount).toFixed(2)),
        description: description.trim(),
        category: category.trim(),
        date,
        paymentMethod: txPaymentMethod,
        wallet: txWallet,
        notes: notes ? notes.trim() : undefined,
        tags: Array.isArray(tags) ? tags : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryDb.expenses.set(id, exp);
      res.status(201).json({ expense: exp });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error recording transaction' });
  }
};

export const bulkCreateExpenses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      res.status(400).json({ message: 'An array of transactions is required.' });
      return;
    }

    const conn = await connectToDatabase();
    const validRows = transactions
      .filter((t) => t.amount && Number(t.amount) > 0 && t.description && t.category && t.date)
      .map((t) => ({
        userId,
        type: t.type === 'income' ? 'income' : 'expense',
        amount: Number(parseFloat(t.amount).toFixed(2)),
        description: String(t.description).trim().slice(0, 150),
        category: String(t.category).trim().slice(0, 60),
        date: String(t.date).slice(0, 10),
        paymentMethod: String(t.paymentMethod || 'Cash').trim(),
        wallet: String(t.wallet || 'Cash').trim(),
        notes: t.notes ? String(t.notes).trim().slice(0, 500) : undefined,
      }));

    if (conn) {
      const created = await Expense.insertMany(validRows);
      res.status(201).json({
        message: `Successfully imported ${created.length} transactions.`,
        count: created.length,
      });
      return;
    }

    // Fallback store
    for (const row of validRows) {
      const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      memoryDb.expenses.set(id, { ...row, id, createdAt: new Date(), updatedAt: new Date() } as any);
    }

    res.status(201).json({
      message: `Successfully imported ${validRows.length} transactions.`,
      count: validRows.length,
    });
  } catch (err: any) {
    console.error('bulkCreateExpenses error:', err);
    res.status(500).json({ message: 'Failed to bulk import transactions.' });
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { amount, description, category, date, paymentMethod, wallet, type, notes, tags } = req.body;
    const conn = await connectToDatabase();

    const updateFields: any = {};
    if (amount !== undefined) updateFields.amount = Number(parseFloat(amount).toFixed(2));
    if (description !== undefined) updateFields.description = description.trim();
    if (category !== undefined) updateFields.category = category.trim();
    if (date !== undefined) updateFields.date = date;
    if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod;
    if (wallet !== undefined) updateFields.wallet = wallet;
    if (type !== undefined) updateFields.type = type === 'income' ? 'income' : 'expense';
    if (notes !== undefined) updateFields.notes = notes ? notes.trim() : undefined;
    if (tags !== undefined) updateFields.tags = tags;

    if (conn) {
      const updated = await Expense.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateFields },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ message: 'Record not found or access denied.' });
        return;
      }

      res.json({
        expense: {
          id: updated._id.toString(),
          userId: updated.userId,
          type: updated.type,
          amount: updated.amount,
          description: updated.description,
          category: updated.category,
          date: updated.date,
          paymentMethod: updated.paymentMethod,
          wallet: updated.wallet,
          notes: updated.notes,
          tags: updated.tags,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    } else {
      const exp = memoryDb.expenses.get(id);
      if (!exp || exp.userId !== userId) {
        res.status(404).json({ message: 'Record not found or access denied.' });
        return;
      }

      Object.assign(exp, updateFields, { updatedAt: new Date() });
      memoryDb.expenses.set(id, exp);
      res.json({ expense: exp });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating transaction' });
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();

    if (conn) {
      const result = await Expense.findOneAndDelete({ _id: id, userId });
      if (!result) {
        res.status(404).json({ message: 'Record not found or access denied.' });
        return;
      }
    } else {
      const exp = memoryDb.expenses.get(id);
      if (!exp || exp.userId !== userId) {
        res.status(404).json({ message: 'Record not found or access denied.' });
        return;
      }
      memoryDb.expenses.delete(id);
    }

    res.json({ message: 'Transaction removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting transaction' });
  }
};
