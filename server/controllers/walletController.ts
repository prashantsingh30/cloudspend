import { Response } from 'express';
import { Wallet } from '../models/Wallet';
import { Expense } from '../models/Expense';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// In-memory fallback
const fallbackWallets = new Map<string, any>();

export const getWallets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    let wallets: any[] = [];

    if (conn) {
      try {
        wallets = await Wallet.find({ userId }).sort({ createdAt: 1 });
      } catch (err) {
        console.warn('Wallet mongo query failed, using fallback:', err);
      }
    }

    if (wallets.length === 0) {
      // Return memory fallback or default wallets if none exist
      const userWallets = Array.from(fallbackWallets.values()).filter((w) => w.userId === userId);
      if (userWallets.length > 0) {
        wallets = userWallets;
      } else {
        // Return starter defaults
        const starter = [
          { id: 'w_cash', userId, name: 'Cash in Hand', type: 'cash', openingBalance: 0, color: '#10B981', icon: 'Coins' },
          { id: 'w_bank', userId, name: 'Main Bank Account', type: 'bank', openingBalance: 0, color: '#5145E5', icon: 'Building2' },
          { id: 'w_upi', userId, name: 'UPI / Digital Wallet', type: 'upi', openingBalance: 0, color: '#06B6D4', icon: 'Smartphone' },
          { id: 'w_credit', userId, name: 'Credit Card', type: 'credit', openingBalance: 0, color: '#F59E0B', icon: 'CreditCard' },
        ];
        res.json({ wallets: starter });
        return;
      }
    }

    // Calculate current balance for each wallet based on transactions
    let allTx: any[] = [];
    if (conn) {
      try {
        allTx = await Expense.find({ userId });
      } catch (e) {
        // ignore
      }
    }

    const formatted = wallets.map((w: any) => {
      const wId = w._id ? w._id.toString() : w.id;
      const wName = w.name;

      // Match transactions by wallet name or ID
      const walletTx = allTx.filter((t: any) => t.wallet === wName || t.wallet === wId);
      const incomeTotal = walletTx
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      const expenseTotal = walletTx
        .filter((t: any) => t.type !== 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const opening = Number(w.openingBalance || 0);
      const calculatedBalance = opening + incomeTotal - expenseTotal;

      return {
        id: wId,
        userId: w.userId,
        name: w.name,
        type: w.type || 'cash',
        openingBalance: opening,
        balance: Number(calculatedBalance.toFixed(2)),
        color: w.color || '#5145E5',
        icon: w.icon || 'Wallet',
        createdAt: w.createdAt,
      };
    });

    res.json({ wallets: formatted });
  } catch (err: any) {
    console.error('getWallets error:', err);
    res.status(500).json({ message: 'Failed to retrieve wallets.' });
  }
};

export const createWallet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, type, openingBalance, color, icon } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Wallet name is required.' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const newWallet = await Wallet.create({
          userId,
          name: name.trim(),
          type: type || 'cash',
          openingBalance: Number(openingBalance || 0),
          color: color || '#5145E5',
          icon: icon || 'Wallet',
        });

        res.status(201).json({
          wallet: {
            id: newWallet._id.toString(),
            userId: newWallet.userId,
            name: newWallet.name,
            type: newWallet.type,
            openingBalance: newWallet.openingBalance,
            balance: newWallet.openingBalance,
            color: newWallet.color,
            icon: newWallet.icon,
            createdAt: newWallet.createdAt,
          },
        });
        return;
      } catch (err) {
        console.warn('Mongo createWallet failed, fallback:', err);
      }
    }

    // In-memory fallback
    const id = `w_${Date.now()}`;
    const fallbackItem = {
      id,
      userId,
      name: name.trim(),
      type: type || 'cash',
      openingBalance: Number(openingBalance || 0),
      balance: Number(openingBalance || 0),
      color: color || '#5145E5',
      icon: icon || 'Wallet',
      createdAt: new Date(),
    };
    fallbackWallets.set(id, fallbackItem);

    res.status(201).json({ wallet: fallbackItem });
  } catch (err: any) {
    console.error('createWallet error:', err);
    res.status(500).json({ message: 'Failed to create wallet.' });
  }
};

export const updateWallet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, type, openingBalance, color, icon } = req.body;
    const conn = await connectToDatabase();

    if (conn) {
      try {
        const updated = await Wallet.findOneAndUpdate(
          { _id: id, userId },
          {
            ...(name ? { name: name.trim() } : {}),
            ...(type ? { type } : {}),
            ...(openingBalance !== undefined ? { openingBalance: Number(openingBalance) } : {}),
            ...(color ? { color } : {}),
            ...(icon ? { icon } : {}),
          },
          { new: true }
        );

        if (updated) {
          res.json({
            wallet: {
              id: updated._id.toString(),
              userId: updated.userId,
              name: updated.name,
              type: updated.type,
              openingBalance: updated.openingBalance,
              balance: updated.openingBalance,
              color: updated.color,
              icon: updated.icon,
            },
          });
          return;
        }
      } catch (err) {
        console.warn('Mongo updateWallet error, fallback:', err);
      }
    }

    // Fallback
    const existing = fallbackWallets.get(id);
    if (existing && existing.userId === userId) {
      if (name) existing.name = name.trim();
      if (type) existing.type = type;
      if (openingBalance !== undefined) existing.openingBalance = Number(openingBalance);
      if (color) existing.color = color;
      if (icon) existing.icon = icon;
      fallbackWallets.set(id, existing);
      res.json({ wallet: existing });
      return;
    }

    res.status(404).json({ message: 'Wallet not found.' });
  } catch (err: any) {
    console.error('updateWallet error:', err);
    res.status(500).json({ message: 'Failed to update wallet.' });
  }
};

export const deleteWallet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        await Wallet.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn('Mongo deleteWallet error:', err);
      }
    }

    fallbackWallets.delete(id);
    res.json({ message: 'Wallet deleted successfully.' });
  } catch (err: any) {
    console.error('deleteWallet error:', err);
    res.status(500).json({ message: 'Failed to delete wallet.' });
  }
};
