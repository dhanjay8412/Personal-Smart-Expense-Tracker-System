const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

const checkBudgetAlerts = async (userId, category, date = new Date()) => {
  try {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    // Find active budget for this category & month/year
    const budget = await Budget.findOne({ user: userId, category, month, year });
    if (!budget) return;

    // Calculate total expenses for this category & month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseResult = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'Expense',
          category: category,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spent = expenseResult[0] ? expenseResult[0].total : 0;
    const percentage = (spent / budget.amount) * 100;

    // Check if exceeded
    if (spent > budget.amount) {
      const overAmount = spent - budget.amount;
      const title = `⚠ Budget Exceeded: ${category}`;
      const message = `You have exceeded your monthly ${category} budget of ${budget.amount} by ${overAmount.toFixed(2)}. Total spent: ${spent.toFixed(2)}.`;
      
      // Prevent spam: check if similar notification sent today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingNotif = await Notification.findOne({
        user: userId,
        title,
        createdAt: { $gte: todayStart },
      });

      if (!existingNotif) {
        await Notification.create({
          user: userId,
          title,
          message,
          type: 'danger',
        });
      }
    } else if (percentage >= 80) {
      const title = `⚠ Budget Warning: ${category}`;
      const message = `You have used ${percentage.toFixed(0)}% of your monthly ${category} budget (${spent.toFixed(2)} / ${budget.amount.toFixed(2)}).`;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const existingNotif = await Notification.findOne({
        user: userId,
        title,
        createdAt: { $gte: todayStart },
      });

      if (!existingNotif) {
        await Notification.create({
          user: userId,
          title,
          message,
          type: 'warning',
        });
      }
    }
  } catch (err) {
    console.error('[Budget Alert Check Error]', err);
  }
};

module.exports = { checkBudgetAlerts };
