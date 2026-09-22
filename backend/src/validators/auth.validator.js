const { z } = require('zod');

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters long'),
      email: z.string().email('Please provide a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters long'),
      confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
      currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
      monthlyIncome: z.number().min(0, 'Monthly income cannot be negative').optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    email: z.string().email('Please provide a valid email address').optional(),
    profileImage: z.string().optional(),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
    monthlyIncome: z.number().min(0, 'Monthly income cannot be negative').optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
      confirmNewPassword: z.string().min(8, 'Confirm new password is required'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'New passwords do not match',
      path: ['confirmNewPassword'],
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
