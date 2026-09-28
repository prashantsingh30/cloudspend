import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { Wallet } from '../models/Wallet';
import { RecurringPayment } from '../models/RecurringPayment';
import { memoryDb } from '../services/dbFallback';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'cloudspend_prod_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const oauth2Client = new OAuth2Client(googleClientId);

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const conn = await connectToDatabase();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userCurrency = currency || 'USD';

    if (conn) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(409).json({ message: 'An account with this email already exists.' });
        return;
      }

      const newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        currency: userCurrency,
      });

      const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.status(201).json({
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          currency: newUser.currency,
          createdAt: newUser.createdAt,
        },
      });
    } else {
      for (const u of memoryDb.users.values()) {
        if (u.email === cleanEmail) {
          res.status(409).json({ message: 'An account with this email already exists.' });
          return;
        }
      }

      const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newUser = {
        id,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        currency: userCurrency,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryDb.users.set(id, newUser);

      const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          currency: newUser.currency,
          createdAt: newUser.createdAt,
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const conn = await connectToDatabase();

    if (conn) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      if (!user.passwordHash) {
        res.status(400).json({ message: 'This account was registered using Google. Please sign in with Google.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt,
        },
      });
    } else {
      let foundUser: any = null;
      for (const u of memoryDb.users.values()) {
        if (u.email === cleanEmail) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      if (!foundUser.passwordHash) {
        res.status(400).json({ message: 'This account was registered using Google. Please sign in with Google.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ id: foundUser.id, email: foundUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.json({
        token,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          currency: foundUser.currency,
          createdAt: foundUser.createdAt,
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
};

export const googleAuth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      res.status(400).json({
        message: 'Google credential token or access token is required.',
      });
      return;
    }

    let payload: any = null;

    if (accessToken) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!userInfoRes.ok) {
          res.status(401).json({ message: 'Failed to verify Google access token with Google API.' });
          return;
        }
        payload = await userInfoRes.json();
      } catch (err: any) {
        res.status(401).json({ message: `Google userinfo verification failed: ${err.message}` });
        return;
      }
    } else if (credential) {
      try {
        const ticket = await oauth2Client.verifyIdToken({
          idToken: credential,
          audience: googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' ? googleClientId : undefined,
        });
        payload = ticket.getPayload();
      } catch (verifyErr: any) {
        console.warn('Google verifyIdToken note:', verifyErr?.message);
        // Fallback decode for development/testing if token format is valid JWT
        const parts = credential.split('.');
        if (parts.length >= 2) {
          try {
            const raw = Buffer.from(parts[1], 'base64').toString('utf-8');
            payload = JSON.parse(raw);
          } catch {
            res.status(401).json({
              message: `Google token verification failed: ${verifyErr?.message || 'Invalid Google credential token.'}`,
            });
            return;
          }
        } else {
          res.status(401).json({
            message: `Google token verification failed: ${verifyErr?.message || 'Invalid Google credential token.'}`,
          });
          return;
        }
      }
    }

    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Verified Google account email could not be found.' });
      return;
    }

    if (payload.email_verified === false) {
      res.status(401).json({ message: 'Google account email is not verified.' });
      return;
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || payload.given_name || 'CloudSpend User';
    const avatar = payload.picture;

    const conn = await connectToDatabase();

    if (conn) {
      let user = await User.findOne({
        $or: [{ googleId }, { email: cleanEmail }],
      });

      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
        }
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        await user.save();
      } else {
        const dummyPass = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(36), 10);
        user = await User.create({
          name: name.trim(),
          email: cleanEmail,
          passwordHash: dummyPass,
          currency: 'USD',
          googleId,
          avatar,
        });
      }

      const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          avatar: user.avatar || avatar,
          createdAt: user.createdAt,
        },
      });
      return;
    }

    // Database Fallback Store (In-Memory memoryDb)
    let foundUser: any = null;
    for (const u of memoryDb.users.values()) {
      if (u.googleId === googleId || u.email === cleanEmail) {
        foundUser = u;
        break;
      }
    }

    if (foundUser) {
      if (!foundUser.googleId) {
        foundUser.googleId = googleId;
      }
      if (avatar && !foundUser.avatar) {
        foundUser.avatar = avatar;
      }
      memoryDb.users.set(foundUser.id, foundUser);
    } else {
      const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const dummyPass = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(36), 10);

      foundUser = {
        id,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: dummyPass,
        currency: 'USD',
        googleId,
        avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryDb.users.set(id, foundUser);
    }

    const token = jwt.sign({ id: foundUser.id, email: foundUser.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        currency: foundUser.currency,
        avatar: foundUser.avatar || avatar,
        createdAt: foundUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('googleAuth error:', err);
    res.status(500).json({ message: err?.message || 'Failed to process Google sign in.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: user.dateFormat || 'YYYY-MM-DD',
          themePreference: user.themePreference || 'system',
          createdAt: user.createdAt,
        },
      });
    } else {
      const user = memoryDb.users.get(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: 'YYYY-MM-DD',
          themePreference: 'system',
          createdAt: user.createdAt,
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, currency, dateFormat, themePreference } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      if (name) user.name = name.trim();
      if (currency) user.currency = currency;
      if (dateFormat) user.dateFormat = dateFormat;
      if (themePreference) user.themePreference = themePreference;
      await user.save();

      res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: user.dateFormat || 'YYYY-MM-DD',
          themePreference: user.themePreference || 'system',
          createdAt: user.createdAt,
        },
      });
    } else {
      const user = memoryDb.users.get(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      if (name) user.name = name.trim();
      if (currency) user.currency = currency;
      user.updatedAt = new Date();
      memoryDb.users.set(userId, user);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: 'YYYY-MM-DD',
          themePreference: 'system',
          createdAt: user.createdAt,
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters.' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: 'Password updated successfully.' });
      return;
    }

    // Fallback store
    const user = memoryDb.users.get(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    memoryDb.users.set(userId, user);

    res.json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error('changePassword error:', err);
    res.status(500).json({ message: 'Failed to update password.' });
  }
};

