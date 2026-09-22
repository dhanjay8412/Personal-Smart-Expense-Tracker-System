const RecurringTransaction = require('../models/RecurringTransaction');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { computeNextDate } = require('../jobs/recurringJob');

const getRecurringTransactions = async (req, res, next) => {
  try {
    const recurring = await RecurringTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, recurring, 'Recurring transactions fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const createRecurringTransaction = async (req, res, next) => {
  try {
    const { name, amount, type, category, paymentMethod, frequency, startDate, endDate } = req.body;

    const start = startDate ? new Date(startDate) : new Date();
    const nextExecutionDate = computeNextDate(start, frequency || 'Monthly');

    const item = await RecurringTransaction.create({
      user: req.user._id,
      name,
      amount,
      type: type || 'Expense',
      category,
      paymentMethod: paymentMethod || 'UPI',
      frequency: frequency || 'Monthly',
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
      nextExecutionDate,
      isActive: true,
    });

    return res.status(201).json(new ApiResponse(201, item, 'Recurring transaction created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateRecurringTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await RecurringTransaction.findOne({ _id: id, user: req.user._id });
    if (!item) {
      return next(new ApiError(404, 'Recurring transaction not found or unauthorized'));
    }

    const { name, amount, type, category, paymentMethod, frequency, startDate, endDate, isActive } = req.body;

    if (name !== undefined) item.name = name;
    if (amount !== undefined) item.amount = amount;
    if (type !== undefined) item.type = type;
    if (category !== undefined) item.category = category;
    if (paymentMethod !== undefined) item.paymentMethod = paymentMethod;
    if (frequency !== undefined) item.frequency = frequency;
    if (startDate !== undefined) item.startDate = new Date(startDate);
    if (endDate !== undefined) item.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) item.isActive = isActive;

    await item.save();

    return res.status(200).json(new ApiResponse(200, item, 'Recurring transaction updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteRecurringTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await RecurringTransaction.findOneAndDelete({ _id: id, user: req.user._id });
    if (!item) {
      return next(new ApiError(404, 'Recurring transaction not found or unauthorized'));
    }
    return res.status(200).json(new ApiResponse(200, null, 'Recurring transaction deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
};
