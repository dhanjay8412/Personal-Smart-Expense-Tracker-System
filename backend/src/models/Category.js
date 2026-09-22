const mongoose = require('mongoose');

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'Expense', icon: 'Utensils' },
  { name: 'Transportation', type: 'Expense', icon: 'Car' },
  { name: 'Shopping', type: 'Expense', icon: 'ShoppingBag' },
  { name: 'Entertainment', type: 'Expense', icon: 'Film' },
  { name: 'Bills', type: 'Expense', icon: 'FileText' },
  { name: 'Healthcare', type: 'Expense', icon: 'Activity' },
  { name: 'Education', type: 'Expense', icon: 'BookOpen' },
  { name: 'Travel', type: 'Expense', icon: 'Plane' },
  { name: 'Rent', type: 'Expense', icon: 'Home' },
  { name: 'Subscriptions', type: 'Expense', icon: 'CreditCard' },
  { name: 'Salary', type: 'Income', icon: 'Briefcase' },
  { name: 'Freelance', type: 'Income', icon: 'Laptop' },
  { name: 'Investments', type: 'Income', icon: 'TrendingUp' },
  { name: 'Other', type: 'Expense', icon: 'Tag' },
];

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      default: 'Expense',
    },
    icon: {
      type: String,
      default: 'Tag',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null indicates a global default category
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category names for the same user
categorySchema.index({ user: 1, name: 1 }, { unique: true, partialFilterExpression: { user: { $ne: null } } });

module.exports = mongoose.model('Category', categorySchema);
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