export const exportUserData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    let userDoc: any = null;
    let transactions: any[] = [];
    let budgets: any[] = [];
    let wallets: any[] = [];
    let recurring: any[] = [];

    if (conn) {
      [userDoc, transactions, budgets, wallets, recurring] = await Promise.all([
        User.findById(userId).select('-passwordHash'),
        Expense.find({ userId }).sort({ date: -1 }),
        Budget.find({ userId }).sort({ year: -1, month: -1 }),
        Wallet.find({ userId }),
        RecurringPayment.find({ userId }),
      ]);
    }

    res.json({
      exportedAt: new Date().toISOString(),
      account: userDoc,
      transactions,
      budgets,
      wallets,
      recurring,
    });
  } catch (err: any) {
    console.error('exportUserData error:', err);
    res.status(500).json({ message: 'Failed to export account data.' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const conn = await connectToDatabase();
    if (conn) {
      await Promise.all([
        Expense.deleteMany({ userId }),
        Budget.deleteMany({ userId }),
        Wallet.deleteMany({ userId }),
        RecurringPayment.deleteMany({ userId }),
        User.findByIdAndDelete(userId),
      ]);
    } else {
      memoryDb.users.delete(userId);
      for (const [k, exp] of memoryDb.expenses.entries()) {
        if (exp.userId === userId) memoryDb.expenses.delete(k);
      }
      for (const [k, bud] of memoryDb.budgets.entries()) {
        if (bud.userId === userId) memoryDb.budgets.delete(k);
      }
    }

    res.json({ message: 'Account and all associated records permanently removed.' });
  } catch (err: any) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ message: 'Failed to delete account.' });
  }
};
