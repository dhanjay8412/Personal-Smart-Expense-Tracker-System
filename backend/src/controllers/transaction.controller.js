const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { checkBudgetAlerts } = require('../services/budgetAlert.service');

const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { type, category, paymentMethod, startDate, endDate, search, sortBy, sortOrder } = req.query;

    // Strict user scoping
    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort order
    const sortField = sortBy || 'date';
    const order = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: order };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json(
      new ApiResponse(200, transactions, 'Transactions fetched successfully', {
        page,
        limit,
        total,
        totalPages,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return next(new ApiError(404, 'Transaction not found or unauthorized'));
    }
    return res.status(200).json(new ApiResponse(200, transaction, 'Transaction details retrieved'));
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, description, date, paymentMethod, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Cash',
      notes: notes || '',
    });

    if (type === 'Expense') {
      // Async budget threshold check
      checkBudgetAlerts(req.user._id, category, transaction.date);
    }

    return res.status(201).json(new ApiResponse(201, transaction, 'Transaction created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id });
    if (!transaction) {
      return next(new ApiError(404, 'Transaction not found or unauthorized'));
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      if (key === 'date' && updates.date) {
        transaction.date = new Date(updates.date);
      } else {
        transaction[key] = updates[key];
      }
    });

    await transaction.save();

    if (transaction.type === 'Expense') {
      checkBudgetAlerts(req.user._id, transaction.category, transaction.date);
    }

    return res.status(200).json(new ApiResponse(200, transaction, 'Transaction updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });

    if (!transaction) {
      return next(new ApiError(404, 'Transaction not found or unauthorized'));
    }

    if (transaction.type === 'Expense') {
      checkBudgetAlerts(req.user._id, transaction.category, transaction.date);
    }

    return res.status(200).json(new ApiResponse(200, null, 'Transaction deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const importTransactionsPreview = async (req, res, next) => {
  try {
    const { csvText } = req.body;
    if (!csvText) {
      return next(new ApiError(400, 'CSV content text is required'));
    }

    const { parseCsvString, processCsvRows } = require('../services/csvParser.service');
    const parsedRows = parseCsvString(csvText);
    const summary = await processCsvRows(req.user._id, parsedRows);

    return res.status(200).json(new ApiResponse(200, summary, 'CSV parsed and validated for preview'));
  } catch (error) {
    next(error);
  }
};

const confirmImport = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return next(new ApiError(400, 'No valid transactions provided for import'));
    }

    const docsToInsert = transactions.map((t) => ({
      user: req.user._id,
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description,
      date: new Date(t.date),
      paymentMethod: t.paymentMethod || 'Other',
      notes: t.notes || 'Imported via CSV',
    }));

    const inserted = await Transaction.insertMany(docsToInsert);

    return res.status(201).json(
      new ApiResponse(201, { count: inserted.length }, `Successfully imported ${inserted.length} transactions`)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactionsPreview,
  confirmImport,
};
