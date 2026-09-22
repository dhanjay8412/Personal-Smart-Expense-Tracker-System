const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).min(1, 'Category name is required').max(50),
    type: z.enum(['Income', 'Expense']).optional().default('Expense'),
    icon: z.string().optional().default('Tag'),
  }),
});

module.exports = {
  createCategorySchema,
};
