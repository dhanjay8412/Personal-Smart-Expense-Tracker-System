const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shareAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
});

const sharedExpenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Other',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    splitMethod: {
      type: String,
      enum: ['equal', 'custom', 'percentage'],
      default: 'equal',
    },
    participants: [participantSchema],
  },
  {
    timestamps: true,
  }
);

sharedExpenseSchema.index({ groupId: 1, date: -1 });

module.exports = mongoose.model('SharedExpense', sharedExpenseSchema);
