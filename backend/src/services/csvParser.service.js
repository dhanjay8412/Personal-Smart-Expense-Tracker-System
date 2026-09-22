const Transaction = require('../models/Transaction');
const { suggestCategory } = require('./smartCategorization.service');

/**
 * Split CSV line respecting quoted fields containing commas
 */
const splitCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

/**
 * Standardize column header aliases to canonical key names
 */
const getCanonicalHeader = (header) => {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (['date', 'txdate', 'transactiondate', 'datetime'].includes(h)) return 'date';
  if (['description', 'details', 'title', 'name', 'merchant', 'payee', 'narration', 'memo'].includes(h)) return 'description';
  if (['amount', 'sum', 'price', 'value', 'cost', 'txamount', 'netamount'].includes(h)) return 'amount';
  if (['type', 'txtype', 'transactiontype', 'expensetype', 'kind'].includes(h)) return 'type';
  if (['category', 'cat', 'categoryname'].includes(h)) return 'category';
  if (['paymentmethod', 'paymentmode', 'method', 'mode', 'paymethod'].includes(h)) return 'paymentMethod';
  if (['notes', 'note', 'remark', 'remarks'].includes(h)) return 'notes';
  return h;
};

/**
 * Parse CSV text string into normalized records
 */
const parseCsvString = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('CSV file content is empty or invalid.');
  }

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.');
  }

  const rawHeaders = splitCsvLine(lines[0]);
  const headers = rawHeaders.map(getCanonicalHeader);

  // Check required headers
  const required = ['date', 'description', 'amount'];
  const missing = required.filter((req) => !headers.includes(req));
  if (missing.length > 0) {
    throw new Error(`Missing required CSV column headers: ${missing.join(', ')}. Found headers: [${rawHeaders.join(', ')}]`);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length < 2 || (values.length === 1 && !values[0])) continue;

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rowObj._rowNumber = i + 1;
    rows.push(rowObj);
  }

  return rows;
};

/**
 * Robust date parsing
 */
const parseFlexibleDate = (dateStr) => {
  if (!dateStr) return new Date();

  const str = dateStr.trim();

  // Handle DD/MM/YYYY or DD-MM-YYYY format
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Validates parsed CSV rows & detects duplicates
 */
const processCsvRows = async (userId, rows) => {
  const validRows = [];
  const invalidRows = [];
  const duplicateRows = [];

  for (const row of rows) {
    const rowErrors = [];

    // 1. Amount (Strip currency symbols and commas)
    const cleanAmountStr = String(row.amount || '').replace(/[^0-9.-]/g, '');
    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount) || amount <= 0) {
      rowErrors.push(`Invalid amount value "${row.amount}"`);
    }

    // 2. Type (Default to Expense if missing)
    let type = (row.type || 'Expense').trim();
    const typeLower = type.toLowerCase();
    if (['expense', 'debit', 'out', 'withdrawal'].includes(typeLower)) {
      type = 'Expense';
    } else if (['income', 'credit', 'in', 'deposit', 'salary'].includes(typeLower)) {
      type = 'Income';
    } else if (!row.type) {
      type = 'Expense';
    } else {
      rowErrors.push(`Invalid transaction type "${row.type}". Must be Income or Expense`);
    }

    // 3. Date
    const d = parseFlexibleDate(row.date);
    if (!d) {
      rowErrors.push(`Invalid date format "${row.date}"`);
    }

    // 4. Description
    const description = (row.description || '').trim();
    if (!description) {
      rowErrors.push('Description is required');
    }

    if (rowErrors.length > 0) {
      invalidRows.push({
        rowNumber: row._rowNumber,
        data: row,
        errors: rowErrors,
      });
      continue;
    }

    // Category fallback via AI smart suggestion
    let category = (row.category || '').trim();
    if (!category) {
      if (type === 'Expense') {
        const suggestion = await suggestCategory(userId, description);
        category = suggestion.category || 'Other';
      } else {
        category = 'Salary';
      }
    }

    // Payment Method mapping
    let paymentMethod = (row.paymentMethod || 'Other').trim();
    const pmLower = paymentMethod.toLowerCase();
    if (pmLower.includes('upi') || pmLower.includes('gpay') || pmLower.includes('phonepe') || pmLower.includes('paytm')) {
      paymentMethod = 'UPI';
    } else if (pmLower.includes('cash')) {
      paymentMethod = 'Cash';
    } else if (pmLower.includes('credit')) {
      paymentMethod = 'Credit Card';
    } else if (pmLower.includes('debit')) {
      paymentMethod = 'Debit Card';
    } else if (pmLower.includes('bank') || pmLower.includes('transfer') || pmLower.includes('neft') || pmLower.includes('imps')) {
      paymentMethod = 'Bank Transfer';
    } else {
      paymentMethod = 'Other';
    }

    const candidate = {
      rowNumber: row._rowNumber,
      amount,
      type,
      category,
      description,
      date: d.toISOString(),
      paymentMethod,
      notes: row.notes || 'Imported via CSV',
    };

    // Duplicate Detection Check in Database
    const existing = await Transaction.findOne({
      user: userId,
      type: candidate.type,
      amount: candidate.amount,
      description: candidate.description,
      date: {
        $gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        $lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999),
      },
    });

    if (existing) {
      duplicateRows.push({ ...candidate, isDuplicate: true });
    } else {
      validRows.push(candidate);
    }
  }

  return {
    validRows,
    invalidRows,
    duplicateRows,
    total: rows.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    duplicateCount: duplicateRows.length,
  };
};

module.exports = {
  splitCsvLine,
  getCanonicalHeader,
  parseCsvString,
  processCsvRows,
};
