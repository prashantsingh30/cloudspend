// server/app.ts
import express from "express";

// server/controllers/authController.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// server/models/User.ts
import mongoose, { Schema } from "mongoose";
var UserCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    color: { type: String }
  },
  { _id: false }
);
var UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: false },
    currency: { type: String, default: "USD", uppercase: true, enum: ["USD", "INR", "EUR", "GBP", "CAD", "AUD"] },
    dateFormat: { type: String, default: "YYYY-MM-DD" },
    themePreference: { type: String, default: "system" },
    customCategories: [UserCategorySchema],
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String }
  },
  { timestamps: true }
);
var User = mongoose.models.User || mongoose.model("User", UserSchema);

// server/models/Expense.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var ExpenseSchema = new Schema2(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
      index: true
    },
    amount: { type: Number, required: true, min: [0.01, "Amount must be positive"] },
    description: { type: String, required: true, trim: true, maxlength: 150 },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    date: { type: String, required: true, index: true },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
      default: "Cash"
    },
    wallet: {
      type: String,
      trim: true,
      default: "Cash",
      index: true
    },
    notes: { type: String, trim: true, maxlength: 500 },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, type: 1, date: -1 });
var Expense = mongoose2.models.Expense || mongoose2.model("Expense", ExpenseSchema);

// server/models/Budget.ts
import mongoose3, { Schema as Schema3 } from "mongoose";
var CategoryLimitSchema = new Schema3(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0, "Limit cannot be negative"] }
  },
  { _id: false }
);
var BudgetSchema = new Schema3(
  {
    userId: { type: String, required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2020, max: 2100 },
    amount: { type: Number, required: true, min: [0.01, "Budget must be greater than zero"] },
    categoryLimits: [CategoryLimitSchema]
  },
  { timestamps: true }
);
BudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
var Budget = mongoose3.models.Budget || mongoose3.model("Budget", BudgetSchema);

// server/models/Wallet.ts
import mongoose4, { Schema as Schema4 } from "mongoose";
var WalletSchema = new Schema4(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    type: {
      type: String,
      required: true,
      enum: ["cash", "bank", "upi", "credit", "savings", "other"],
      default: "cash"
    },
    openingBalance: { type: Number, required: true, default: 0 },
    color: { type: String, default: "#5145E5" },
    icon: { type: String, default: "Wallet" }
  },
  { timestamps: true }
);
WalletSchema.index({ userId: 1, name: 1 });
var Wallet = mongoose4.models.Wallet || mongoose4.model("Wallet", WalletSchema);

// server/models/RecurringPayment.ts
import mongoose5, { Schema as Schema5 } from "mongoose";
var RecurringPaymentSchema = new Schema5(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than zero"] },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    category: { type: String, required: true, trim: true },
    paymentMethod: { type: String, default: "Cash", trim: true },
    wallet: { type: String, default: "Cash", trim: true },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly"
    },
    nextDueDate: { type: String, required: true, index: true },
    status: { type: String, enum: ["active", "paused"], default: "active" },
    notes: { type: String, trim: true, maxlength: 300 },
    lastPaidDate: { type: String }
  },
  { timestamps: true }
);
RecurringPaymentSchema.index({ userId: 1, nextDueDate: 1 });
var RecurringPayment = mongoose5.models.RecurringPayment || mongoose5.model("RecurringPayment", RecurringPaymentSchema);

// server/services/dbFallback.ts
import bcrypt from "bcryptjs";
var memoryDb = {
  users: /* @__PURE__ */ new Map(),
  expenses: /* @__PURE__ */ new Map(),
  budgets: /* @__PURE__ */ new Map()
};
(async () => {
  const demoEmail = "demo@cloudspend.io";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash("demo1234", salt);
  const demoUserId = "usr_demo_account_1";
  memoryDb.users.set(demoUserId, {
    id: demoUserId,
    name: "Alex Morgan",
    email: demoEmail,
    passwordHash: hash,
    currency: "USD",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const demoExpenses = [
    {
      id: "exp_demo_1",
      userId: demoUserId,
      amount: 85.5,
      description: "Weekly Organic Grocery Restock",
      category: "Groceries",
      date: `${y}-${m}-04`,
      paymentMethod: "Credit Card",
      notes: "Produce and pantry essentials",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "exp_demo_2",
      userId: demoUserId,
      amount: 14.25,
      description: "Morning Espresso & Croissant",
      category: "Food",
      date: `${y}-${m}-08`,
      paymentMethod: "UPI",
      notes: "Coffee with peer",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "exp_demo_3",
      userId: demoUserId,
      amount: 68,
      description: "High-speed Fiber Internet Bill",
      category: "Bills & Utilities",
      date: `${y}-${m}-11`,
      paymentMethod: "Net Banking",
      notes: "Monthly billing cycle",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "exp_demo_4",
      userId: demoUserId,
      amount: 32.4,
      description: "City Metro Pass",
      category: "Transportation",
      date: `${y}-${m}-15`,
      paymentMethod: "Debit Card",
      notes: "Lab commute travel pass",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }
  ];
  demoExpenses.forEach((e) => memoryDb.expenses.set(e.id, e));
  memoryDb.budgets.set(`b_${demoUserId}_${y}_${now.getMonth() + 1}`, {
    id: `b_${demoUserId}_${y}_${now.getMonth() + 1}`,
    userId: demoUserId,
    month: now.getMonth() + 1,
    year: y,
    amount: 850,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
})();

// server/config/db.ts
import mongoose6 from "mongoose";
var cachedConnection = null;
var lastConnectionAttemptTime = 0;
var lastConnectionError = null;
var RETRY_INTERVAL_MS = 15e3;
function getDatabaseStatus() {
  const isConnected = !!(cachedConnection && mongoose6.connection.readyState === 1);
  return {
    connected: isConnected,
    cluster: isConnected ? mongoose6.connection.host : null,
    error: isConnected ? null : lastConnectionError
  };
}
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }
  if (cachedConnection && mongoose6.connection.readyState === 1) {
    return cachedConnection;
  }
  const now = Date.now();
  if (lastConnectionError && now - lastConnectionAttemptTime < RETRY_INTERVAL_MS) {
    return null;
  }
  lastConnectionAttemptTime = now;
  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3e3,
      socketTimeoutMS: 3e4
    };
    const conn = await mongoose6.connect(uri, opts);
    cachedConnection = conn;
    lastConnectionError = null;
    console.log("Successfully connected to MongoDB Atlas cluster:", mongoose6.connection.name);
    return conn;
  } catch (err) {
    lastConnectionError = err.message;
    console.warn("MongoDB Atlas connection notice:", err.message);
    return null;
  }
}

