const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Settlement amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

settlementSchema.index({ groupId: 1, date: -1 });

module.exports = mongoose.model('Settlement', settlementSchema);
