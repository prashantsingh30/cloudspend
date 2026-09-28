import { Response } from 'express';
import { User } from '../models/User';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    let customCategories: any[] = [];

    if (conn) {
      try {
        const user = await User.findById(userId);
        if (user && user.customCategories) {
          customCategories = user.customCategories;
        }
      } catch (err) {
        console.warn('Mongo getCategories failed:', err);
      }
    }

    res.json({ categories: customCategories });
  } catch (err: any) {
    console.error('getCategories error:', err);
    res.status(500).json({ message: 'Failed to retrieve categories.' });
  }
};

export const addCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, type, color } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const catName = name.trim();
    const catType = type === 'income' ? 'income' : 'expense';

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (!user.customCategories) user.customCategories = [];
          const exists = user.customCategories.some(
            (c: any) => c.name.toLowerCase() === catName.toLowerCase() && c.type === catType
          );
          if (exists) {
            res.status(400).json({ message: 'Category already exists.' });
            return;
          }

          user.customCategories.push({ name: catName, type: catType, color: color || '#5145E5' });
          await user.save();

          res.status(201).json({ category: { name: catName, type: catType, color: color || '#5145E5' } });
          return;
        }
      } catch (err) {
        console.warn('Mongo addCategory error:', err);
      }
    }

    res.status(201).json({ category: { name: catName, type: catType, color: color || '#5145E5' } });
  } catch (err: any) {
    console.error('addCategory error:', err);
    res.status(500).json({ message: 'Failed to add category.' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name } = req.params;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        const user = await User.findById(userId);
        if (user && user.customCategories) {
          user.customCategories = user.customCategories.filter(
            (c: any) => c.name.toLowerCase() !== decodeURIComponent(name).toLowerCase()
          );
          await user.save();
        }
      } catch (err) {
        console.warn('Mongo deleteCategory error:', err);
      }
    }

    res.json({ message: 'Category removed.' });
  } catch (err: any) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ message: 'Failed to delete category.' });
  }
};
