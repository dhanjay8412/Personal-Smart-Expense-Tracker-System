const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year }).sort({ category: 1 });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate expenses by category for this month
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'Expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = {};
    expenseAgg.forEach((item) => {
      spentMap[item._id] = item.totalSpent;
    });

    const budgetsWithMetrics = budgets.map((b) => {
      const spent = spentMap[b.category] || 0;
      const remaining = b.amount - spent;
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      let status = 'normal';
      if (spent > b.amount) {
        status = 'exceeded';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        ...b.toObject(),
        spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        status,
      };
    });

    return res.status(200).json(
      new ApiResponse(200, budgetsWithMetrics, `Budgets for ${month}/${year} retrieved successfully`)
    );
  } catch (error) {
    next(error);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    // Check if budget already exists for this category/month/year
    const existing = await Budget.findOne({
      user: req.user._id,
      category,
      month,
      year,
    });

    if (existing) {
      existing.amount = amount;
      await existing.save();
      return res.status(200).json(new ApiResponse(200, existing, 'Budget updated successfully'));
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      month,
      year,
    });

    return res.status(201).json(new ApiResponse(201, budget, 'Budget created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, month, year } = req.body;

    const budget = await Budget.findOne({ _id: id, user: req.user._id });
    if (!budget) {
      return next(new ApiError(404, 'Budget not found or unauthorized'));
    }

    if (amount !== undefined) budget.amount = amount;
    if (month !== undefined) budget.month = month;
    if (year !== undefined) budget.year = year;

    await budget.save();

    return res.status(200).json(new ApiResponse(200, budget, 'Budget updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findOneAndDelete({ _id: id, user: req.user._id });

    if (!budget) {
      return next(new ApiError(404, 'Budget not found or unauthorized'));
    }

    return res.status(200).json(new ApiResponse(200, null, 'Budget deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
