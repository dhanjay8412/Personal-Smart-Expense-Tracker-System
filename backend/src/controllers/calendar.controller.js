const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/apiResponse');

const getCalendarSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const dailyAgg = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const dateMap = {};

    dailyAgg.forEach((item) => {
      const dateKey = item._id.dateStr;
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          income: 0,
          expense: 0,
          transactionCount: 0,
        };
      }
      if (item._id.type === 'Income') {
        dateMap[dateKey].income += item.total;
      }
      if (item._id.type === 'Expense') {
        dateMap[dateKey].expense += item.total;
      }
      dateMap[dateKey].transactionCount += item.count;
    });

    const calendarData = Object.values(dateMap);

    return res.status(200).json(
      new ApiResponse(200, calendarData, `Calendar data for ${month}/${year} retrieved`)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCalendarSummary,
};
