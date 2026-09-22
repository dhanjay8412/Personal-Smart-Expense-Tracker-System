const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget amount must be at least 1'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user has only one budget per category per month & year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });
budgetSchema.index({ user: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