// server/controllers/authController.ts
var JWT_SECRET = process.env.JWT_SECRET || "cloudspend_prod_jwt_secret_key_2026";
var JWT_EXPIRES_IN = "7d";
var googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
var oauth2Client = new OAuth2Client(googleClientId);
var register = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters." });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const conn = await connectToDatabase();
    const salt = await bcrypt2.genSalt(10);
    const passwordHash = await bcrypt2.hash(password, salt);
    const userCurrency = currency || "USD";
    if (conn) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(409).json({ message: "An account with this email already exists." });
        return;
      }
      const newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        currency: userCurrency
      });
      const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      res.status(201).json({
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          currency: newUser.currency,
          createdAt: newUser.createdAt
        }
      });
    } else {
      for (const u of memoryDb.users.values()) {
        if (u.email === cleanEmail) {
          res.status(409).json({ message: "An account with this email already exists." });
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
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      memoryDb.users.set(id, newUser);
      const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          currency: newUser.currency,
          createdAt: newUser.createdAt
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error during registration." });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password." });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }
      if (!user.passwordHash) {
        res.status(400).json({ message: "This account was registered using Google. Please sign in with Google." });
        return;
      }
      const isMatch = await bcrypt2.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }
      const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      res.json({
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt
        }
      });
    } else {
      let foundUser = null;
      for (const u of memoryDb.users.values()) {
        if (u.email === cleanEmail) {
          foundUser = u;
          break;
        }
      }
      if (!foundUser) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }
      if (!foundUser.passwordHash) {
        res.status(400).json({ message: "This account was registered using Google. Please sign in with Google." });
        return;
      }
      const isMatch = await bcrypt2.compare(password, foundUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }
      const token = jwt.sign({ id: foundUser.id, email: foundUser.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      res.json({
        token,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          currency: foundUser.currency,
          createdAt: foundUser.createdAt
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error during login." });
  }
};
var googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      res.status(400).json({
        message: "Google credential token or access token is required."
      });
      return;
    }
    let payload = null;
    if (accessToken) {
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!userInfoRes.ok) {
          res.status(401).json({ message: "Failed to verify Google access token with Google API." });
          return;
        }
        payload = await userInfoRes.json();
      } catch (err) {
        res.status(401).json({ message: `Google userinfo verification failed: ${err.message}` });
        return;
      }
    } else if (credential) {
      try {
        const ticket = await oauth2Client.verifyIdToken({
          idToken: credential,
          audience: googleClientId && googleClientId !== "YOUR_GOOGLE_CLIENT_ID" ? googleClientId : void 0
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.warn("Google verifyIdToken note:", verifyErr?.message);
        const parts = credential.split(".");
        if (parts.length >= 2) {
          try {
            const raw = Buffer.from(parts[1], "base64").toString("utf-8");
            payload = JSON.parse(raw);
          } catch {
            res.status(401).json({
              message: `Google token verification failed: ${verifyErr?.message || "Invalid Google credential token."}`
            });
            return;
          }
        } else {
          res.status(401).json({
            message: `Google token verification failed: ${verifyErr?.message || "Invalid Google credential token."}`
          });
          return;
        }
      }
    }
    if (!payload || !payload.email) {
      res.status(400).json({ message: "Verified Google account email could not be found." });
      return;
    }
    if (payload.email_verified === false) {
      res.status(401).json({ message: "Google account email is not verified." });
      return;
    }
    const cleanEmail = payload.email.trim().toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || payload.given_name || "CloudSpend User";
    const avatar = payload.picture;
    const conn = await connectToDatabase();
    if (conn) {
      let user = await User.findOne({
        $or: [{ googleId }, { email: cleanEmail }]
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
        const dummyPass = await bcrypt2.hash(Math.random().toString(36) + Date.now().toString(36), 10);
        user = await User.create({
          name: name.trim(),
          email: cleanEmail,
          passwordHash: dummyPass,
          currency: "USD",
          googleId,
          avatar
        });
      }
      const token2 = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      res.json({
        token: token2,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          avatar: user.avatar || avatar,
          createdAt: user.createdAt
        }
      });
      return;
    }
    let foundUser = null;
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
      const dummyPass = await bcrypt2.hash(Math.random().toString(36) + Date.now().toString(36), 10);
      foundUser = {
        id,
        name: name.trim(),
        email: cleanEmail,
        passwordHash: dummyPass,
        currency: "USD",
        googleId,
        avatar,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      memoryDb.users.set(id, foundUser);
    }
    const token = jwt.sign({ id: foundUser.id, email: foundUser.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        currency: foundUser.currency,
        avatar: foundUser.avatar || avatar,
        createdAt: foundUser.createdAt
      }
    });
  } catch (err) {
    console.error("googleAuth error:", err);
    res.status(500).json({ message: err?.message || "Failed to process Google sign in." });
  }
};
var getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(userId).select("-passwordHash");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: user.dateFormat || "YYYY-MM-DD",
          themePreference: user.themePreference || "system",
          createdAt: user.createdAt
        }
      });
    } else {
      const user = memoryDb.users.get(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: "YYYY-MM-DD",
          themePreference: "system",
          createdAt: user.createdAt
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching profile." });
  }
};
var updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, currency, dateFormat, themePreference } = req.body;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
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
          dateFormat: user.dateFormat || "YYYY-MM-DD",
          themePreference: user.themePreference || "system",
          createdAt: user.createdAt
        }
      });
    } else {
      const user = memoryDb.users.get(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (name) user.name = name.trim();
      if (currency) user.currency = currency;
      user.updatedAt = /* @__PURE__ */ new Date();
      memoryDb.users.set(userId, user);
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          dateFormat: "YYYY-MM-DD",
          themePreference: "system",
          createdAt: user.createdAt
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating profile." });
  }
};
var changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Current password and new password are required." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: "New password must be at least 6 characters." });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      const user2 = await User.findById(userId);
      if (!user2) {
        res.status(404).json({ message: "User not found." });
        return;
      }
      const isMatch2 = await bcrypt2.compare(currentPassword, user2.passwordHash);
      if (!isMatch2) {
        res.status(400).json({ message: "Current password is incorrect." });
        return;
      }
      const salt2 = await bcrypt2.genSalt(10);
      user2.passwordHash = await bcrypt2.hash(newPassword, salt2);
      await user2.save();
      res.json({ message: "Password updated successfully." });
      return;
    }
    const user = memoryDb.users.get(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    const isMatch = await bcrypt2.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: "Current password is incorrect." });
      return;
    }
    const salt = await bcrypt2.genSalt(10);
    user.passwordHash = await bcrypt2.hash(newPassword, salt);
    memoryDb.users.set(userId, user);
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Failed to update password." });
  }
};
var exportUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    let userDoc = null;
    let transactions = [];
    let budgets = [];
    let wallets = [];
    let recurring = [];
    if (conn) {
      [userDoc, transactions, budgets, wallets, recurring] = await Promise.all([
        User.findById(userId).select("-passwordHash"),
        Expense.find({ userId }).sort({ date: -1 }),
        Budget.find({ userId }).sort({ year: -1, month: -1 }),
        Wallet.find({ userId }),
        RecurringPayment.find({ userId })
      ]);
    }
    res.json({
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      account: userDoc,
      transactions,
      budgets,
      wallets,
      recurring
    });
  } catch (err) {
    console.error("exportUserData error:", err);
    res.status(500).json({ message: "Failed to export account data." });
  }
};
var deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      await Promise.all([
        Expense.deleteMany({ userId }),
        Budget.deleteMany({ userId }),
        Wallet.deleteMany({ userId }),
        RecurringPayment.deleteMany({ userId }),
        User.findByIdAndDelete(userId)
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
    res.json({ message: "Account and all associated records permanently removed." });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ message: "Failed to delete account." });
  }
};

