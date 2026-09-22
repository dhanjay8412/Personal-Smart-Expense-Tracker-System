const { z } = require('zod');

const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: 'Amount is required' }).gt(0, 'Amount must be greater than 0'),
    type: z.enum(['Income', 'Expense'], { required_error: 'Type is required' }),
    category: z.string({ required_error: 'Category is required' }).min(1, 'Category is required'),
    description: z.string({ required_error: 'Description is required' }).min(1, 'Description is required').max(200),
    date: z.string().optional().or(z.date().optional()),
    paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other']).optional(),
    notes: z.string().max(500).optional(),
  }),
});

const updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().gt(0, 'Amount must be greater than 0').optional(),
    type: z.enum(['Income', 'Expense']).optional(),
    category: z.string().min(1).optional(),
    description: z.string().min(1).max(200).optional(),
    date: z.string().optional().or(z.date().optional()),
    paymentMethod: z.enum(['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other']).optional(),
    notes: z.string().max(500).optional(),
  }),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
};
