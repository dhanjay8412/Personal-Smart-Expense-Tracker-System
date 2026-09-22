const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const [allTotals, monthlyTotals, recentTransactions, categoryAgg, monthlyTrendAgg, budgets] = await Promise.all([
      // 1. All-time Totals
      Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
      // 2. Current Month Totals
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
      // 3. Recent 5 Transactions
      Transaction.find({ user: userId }).sort({ date: -1 }).limit(5),
      // 4. Current Month Category Breakdown (Expenses)
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ]),
      // 5. Monthly Income vs Expense Trend (Last 6 Months)
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: {
              $gte: new Date(currentYear, currentMonth - 6, 1),
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
      ]),
      // 6. Budgets for current month
      Budget.find({ user: userId, month: currentMonth, year: currentYear }),
    ]);

    // Parse all-time totals
    let totalIncome = 0;
    let totalExpenses = 0;
    allTotals.forEach((t) => {
      if (t._id === 'Income') totalIncome = t.total;
      if (t._id === 'Expense') totalExpenses = t.total;
    });
    const totalBalance = totalIncome - totalExpenses;

    // Parse monthly totals
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    monthlyTotals.forEach((t) => {
      if (t._id === 'Income') monthlyIncome = t.total;
      if (t._id === 'Expense') monthlyExpenses = t.total;
    });
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Number(((monthlySavings / monthlyIncome) * 100).toFixed(1)) : 0;

    // Format Category Breakdown with percentages
    const totalMonthExpense = categoryAgg.reduce((acc, curr) => acc + curr.total, 0);
    const categoryBreakdown = categoryAgg.map((cat) => ({
      name: cat._id,
      amount: cat.total,
      percentage: totalMonthExpense > 0 ? Number(((cat.total / totalMonthExpense) * 100).toFixed(1)) : 0,
    }));

    // Format Income vs Expense Bar Chart data (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      trendMap[key] = {
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        income: 0,
        expense: 0,
      };
    }

    monthlyTrendAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (trendMap[key]) {
        if (item._id.type === 'Income') trendMap[key].income = item.total;
        if (item._id.type === 'Expense') trendMap[key].expense = item.total;
      }
    });

    const incomeVsExpenseChart = Object.values(trendMap);

    // Calculate budget statuses
    const budgetMap = {};
    categoryAgg.forEach((item) => {
      budgetMap[item._id] = item.total;
    });

    const budgetStatus = budgets.map((b) => {
      const spent = budgetMap[b.category] || 0;
      const percentage = (spent / b.amount) * 100;
      return {
        category: b.category,
        budget: b.amount,
        spent,
        remaining: b.amount - spent,
        percentage: Number(percentage.toFixed(1)),
      };
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          kpi: {
            totalBalance,
            totalIncome,
            totalExpenses,
            monthlyIncome,
            monthlyExpenses,
            monthlySavings,
            savingsRate,
            currency: req.user.currency || 'INR',
          },
          recentTransactions,
          categoryBreakdown,
          incomeVsExpenseChart,
          budgetStatus,
        },
        'Dashboard overview data fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getMonthlySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const [totals, highestExpense, categoryAgg, count] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.findOne({
        user: userId,
        type: 'Expense',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }).sort({ amount: -1 }),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      Transaction.countDocuments({
        user: userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }),
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    totals.forEach((t) => {
      if (t._id === 'Income') monthlyIncome = t.total;
      if (t._id === 'Expense') monthlyExpenses = t.total;
    });

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Number(((monthlySavings / monthlyIncome) * 100).toFixed(1)) : 0;
    const averageDailySpending = Number((monthlyExpenses / daysInMonth).toFixed(2));
    const highestSpendingCategory = categoryAgg[0] ? { name: categoryAgg[0]._id, amount: categoryAgg[0].total } : null;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          month,
          year,
          monthlyIncome,
          monthlyExpenses,
          monthlySavings,
          savingsRate,
          averageDailySpending,
          transactionCount: count,
          highestExpense,
          highestSpendingCategory,
        },
        'Monthly summary retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getAnalyticsTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { range, startDate: customStart, endDate: customEnd } = req.query;

    const now = new Date();
    let startDate;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (range) {
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = customEnd ? new Date(customEnd) : endDate;
        break;
      case 'thisMonth':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const [totals, categoryDistribution, paymentMethodDistribution, dailyTrend] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.dateStr': 1 } },
      ]),
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    totals.forEach((t) => {
      if (t._id === 'Income') totalIncome = t.total;
      if (t._id === 'Expense') totalExpenses = t.total;
    });

    const savings = totalIncome - totalExpenses;
    const averageExpense = totals.find((t) => t._id === 'Expense')?.count
      ? Number((totalExpenses / totals.find((t) => t._id === 'Expense').count).toFixed(2))
      : 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          range: range || 'thisMonth',
          startDate,
          endDate,
          summary: {
            totalIncome,
            totalExpenses,
            savings,
            averageExpense,
          },
          categoryDistribution,
          paymentMethodDistribution,
          dailyTrend,
        },
        'Analytics data retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

const getPaymentMethodAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { range, startDate: customStart, endDate: customEnd } = req.query;

    const now = new Date();
    let startDate;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (range) {
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = customEnd ? new Date(customEnd) : endDate;
        break;
      case 'thisMonth':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const [aggResult, totalExpensesAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$paymentMethod',
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const totalSpent = totalExpensesAgg[0] ? totalExpensesAgg[0].totalSpent : 0;

    const paymentMethodsData = aggResult.map((item) => ({
      paymentMethod: item._id || 'Cash',
      amount: item.amount,
      count: item.count,
      percentage: totalSpent > 0 ? Number(((item.amount / totalSpent) * 100).toFixed(1)) : 0,
    }));

    return res.status(200).json(
      new ApiResponse(200, paymentMethodsData, 'Payment method analytics computed successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getSpendingTrendDetection = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Current month date range
    const currentStart = new Date(currentYear, currentMonth - 1, 1);
    const currentEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Previous month date range
    const prevStart = new Date(currentYear, currentMonth - 2, 1);
    const prevEnd = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59, 999);

    const [currentTotals, prevTotals, currentCatAgg, prevCatAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: currentStart, $lte: currentEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: prevStart, $lte: prevEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: currentStart, $lte: currentEnd },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'Expense',
            date: { $gte: prevStart, $lte: prevEnd },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const currentAmount = currentTotals[0] ? currentTotals[0].total : 0;
    const previousAmount = prevTotals[0] ? prevTotals[0].total : 0;
    const difference = currentAmount - previousAmount;

    let percentageChange = 0;
    if (previousAmount > 0) {
      percentageChange = Number((((currentAmount - previousAmount) / previousAmount) * 100).toFixed(2));
    } else if (currentAmount > 0) {
      percentageChange = 100;
    }

    let overallTrend = 'Stable';
    if (difference > 100) overallTrend = 'Increasing';
    else if (difference < -100) overallTrend = 'Decreasing';

    // Map Category Comparisons
    const currentCatMap = {};
    currentCatAgg.forEach((item) => (currentCatMap[item._id] = item.total));

    const prevCatMap = {};
    prevCatAgg.forEach((item) => (prevCatMap[item._id] = item.total));

    const allCategories = Array.from(new Set([...Object.keys(currentCatMap), ...Object.keys(prevCatMap)]));

    const categoryChanges = allCategories.map((cat) => {
      const curr = currentCatMap[cat] || 0;
      const prev = prevCatMap[cat] || 0;
      const diff = curr - prev;

      let pct = 0;
      if (prev > 0) {
        pct = Number((((curr - prev) / prev) * 100).toFixed(2));
      } else if (curr > 0) {
        pct = 100;
      }

      let status = 'Stable';
      if (diff > 50) status = 'Increasing';
      else if (diff < -50) status = 'Decreasing';

      return {
        category: cat,
        current: curr,
        previous: prev,
        difference: diff,
        percentageChange: pct,
        status,
      };
    });

    categoryChanges.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          currentPeriod: { amount: currentAmount },
          previousPeriod: { amount: previousAmount },
          difference,
          percentageChange,
          overallTrend,
          categoryChanges,
        },
        'Spending trend detection calculated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getMonthlySummary,
  getAnalyticsTrends,
  getPaymentMethodAnalytics,
  getSpendingTrendDetection,
};