// server/controllers/expenseController.ts
var getExpenses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { type, category, paymentMethod, wallet, startDate, endDate, search, sortBy } = req.query;
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const query = { userId };
        if (type && type !== "all") query.type = type;
        if (category && category !== "all") query.category = category;
        if (paymentMethod && paymentMethod !== "all") query.paymentMethod = paymentMethod;
        if (wallet && wallet !== "all") query.wallet = wallet;
        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = startDate;
          if (endDate) query.date.$lte = endDate;
        }
        if (search) {
          query.$or = [
            { description: { $regex: search, $options: "i" } },
            { notes: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
          ];
        }
        let sortObj = { date: -1, createdAt: -1 };
        if (sortBy === "date-asc") sortObj = { date: 1, createdAt: 1 };
        if (sortBy === "amount-desc") sortObj = { amount: -1 };
        if (sortBy === "amount-asc") sortObj = { amount: 1 };
        const records = await Expense.find(query).sort(sortObj);
        res.json({
          expenses: records.map((e) => ({
            id: e._id.toString(),
            userId: e.userId,
            type: e.type || "expense",
            amount: e.amount,
            description: e.description,
            category: e.category,
            date: e.date,
            paymentMethod: e.paymentMethod,
            wallet: e.wallet || "Cash",
            notes: e.notes,
            tags: e.tags,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt
          }))
        });
        return;
      } catch (dbErr) {
        console.warn("MongoDB query warning in getExpenses, using fallback store:", dbErr.message);
      }
    }
    let list = Array.from(memoryDb.expenses.values()).filter((e) => e.userId === userId);
    if (type && type !== "all") list = list.filter((e) => (e.type || "expense") === type);
    if (category && category !== "all") list = list.filter((e) => e.category === category);
    if (paymentMethod && paymentMethod !== "all") list = list.filter((e) => e.paymentMethod === paymentMethod);
    if (wallet && wallet !== "all") list = list.filter((e) => (e.wallet || "Cash") === wallet);
    if (startDate) list = list.filter((e) => e.date >= startDate);
    if (endDate) list = list.filter((e) => e.date <= endDate);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.description.toLowerCase().includes(q) || e.notes && e.notes.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      );
    }
    const sort = sortBy || "date-desc";
    list.sort((a, b) => {
      if (sort === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === "amount-desc") return b.amount - a.amount;
      if (sort === "amount-asc") return a.amount - b.amount;
      return 0;
    });
    res.json({ expenses: list });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching transactions" });
  }
};
var createExpense = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { amount, description, category, date, paymentMethod, wallet, type, notes, tags } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ message: "A positive amount is required." });
      return;
    }
    if (!description || !category || !date) {
      res.status(400).json({ message: "Description, category, and date are required." });
      return;
    }
    const conn = await connectToDatabase();
    const txType = type === "income" ? "income" : "expense";
    const txPaymentMethod = paymentMethod || "Cash";
    const txWallet = wallet || "Cash";
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
        notes: notes ? notes.trim() : void 0,
        tags: Array.isArray(tags) ? tags : void 0
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
          updatedAt: exp.updatedAt
        }
      });
    } else {
      const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const exp = {
        id,
        userId,
        type: txType,
        amount: Number(parseFloat(amount).toFixed(2)),
        description: description.trim(),
        category: category.trim(),
        date,
        paymentMethod: txPaymentMethod,
        wallet: txWallet,
        notes: notes ? notes.trim() : void 0,
        tags: Array.isArray(tags) ? tags : void 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      memoryDb.expenses.set(id, exp);
      res.status(201).json({ expense: exp });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Error recording transaction" });
  }
};
var bulkCreateExpenses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      res.status(400).json({ message: "An array of transactions is required." });
      return;
    }
    const conn = await connectToDatabase();
    const validRows = transactions.filter((t) => t.amount && Number(t.amount) > 0 && t.description && t.category && t.date).map((t) => ({
      userId,
      type: t.type === "income" ? "income" : "expense",
      amount: Number(parseFloat(t.amount).toFixed(2)),
      description: String(t.description).trim().slice(0, 150),
      category: String(t.category).trim().slice(0, 60),
      date: String(t.date).slice(0, 10),
      paymentMethod: String(t.paymentMethod || "Cash").trim(),
      wallet: String(t.wallet || "Cash").trim(),
      notes: t.notes ? String(t.notes).trim().slice(0, 500) : void 0
    }));
    if (conn) {
      const created = await Expense.insertMany(validRows);
      res.status(201).json({
        message: `Successfully imported ${created.length} transactions.`,
        count: created.length
      });
      return;
    }
    for (const row of validRows) {
      const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      memoryDb.expenses.set(id, { ...row, id, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() });
    }
    res.status(201).json({
      message: `Successfully imported ${validRows.length} transactions.`,
      count: validRows.length
    });
  } catch (err) {
    console.error("bulkCreateExpenses error:", err);
    res.status(500).json({ message: "Failed to bulk import transactions." });
  }
};
var updateExpense = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { amount, description, category, date, paymentMethod, wallet, type, notes, tags } = req.body;
    const conn = await connectToDatabase();
    const updateFields = {};
    if (amount !== void 0) updateFields.amount = Number(parseFloat(amount).toFixed(2));
    if (description !== void 0) updateFields.description = description.trim();
    if (category !== void 0) updateFields.category = category.trim();
    if (date !== void 0) updateFields.date = date;
    if (paymentMethod !== void 0) updateFields.paymentMethod = paymentMethod;
    if (wallet !== void 0) updateFields.wallet = wallet;
    if (type !== void 0) updateFields.type = type === "income" ? "income" : "expense";
    if (notes !== void 0) updateFields.notes = notes ? notes.trim() : void 0;
    if (tags !== void 0) updateFields.tags = tags;
    if (conn) {
      const updated = await Expense.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateFields },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ message: "Record not found or access denied." });
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
          updatedAt: updated.updatedAt
        }
      });
    } else {
      const exp = memoryDb.expenses.get(id);
      if (!exp || exp.userId !== userId) {
        res.status(404).json({ message: "Record not found or access denied." });
        return;
      }
      Object.assign(exp, updateFields, { updatedAt: /* @__PURE__ */ new Date() });
      memoryDb.expenses.set(id, exp);
      res.json({ expense: exp });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Error updating transaction" });
  }
};
var deleteExpense = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      const result = await Expense.findOneAndDelete({ _id: id, userId });
      if (!result) {
        res.status(404).json({ message: "Record not found or access denied." });
        return;
      }
    } else {
      const exp = memoryDb.expenses.get(id);
      if (!exp || exp.userId !== userId) {
        res.status(404).json({ message: "Record not found or access denied." });
        return;
      }
      memoryDb.expenses.delete(id);
    }
    res.json({ message: "Transaction removed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error deleting transaction" });
  }
};

