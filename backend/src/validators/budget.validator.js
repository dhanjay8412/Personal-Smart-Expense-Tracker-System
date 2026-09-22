const { z } = require('zod');

const createBudgetSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category is required' }).min(1),
    amount: z.number({ required_error: 'Amount is required' }).min(1, 'Amount must be at least 1'),
    month: z.number({ required_error: 'Month is required' }).min(1).max(12),
    year: z.number({ required_error: 'Year is required' }).min(2000).max(2100),
  }),
});

const updateBudgetSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Amount must be at least 1').optional(),
    month: z.number().min(1).max(12).optional(),
    year: z.number().min(2000).max(2100).optional(),
  }),
});

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
};
