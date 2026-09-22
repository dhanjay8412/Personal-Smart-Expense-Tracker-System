const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { checkBudgetAlerts } = require('../services/budgetAlert.service');

const computeNextDate = (currentDate, frequency) => {
  const d = new Date(currentDate);
  switch (frequency) {
    case 'Daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'Weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'Monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'Yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
};

const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    const dueItems = await RecurringTransaction.find({
      isActive: true,
      nextExecutionDate: { $lte: now },
    });

    for (const item of dueItems) {
      // Check if end date passed
      if (item.endDate && new Date(item.endDate) < now) {
        item.isActive = false;
        await item.save();
        continue;
      }

      // 1. Create automatic transaction document
      const newTransaction = await Transaction.create({
        user: item.user,
        amount: item.amount,
        type: item.type,
        category: item.category,
        description: `[Recurring] ${item.name}`,
        date: new Date(),
        paymentMethod: item.paymentMethod,
        notes: `Automatically generated from recurring setup "${item.name}"`,
      });

      // 2. Create notification
      await Notification.create({
        user: item.user,
        title: `🔄 Recurring Transaction Processed`,
        message: `${item.type} of ${item.amount} for "${item.name}" was automatically recorded.`,
        type: 'info',
      });

      // 3. Trigger budget alert check if expense
      if (item.type === 'Expense') {
        checkBudgetAlerts(item.user, item.category, newTransaction.date);
      }

      // 4. Update nextExecutionDate
      item.nextExecutionDate = computeNextDate(item.nextExecutionDate, item.frequency);
      await item.save();
    }
  } catch (error) {
    console.error('[Recurring Job Error]', error);
  }
};

const startRecurringJob = () => {
  // Run once every day at 00:05 AM
  cron.schedule('5 0 * * *', () => {
    console.log('[Cron Job] Running daily recurring transactions check...');
    processRecurringTransactions();
  });
};

module.exports = {
  processRecurringTransactions,
  startRecurringJob,
  computeNextDate,
};