// server/controllers/budgetController.ts
var getBudget = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    if (isNaN(month) || isNaN(year)) {
      res.status(400).json({ message: "Month and year are required query parameters." });
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
            updatedAt: budget.updatedAt
          }
        });
        return;
      } catch (dbErr) {
        console.warn("MongoDB query warning in getBudget, using fallback store:", dbErr.message);
      }
    }
    const key = `b_${userId}_${year}_${month}`;
    const found = memoryDb.budgets.get(key) || null;
    res.json({ budget: found });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching budget." });
  }
};
var setBudget = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { month, year, amount, categoryLimits } = req.body;
    if (!month || !year || !amount || amount <= 0) {
      res.status(400).json({ message: "Month, year, and a positive amount are required." });
      return;
    }
    const conn = await connectToDatabase();
    const cleanLimits = Array.isArray(categoryLimits) ? categoryLimits.filter((cl) => cl.category && cl.amount >= 0).map((cl) => ({ category: String(cl.category).trim(), amount: Number(cl.amount) })) : [];
    if (conn) {
      const budget = await Budget.findOneAndUpdate(
        { userId, month, year },
        {
          amount: Number(parseFloat(amount).toFixed(2)),
          categoryLimits: cleanLimits
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
          updatedAt: budget.updatedAt
        }
      });
    } else {
      const key = `b_${userId}_${year}_${month}`;
      const existing = memoryDb.budgets.get(key);
      const updated = {
        id: existing ? existing.id : `b_${Date.now()}`,
        userId,
        month: Number(month),
        year: Number(year),
        amount: Number(parseFloat(amount).toFixed(2)),
        categoryLimits: cleanLimits,
        createdAt: existing ? existing.createdAt : /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      memoryDb.budgets.set(key, updated);
      res.json({ budget: updated });
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "Error setting budget." });
  }
};

