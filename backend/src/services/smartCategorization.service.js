const UserCategorizationRule = require('../models/UserCategorizationRule');

const DEFAULT_CATEGORY_RULES = [
  {
    category: 'Food',
    keywords: ['swiggy', 'zomato', 'restaurant', 'pizza', 'food', 'cafe', 'starbucks', 'mcdonalds', 'kfc', 'burger', 'grocery', 'blinkit', 'zepto', 'instamart', 'dining', 'bakery'],
  },
  {
    category: 'Transportation',
    keywords: ['uber', 'ola', 'metro', 'bus', 'taxi', 'rapido', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'cab', 'auto'],
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'zudio', 'clothing', 'shoes', 'mall', 'apparel', 'electronics', 'fashion', 'zara', 'h&m'],
  },
  {
    category: 'Entertainment',
    keywords: ['netflix', 'spotify', 'bookmyshow', 'cinema', 'movie', 'pvr', 'gaming', 'steam', 'youtube', 'theater', 'concert'],
  },
  {
    category: 'Bills',
    keywords: ['electricity', 'water', 'gas', 'broadband', 'wifi', 'recharge', 'jio', 'airtel', 'bill', 'power', 'utility'],
  },
  {
    category: 'Healthcare',
    keywords: ['pharmacy', 'apollo', 'doctor', 'hospital', 'lab', 'clinic', 'medicine', 'medical', 'diagnostic', 'health'],
  },
  {
    category: 'Education',
    keywords: ['udemy', 'coursera', 'tuition', 'book', 'school', 'college', 'course', 'exam', 'fees', 'learning'],
  },
  {
    category: 'Travel',
    keywords: ['makemytrip', 'goibibo', 'flight', 'hotel', 'airbnb', 'train', 'irctc', 'resort', 'flight', 'booking'],
  },
  {
    category: 'Rent',
    keywords: ['rent', 'landlord', 'maintenance', 'lease', 'flat rent'],
  },
  {
    category: 'Subscriptions',
    keywords: ['prime', 'chatgpt', 'github', 'apple', 'icloud', 'software', 'saas', 'adobe'],
  },
];

/**
  * Suggests category for transaction description & amount
  */
const suggestCategory = async (userId, description = '') => {
  if (!description || !description.trim()) {
    return { category: 'Other', confidence: 0.1 };
  }

  const normalized = description.toLowerCase().trim();

  // 1. Check user-specific learned rules first
  if (userId) {
    const userRules = await UserCategorizationRule.find({ user: userId });
    for (const rule of userRules) {
      if (normalized.includes(rule.keyword)) {
        return {
          category: rule.category,
          confidence: 0.98,
          isUserRule: true,
        };
      }
    }
  }

  // 2. Check default keyword rules
  let bestMatch = null;
  let highestScore = 0;

  for (const ruleSet of DEFAULT_CATEGORY_RULES) {
    for (const kw of ruleSet.keywords) {
      if (normalized === kw) {
        // Exact match
        return { category: ruleSet.category, confidence: 0.94 };
      }
      if (normalized.includes(kw) || kw.includes(normalized)) {
        const score = kw.length / Math.max(normalized.length, 1);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = ruleSet.category;
        }
      }
    }
  }

  if (bestMatch) {
    const confidence = Number(Math.min(0.75 + highestScore * 0.2, 0.94).toFixed(2));
    return { category: bestMatch, confidence };
  }

  return { category: 'Other', confidence: 0.2 };
};

/**
  * Save user preference when user overrides a suggestion
  */
const learnUserCorrection = async (userId, description, selectedCategory) => {
  if (!userId || !description || !selectedCategory) return;
  const normalized = description.toLowerCase().trim().slice(0, 30);
  try {
    await UserCategorizationRule.findOneAndUpdate(
      { user: userId, keyword: normalized },
      { category: selectedCategory },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[Categorization Learn Error]', err);
  }
};

module.exports = {
  suggestCategory,
  learnUserCorrection,
  DEFAULT_CATEGORY_RULES,
};
