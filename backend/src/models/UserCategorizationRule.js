const mongoose = require('mongoose');

const userCategorizationRuleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    keyword: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userCategorizationRuleSchema.index({ user: 1, keyword: 1 }, { unique: true });

module.exports = mongoose.model('UserCategorizationRule', userCategorizationRuleSchema);