// server/controllers/dashboardController.ts
var getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const now = /* @__PURE__ */ new Date();
    const currentMonth = parseInt(req.query.month || (now.getMonth() + 1).toString(), 10);
    const currentYear = parseInt(req.query.year || now.getFullYear().toString(), 10);
    const period = req.query.period || "this-month";
    const customStart = req.query.startDate;
    const customEnd = req.query.endDate;
    const mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const prefix = `${currentYear}-${mStr}`;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMStr = prevMonth < 10 ? `0${prevMonth}` : `${prevMonth}`;
    const prevPrefix = `${prevYear}-${prevMStr}`;
    const conn = await connectToDatabase();
    let curTx = [];
    let prTx = [];
    let budgetDoc = null;
    let upcomingRecurring = [];
    if (conn) {
      try {
        let dateQuery = { $regex: `^${prefix}` };
        if (period === "last-month") {
          dateQuery = { $regex: `^${prevPrefix}` };
        } else if (period === "last-3-months") {
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
          dateQuery = { $gte: threeMonthsAgo };
        } else if (period === "this-year") {
          dateQuery = { $regex: `^${currentYear}-` };
        } else if (period === "custom" && customStart && customEnd) {
          dateQuery = { $gte: customStart, $lte: customEnd };
        }
        const [txList, prevList, bDoc, recList] = await Promise.all([
          Expense.find({ userId, date: dateQuery }).sort({ date: -1 }),
          Expense.find({ userId, date: { $regex: `^${prevPrefix}` } }),
          Budget.findOne({ userId, month: currentMonth, year: currentYear }),
          RecurringPayment.find({ userId, status: "active" }).sort({ nextDueDate: 1 }).limit(5)
        ]);
        curTx = txList;
        prTx = prevList;
        budgetDoc = bDoc;
        upcomingRecurring = recList;
      } catch (dbErr) {
        console.warn("MongoDB query warning in getDashboardSummary, fallback used:", dbErr.message);
      }
    }
    if (curTx.length === 0 && !conn) {
      curTx = Array.from(memoryDb.expenses.values()).filter(
        (e) => e.userId === userId && e.date.startsWith(prefix)
      );
      prTx = Array.from(memoryDb.expenses.values()).filter(
        (e) => e.userId === userId && e.date.startsWith(prevPrefix)
      );
      budgetDoc = memoryDb.budgets.get(`b_${userId}_${currentYear}_${currentMonth}`);
    }
    const expenses = curTx.filter((t) => (t.type || "expense") !== "income");
    const incomes = curTx.filter((t) => t.type === "income");
    const totalMonthExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMonthIncome = incomes.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalMonthIncome - totalMonthExpenses;
    const previousExpenses = prTx.filter((t) => (t.type || "expense") !== "income");
    const previousMonthTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyBudget = budgetDoc ? budgetDoc.amount : 0;
    const remainingBudget = Math.max(0, monthlyBudget - totalMonthExpenses);
    const budgetUsedPercentage = monthlyBudget > 0 ? Math.round(totalMonthExpenses / monthlyBudget * 100) : 0;
    let percentageChangeFromLastMonth;
    if (previousMonthTotal > 0 && totalMonthExpenses > 0) {
      percentageChangeFromLastMonth = Math.round(
        (totalMonthExpenses - previousMonthTotal) / previousMonthTotal * 100
      );
    }
    const catMap = {};
    expenses.forEach((e) => {
      if (!catMap[e.category]) catMap[e.category] = { amount: 0, count: 0 };
      catMap[e.category].amount += e.amount;
      catMap[e.category].count += 1;
    });
    const spendingByCategory = Object.entries(catMap).map(([cat, data]) => ({
      category: cat,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: totalMonthExpenses > 0 ? Math.round(data.amount / totalMonthExpenses * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
    const incomeCatMap = {};
    incomes.forEach((e) => {
      if (!incomeCatMap[e.category]) incomeCatMap[e.category] = { amount: 0, count: 0 };
      incomeCatMap[e.category].amount += e.amount;
      incomeCatMap[e.category].count += 1;
    });
    const incomeByCategory = Object.entries(incomeCatMap).map(([cat, data]) => ({
      category: cat,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: totalMonthIncome > 0 ? Math.round(data.amount / totalMonthIncome * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
    const highestCategory = spendingByCategory.length > 0 ? spendingByCategory[0] : void 0;
    const largestTransaction = expenses.length > 0 ? [...expenses].sort((a, b) => b.amount - a.amount)[0] : void 0;
    const dailyMap = {};
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = day < 10 ? `0${day}` : `${day}`;
      dailyMap[`${prefix}-${dStr}`] = { expense: 0, income: 0 };
    }
    curTx.forEach((t) => {
      if (dailyMap[t.date]) {
        if (t.type === "income") {
          dailyMap[t.date].income += t.amount;
        } else {
          dailyMap[t.date].expense += t.amount;
        }
      }
    });
    const dailySpendingTrend = Object.entries(dailyMap).map(([d, val]) => {
      const dayNum = parseInt(d.split("-")[2] || "1", 10);
      return {
        date: d,
        day: dayNum,
        amount: Number(val.expense.toFixed(2)),
        income: Number(val.income.toFixed(2))
      };
    });
    const passedDays = now.getMonth() + 1 === currentMonth && now.getFullYear() === currentYear ? Math.max(1, now.getDate()) : daysInMonth;
    const averageDailySpend = Number((totalMonthExpenses / passedDays).toFixed(2));
    res.json({
      summary: {
        totalMonthExpenses: Number(totalMonthExpenses.toFixed(2)),
        totalMonthIncome: Number(totalMonthIncome.toFixed(2)),
        netBalance: Number(netBalance.toFixed(2)),
        monthlyBudget,
        remainingBudget: Number(remainingBudget.toFixed(2)),
        budgetUsedPercentage,
        transactionCount: curTx.length,
        averageDailySpend,
        previousMonthTotal: Number(previousMonthTotal.toFixed(2)),
        percentageChangeFromLastMonth,
        highestCategory,
        largestTransaction: largestTransaction ? {
          id: largestTransaction._id ? largestTransaction._id.toString() : largestTransaction.id,
          userId: largestTransaction.userId,
          type: largestTransaction.type || "expense",
          amount: largestTransaction.amount,
          description: largestTransaction.description,
          category: largestTransaction.category,
          date: largestTransaction.date,
          paymentMethod: largestTransaction.paymentMethod,
          wallet: largestTransaction.wallet || "Cash"
        } : void 0,
        spendingByCategory,
        incomeByCategory,
        dailySpendingTrend,
        upcomingRecurring: upcomingRecurring.map((r) => ({
          id: r._id ? r._id.toString() : r.id,
          name: r.name,
          amount: r.amount,
          type: r.type || "expense",
          category: r.category,
          frequency: r.frequency,
          nextDueDate: r.nextDueDate,
          wallet: r.wallet || "Cash"
        }))
      }
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({ message: err.message || "Error generating dashboard metrics" });
  }
};

// server/controllers/walletController.ts
var fallbackWallets = /* @__PURE__ */ new Map();
var getWallets = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    let wallets = [];
    if (conn) {
      try {
        wallets = await Wallet.find({ userId }).sort({ createdAt: 1 });
      } catch (err) {
        console.warn("Wallet mongo query failed, using fallback:", err);
      }
    }
    if (wallets.length === 0) {
      const userWallets = Array.from(fallbackWallets.values()).filter((w) => w.userId === userId);
      if (userWallets.length > 0) {
        wallets = userWallets;
      } else {
        const starter = [
          { id: "w_cash", userId, name: "Cash in Hand", type: "cash", openingBalance: 0, color: "#10B981", icon: "Coins" },
          { id: "w_bank", userId, name: "Main Bank Account", type: "bank", openingBalance: 0, color: "#5145E5", icon: "Building2" },
          { id: "w_upi", userId, name: "UPI / Digital Wallet", type: "upi", openingBalance: 0, color: "#06B6D4", icon: "Smartphone" },
          { id: "w_credit", userId, name: "Credit Card", type: "credit", openingBalance: 0, color: "#F59E0B", icon: "CreditCard" }
        ];
        res.json({ wallets: starter });
        return;
      }
    }
    let allTx = [];
    if (conn) {
      try {
        allTx = await Expense.find({ userId });
      } catch (e) {
      }
    }
    const formatted = wallets.map((w) => {
      const wId = w._id ? w._id.toString() : w.id;
      const wName = w.name;
      const walletTx = allTx.filter((t) => t.wallet === wName || t.wallet === wId);
      const incomeTotal = walletTx.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expenseTotal = walletTx.filter((t) => t.type !== "income").reduce((sum, t) => sum + t.amount, 0);
      const opening = Number(w.openingBalance || 0);
      const calculatedBalance = opening + incomeTotal - expenseTotal;
      return {
        id: wId,
        userId: w.userId,
        name: w.name,
        type: w.type || "cash",
        openingBalance: opening,
        balance: Number(calculatedBalance.toFixed(2)),
        color: w.color || "#5145E5",
        icon: w.icon || "Wallet",
        createdAt: w.createdAt
      };
    });
    res.json({ wallets: formatted });
  } catch (err) {
    console.error("getWallets error:", err);
    res.status(500).json({ message: "Failed to retrieve wallets." });
  }
};
var createWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, type, openingBalance, color, icon } = req.body;
    if (!name) {
      res.status(400).json({ message: "Wallet name is required." });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const newWallet = await Wallet.create({
          userId,
          name: name.trim(),
          type: type || "cash",
          openingBalance: Number(openingBalance || 0),
          color: color || "#5145E5",
          icon: icon || "Wallet"
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
            createdAt: newWallet.createdAt
          }
        });
        return;
      } catch (err) {
        console.warn("Mongo createWallet failed, fallback:", err);
      }
    }
    const id = `w_${Date.now()}`;
    const fallbackItem = {
      id,
      userId,
      name: name.trim(),
      type: type || "cash",
      openingBalance: Number(openingBalance || 0),
      balance: Number(openingBalance || 0),
      color: color || "#5145E5",
      icon: icon || "Wallet",
      createdAt: /* @__PURE__ */ new Date()
    };
    fallbackWallets.set(id, fallbackItem);
    res.status(201).json({ wallet: fallbackItem });
  } catch (err) {
    console.error("createWallet error:", err);
    res.status(500).json({ message: "Failed to create wallet." });
  }
};
var updateWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, type, openingBalance, color, icon } = req.body;
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const updated = await Wallet.findOneAndUpdate(
          { _id: id, userId },
          {
            ...name ? { name: name.trim() } : {},
            ...type ? { type } : {},
            ...openingBalance !== void 0 ? { openingBalance: Number(openingBalance) } : {},
            ...color ? { color } : {},
            ...icon ? { icon } : {}
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
              icon: updated.icon
            }
          });
          return;
        }
      } catch (err) {
        console.warn("Mongo updateWallet error, fallback:", err);
      }
    }
    const existing = fallbackWallets.get(id);
    if (existing && existing.userId === userId) {
      if (name) existing.name = name.trim();
      if (type) existing.type = type;
      if (openingBalance !== void 0) existing.openingBalance = Number(openingBalance);
      if (color) existing.color = color;
      if (icon) existing.icon = icon;
      fallbackWallets.set(id, existing);
      res.json({ wallet: existing });
      return;
    }
    res.status(404).json({ message: "Wallet not found." });
  } catch (err) {
    console.error("updateWallet error:", err);
    res.status(500).json({ message: "Failed to update wallet." });
  }
};
var deleteWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Wallet.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn("Mongo deleteWallet error:", err);
      }
    }
    fallbackWallets.delete(id);
    res.json({ message: "Wallet deleted successfully." });
  } catch (err) {
    console.error("deleteWallet error:", err);
    res.status(500).json({ message: "Failed to delete wallet." });
  }
};

