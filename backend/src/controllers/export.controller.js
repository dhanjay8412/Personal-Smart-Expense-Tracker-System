const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const ApiError = require('../utils/apiError');

const exportCSV = async (req, res, next) => {
  try {
    const { type, category, paymentMethod, startDate, endDate, search } = req.query;

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
      ];
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    const fields = [
      { label: 'Date', value: (row) => new Date(row.date).toISOString().split('T')[0] },
      { label: 'Type', value: 'type' },
      { label: 'Category', value: 'category' },
      { label: 'Amount', value: 'amount' },
      { label: 'Payment Method', value: 'paymentMethod' },
      { label: 'Description', value: 'description' },
      { label: 'Notes', value: 'notes' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const { type, category, paymentMethod, startDate, endDate, search } = req.query;

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
      ];
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.pdf`);

    doc.pipe(res);

    // Title & Header
    doc.fontSize(20).fillColor('#0284c7').text('Personal Smart Expense Tracker', { align: 'center' });
    doc.fontSize(12).fillColor('#475569').text(`Transaction Statement - User: ${req.user.name} (${req.user.email})`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(10).fillColor('#000000').text(`Generated on: ${new Date().toLocaleString()}`);
    doc.text(`Total Records: ${transactions.length}`);
    doc.moveDown(1);

    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Date          Type       Category        Amount      Payment Method  Description', { underline: true });
    doc.font('Helvetica');
    doc.moveDown(0.5);

    transactions.forEach((tx) => {
      const dateStr = new Date(tx.date).toISOString().split('T')[0];
      const typeStr = tx.type.padEnd(8);
      const catStr = (tx.category || '').substring(0, 12).padEnd(14);
      const amtStr = `${tx.amount}`.padEnd(10);
      const methodStr = (tx.paymentMethod || '').padEnd(14);
      const descStr = (tx.description || '').substring(0, 20);

      doc.fontSize(9).text(`${dateStr}  ${typeStr} ${catStr} ${amtStr} ${methodStr} ${descStr}`);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportCSV,
  exportPDF,
};
