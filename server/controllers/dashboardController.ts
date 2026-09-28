import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { RecurringPayment } from '../models/RecurringPayment';
import { memoryDb } from '../services/dbFallback';
import { connectToDatabase } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const now = new Date();
    const currentMonth = parseInt((req.query.month as string) || (now.getMonth() + 1).toString(), 10);
    const currentYear = parseInt((req.query.year as string) || now.getFullYear().toString(), 10);
    const period = (req.query.period as string) || 'this-month';
    const customStart = req.query.startDate as string;
    const customEnd = req.query.endDate as string;

    const mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const prefix = `${currentYear}-${mStr}`;

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMStr = prevMonth < 10 ? `0${prevMonth}` : `${prevMonth}`;
    const prevPrefix = `${prevYear}-${prevMStr}`;

    const conn = await connectToDatabase();
    let curTx: any[] = [];
    let prTx: any[] = [];
    let budgetDoc: any = null;
    let upcomingRecurring: any[] = [];

    if (conn) {
      try {
        let dateQuery: any = { $regex: `^${prefix}` };

        if (period === 'last-month') {
          dateQuery = { $regex: `^${prevPrefix}` };
        } else if (period === 'last-3-months') {
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
          dateQuery = { $gte: threeMonthsAgo };
        } else if (period === 'this-year') {
          dateQuery = { $regex: `^${currentYear}-` };
        } else if (period === 'custom' && customStart && customEnd) {
          dateQuery = { $gte: customStart, $lte: customEnd };
        }

        const [txList, prevList, bDoc, recList] = await Promise.all([
          Expense.find({ userId, date: dateQuery }).sort({ date: -1 }),
          Expense.find({ userId, date: { $regex: `^${prevPrefix}` } }),
          Budget.findOne({ userId, month: currentMonth, year: currentYear }),
          RecurringPayment.find({ userId, status: 'active' }).sort({ nextDueDate: 1 }).limit(5),
        ]);

        curTx = txList;
        prTx = prevList;
        budgetDoc = bDoc;
        upcomingRecurring = recList;
      } catch (dbErr: any) {
        console.warn('MongoDB query warning in getDashboardSummary, fallback used:', dbErr.message);
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

    // Split Expenses vs Income
    const expenses = curTx.filter((t) => (t.type || 'expense') !== 'income');
    const incomes = curTx.filter((t) => t.type === 'income');

    const totalMonthExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMonthIncome = incomes.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalMonthIncome - totalMonthExpenses;

    const previousExpenses = prTx.filter((t) => (t.type || 'expense') !== 'income');
    const previousMonthTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyBudget = budgetDoc ? budgetDoc.amount : 0;
    const remainingBudget = Math.max(0, monthlyBudget - totalMonthExpenses);
    const budgetUsedPercentage = monthlyBudget > 0 ? Math.round((totalMonthExpenses / monthlyBudget) * 100) : 0;

    let percentageChangeFromLastMonth: number | undefined;
    if (previousMonthTotal > 0 && totalMonthExpenses > 0) {
      percentageChangeFromLastMonth = Math.round(
        ((totalMonthExpenses - previousMonthTotal) / previousMonthTotal) * 100
      );
    }

    // Category Breakdowns
    const catMap: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((e) => {
      if (!catMap[e.category]) catMap[e.category] = { amount: 0, count: 0 };
      catMap[e.category].amount += e.amount;
      catMap[e.category].count += 1;
    });

    const spendingByCategory = Object.entries(catMap)
      .map(([cat, data]) => ({
        category: cat,
        amount: Number(data.amount.toFixed(2)),
        count: data.count,
        percentage: totalMonthExpenses > 0 ? Math.round((data.amount / totalMonthExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const incomeCatMap: Record<string, { amount: number; count: number }> = {};
    incomes.forEach((e) => {
      if (!incomeCatMap[e.category]) incomeCatMap[e.category] = { amount: 0, count: 0 };
      incomeCatMap[e.category].amount += e.amount;
      incomeCatMap[e.category].count += 1;
    });

    const incomeByCategory = Object.entries(incomeCatMap)
      .map(([cat, data]) => ({
        category: cat,
        amount: Number(data.amount.toFixed(2)),
        count: data.count,
        percentage: totalMonthIncome > 0 ? Math.round((data.amount / totalMonthIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const highestCategory = spendingByCategory.length > 0 ? spendingByCategory[0] : undefined;
    const largestTransaction = expenses.length > 0
      ? [...expenses].sort((a, b) => b.amount - a.amount)[0]
      : undefined;

    // Daily Timeline Trend
    const dailyMap: Record<string, { expense: number; income: number }> = {};
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = day < 10 ? `0${day}` : `${day}`;
      dailyMap[`${prefix}-${dStr}`] = { expense: 0, income: 0 };
    }

    curTx.forEach((t) => {
      if (dailyMap[t.date]) {
        if (t.type === 'income') {
          dailyMap[t.date].income += t.amount;
        } else {
          dailyMap[t.date].expense += t.amount;
        }
      }
    });

    const dailySpendingTrend = Object.entries(dailyMap).map(([d, val]) => {
      const dayNum = parseInt(d.split('-')[2] || '1', 10);
      return {
        date: d,
        day: dayNum,
        amount: Number(val.expense.toFixed(2)),
        income: Number(val.income.toFixed(2)),
      };
    });

    const passedDays = now.getMonth() + 1 === currentMonth && now.getFullYear() === currentYear
      ? Math.max(1, now.getDate())
      : daysInMonth;
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
        largestTransaction: largestTransaction
          ? {
              id: largestTransaction._id ? largestTransaction._id.toString() : largestTransaction.id,
              userId: largestTransaction.userId,
              type: largestTransaction.type || 'expense',
              amount: largestTransaction.amount,
              description: largestTransaction.description,
              category: largestTransaction.category,
              date: largestTransaction.date,
              paymentMethod: largestTransaction.paymentMethod,
              wallet: largestTransaction.wallet || 'Cash',
            }
          : undefined,
        spendingByCategory,
        incomeByCategory,
        dailySpendingTrend,
        upcomingRecurring: upcomingRecurring.map((r) => ({
          id: r._id ? r._id.toString() : r.id,
          name: r.name,
          amount: r.amount,
          type: r.type || 'expense',
          category: r.category,
          frequency: r.frequency,
          nextDueDate: r.nextDueDate,
          wallet: r.wallet || 'Cash',
        })),
      },
    });
  } catch (err: any) {
    console.error('getDashboardSummary error:', err);
    res.status(500).json({ message: err.message || 'Error generating dashboard metrics' });
  }
};