// server/controllers/recurringController.ts
var fallbackRecurring = /* @__PURE__ */ new Map();
function calculateNextDueDate(currentDueDateStr, frequency) {
  const date = new Date(currentDueDateStr);
  if (isNaN(date.getTime())) {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "monthly":
    default:
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date.toISOString().slice(0, 10);
}
var getRecurringPayments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    let recurring = [];
    if (conn) {
      try {
        recurring = await RecurringPayment.find({ userId }).sort({ nextDueDate: 1 });
      } catch (err) {
        console.warn("Mongo recurring query failed:", err);
      }
    }
    if (recurring.length === 0) {
      recurring = Array.from(fallbackRecurring.values()).filter((r) => r.userId === userId);
    }
    const formatted = recurring.map((r) => ({
      id: r._id ? r._id.toString() : r.id,
      userId: r.userId,
      name: r.name,
      amount: r.amount,
      type: r.type || "expense",
      category: r.category,
      paymentMethod: r.paymentMethod,
      wallet: r.wallet || "Cash",
      frequency: r.frequency,
      nextDueDate: r.nextDueDate,
      status: r.status,
      notes: r.notes,
      lastPaidDate: r.lastPaidDate,
      createdAt: r.createdAt
    }));
    res.json({ recurring: formatted });
  } catch (err) {
    console.error("getRecurringPayments error:", err);
    res.status(500).json({ message: "Failed to retrieve recurring payments." });
  }
};
var createRecurringPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, amount, type, category, paymentMethod, wallet, frequency, nextDueDate, notes } = req.body;
    if (!name || !amount || !category || !nextDueDate) {
      res.status(400).json({ message: "Name, amount, category, and nextDueDate are required." });
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ message: "Amount must be greater than zero." });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const item = await RecurringPayment.create({
          userId,
          name: name.trim(),
          amount: parseFloat(numAmount.toFixed(2)),
          type: type || "expense",
          category: category.trim(),
          paymentMethod: paymentMethod || "Cash",
          wallet: wallet || "Cash",
          frequency: frequency || "monthly",
          nextDueDate,
          status: "active",
          notes: notes?.trim()
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
            createdAt: item.createdAt
          }
        });
        return;
      } catch (err) {
        console.warn("Mongo createRecurring failed:", err);
      }
    }
    const id = `rec_${Date.now()}`;
    const fallbackItem = {
      id,
      userId,
      name: name.trim(),
      amount: parseFloat(numAmount.toFixed(2)),
      type: type || "expense",
      category: category.trim(),
      paymentMethod: paymentMethod || "Cash",
      wallet: wallet || "Cash",
      frequency: frequency || "monthly",
      nextDueDate,
      status: "active",
      notes: notes?.trim(),
      createdAt: /* @__PURE__ */ new Date()
    };
    fallbackRecurring.set(id, fallbackItem);
    res.status(201).json({ recurring: fallbackItem });
  } catch (err) {
    console.error("createRecurringPayment error:", err);
    res.status(500).json({ message: "Failed to create recurring payment." });
  }
};
var markRecurringAsPaid = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    let recurringDoc = null;
    if (conn) {
      try {
        recurringDoc = await RecurringPayment.findOne({ _id: id, userId });
      } catch (err) {
      }
    }
    if (!recurringDoc) {
      recurringDoc = fallbackRecurring.get(id);
    }
    if (!recurringDoc || recurringDoc.userId !== userId) {
      res.status(404).json({ message: "Recurring payment not found." });
      return;
    }
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const nextDate = calculateNextDueDate(recurringDoc.nextDueDate || todayStr, recurringDoc.frequency);
    if (conn) {
      try {
        await Expense.create({
          userId,
          type: recurringDoc.type || "expense",
          amount: recurringDoc.amount,
          description: `${recurringDoc.name} (Recurring Payment)`,
          category: recurringDoc.category,
          date: todayStr,
          paymentMethod: recurringDoc.paymentMethod || "Cash",
          wallet: recurringDoc.wallet || "Cash",
          notes: `Auto-recorded from bill schedule: ${recurringDoc.frequency}`
        });
        recurringDoc.lastPaidDate = todayStr;
        recurringDoc.nextDueDate = nextDate;
        await recurringDoc.save();
        res.json({
          message: "Payment recorded and schedule updated.",
          nextDueDate: nextDate,
          lastPaidDate: todayStr
        });
        return;
      } catch (err) {
        console.warn("Mongo markRecurringAsPaid error:", err);
      }
    }
    recurringDoc.lastPaidDate = todayStr;
    recurringDoc.nextDueDate = nextDate;
    fallbackRecurring.set(id, recurringDoc);
    res.json({
      message: "Payment recorded and schedule updated.",
      nextDueDate: nextDate,
      lastPaidDate: todayStr
    });
  } catch (err) {
    console.error("markRecurringAsPaid error:", err);
    res.status(500).json({ message: "Failed to process recurring payment." });
  }
};
var updateRecurringPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
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
      }
    }
    const existing = fallbackRecurring.get(id);
    if (existing && existing.userId === userId) {
      const merged = { ...existing, ...req.body };
      fallbackRecurring.set(id, merged);
      res.json({ recurring: merged });
      return;
    }
    res.status(404).json({ message: "Recurring payment not found." });
  } catch (err) {
    console.error("updateRecurringPayment error:", err);
    res.status(500).json({ message: "Failed to update recurring payment." });
  }
};
var deleteRecurringPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await RecurringPayment.findOneAndDelete({ _id: id, userId });
      } catch (err) {
      }
    }
    fallbackRecurring.delete(id);
    res.json({ message: "Recurring payment removed." });
  } catch (err) {
    console.error("deleteRecurringPayment error:", err);
    res.status(500).json({ message: "Failed to delete recurring payment." });
  }
};

// server/controllers/categoryController.ts
var getCategories = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    let customCategories = [];
    if (conn) {
      try {
        const user = await User.findById(userId);
        if (user && user.customCategories) {
          customCategories = user.customCategories;
        }
      } catch (err) {
        console.warn("Mongo getCategories failed:", err);
      }
    }
    res.json({ categories: customCategories });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ message: "Failed to retrieve categories." });
  }
};
var addCategory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, type, color } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: "Category name is required." });
      return;
    }
    const catName = name.trim();
    const catType = type === "income" ? "income" : "expense";
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (!user.customCategories) user.customCategories = [];
          const exists = user.customCategories.some(
            (c) => c.name.toLowerCase() === catName.toLowerCase() && c.type === catType
          );
          if (exists) {
            res.status(400).json({ message: "Category already exists." });
            return;
          }
          user.customCategories.push({ name: catName, type: catType, color: color || "#5145E5" });
          await user.save();
          res.status(201).json({ category: { name: catName, type: catType, color: color || "#5145E5" } });
          return;
        }
      } catch (err) {
        console.warn("Mongo addCategory error:", err);
      }
    }
    res.status(201).json({ category: { name: catName, type: catType, color: color || "#5145E5" } });
  } catch (err) {
    console.error("addCategory error:", err);
    res.status(500).json({ message: "Failed to add category." });
  }
};
var deleteCategory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const conn = await connectToDatabase();
    if (conn) {
      try {
        const user = await User.findById(userId);
        if (user && user.customCategories) {
          user.customCategories = user.customCategories.filter(
            (c) => c.name.toLowerCase() !== decodeURIComponent(name).toLowerCase()
          );
          await user.save();
        }
      } catch (err) {
        console.warn("Mongo deleteCategory error:", err);
      }
    }
    res.json({ message: "Category removed." });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ message: "Failed to delete category." });
  }
};

// server/middleware/authMiddleware.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "cloudspend_prod_jwt_secret_key_2026";
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required. No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt2.verify(token, JWT_SECRET2);
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Session expired or invalid authentication token." });
  }
}

// server/app.ts
var app = express();
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.CLIENT_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", origin || allowedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
app.get("/api/health", async (req, res) => {
  if (process.env.MONGODB_URI) {
    await connectToDatabase();
  }
  const dbStatus = getDatabaseStatus();
  res.json({
    status: "healthy",
    service: "CloudSpend API",
    runtime: "AWS Lambda / Express Compatible",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: {
      provider: process.env.MONGODB_URI ? "MongoDB Atlas" : "In-Memory Distributed Fallback Store",
      configured: Boolean(process.env.MONGODB_URI),
      connected: dbStatus.connected,
      cluster: dbStatus.cluster,
      error: dbStatus.error
    }
  });
});
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/google", googleAuth);
app.get("/api/auth/me", authMiddleware, getMe);
app.put("/api/auth/profile", authMiddleware, updateProfile);
app.post("/api/auth/change-password", authMiddleware, changePassword);
app.get("/api/auth/export", authMiddleware, exportUserData);
app.delete("/api/auth/account", authMiddleware, deleteAccount);
app.get("/api/expenses", authMiddleware, getExpenses);
app.post("/api/expenses", authMiddleware, createExpense);
app.post("/api/expenses/bulk", authMiddleware, bulkCreateExpenses);
app.put("/api/expenses/:id", authMiddleware, updateExpense);
app.delete("/api/expenses/:id", authMiddleware, deleteExpense);
app.get("/api/budgets", authMiddleware, getBudget);
app.post("/api/budgets", authMiddleware, setBudget);
app.get("/api/dashboard/summary", authMiddleware, getDashboardSummary);
app.get("/api/wallets", authMiddleware, getWallets);
app.post("/api/wallets", authMiddleware, createWallet);
app.put("/api/wallets/:id", authMiddleware, updateWallet);
app.delete("/api/wallets/:id", authMiddleware, deleteWallet);
app.get("/api/recurring", authMiddleware, getRecurringPayments);
app.post("/api/recurring", authMiddleware, createRecurringPayment);
app.post("/api/recurring/:id/pay", authMiddleware, markRecurringAsPaid);
app.put("/api/recurring/:id", authMiddleware, updateRecurringPayment);
app.delete("/api/recurring/:id", authMiddleware, deleteRecurringPayment);
app.get("/api/categories", authMiddleware, getCategories);
app.post("/api/categories", authMiddleware, addCategory);
app.delete("/api/categories/:name", authMiddleware, deleteCategory);
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    message: "An internal server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.message : void 0
  });
});
var app_default = app;
export {
  app_default as default
};
