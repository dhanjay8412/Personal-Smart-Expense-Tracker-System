const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');
const Category = require('../src/models/Category');
const Budget = require('../src/models/Budget');
const Notification = require('../src/models/Notification');
const RecurringTransaction = require('../src/models/RecurringTransaction');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Category.deleteMany({}),
      Budget.deleteMany({}),
      Notification.deleteMany({}),
      RecurringTransaction.deleteMany({}),
    ]);

    console.log('[Seed] Database wiped clean.');

    // 1. Create Demo User
    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo@example.com',
      password: 'Password123!',
      currency: 'INR',
      monthlyIncome: 85000,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });
    console.log(`[Seed] Created Demo User: ${demoUser.email} (Password: Password123!)`);

    // 2. Custom Categories for Demo User
    const customCats = await Category.create([
      { name: 'Gym & Fitness', type: 'Expense', icon: 'Dumbbell', user: demoUser._id },
      { name: 'Side Hustle', type: 'Income', icon: 'Sparkles', user: demoUser._id },
    ]);

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1; // 1-indexed

    // 3. Budgets for Current Month
    await Budget.create([
      { user: demoUser._id, category: 'Food', amount: 12000, month: curMonth, year: curYear },
      { user: demoUser._id, category: 'Shopping', amount: 15000, month: curMonth, year: curYear },
      { user: demoUser._id, category: 'Transportation', amount: 6000, month: curMonth, year: curYear },
      { user: demoUser._id, category: 'Entertainment', amount: 5000, month: curMonth, year: curYear },
      { user: demoUser._id, category: 'Rent', amount: 25000, month: curMonth, year: curYear },
      { user: demoUser._id, category: 'Gym & Fitness', amount: 3000, month: curMonth, year: curYear },
    ]);
    console.log('[Seed] Created budgets.');

    // 4. Multi-month Transactions Generation
    const transactions = [];

    // Helper to push transaction
    const addTx = (amount, type, category, description, daysAgo, paymentMethod = 'UPI', notes = '') => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      transactions.push({
        user: demoUser._id,
        amount,
        type,
        category,
        description,
        date: d,
        paymentMethod,
        notes,
      });
    };

    // Income items
    addTx(85000, 'Income', 'Salary', 'Monthly Tech Corp Salary', 1, 'Bank Transfer', 'Direct payroll deposit');
    addTx(85000, 'Income', 'Salary', 'Monthly Tech Corp Salary', 31, 'Bank Transfer', 'Direct payroll deposit');
    addTx(85000, 'Income', 'Salary', 'Monthly Tech Corp Salary', 61, 'Bank Transfer', 'Direct payroll deposit');
    addTx(12500, 'Income', 'Freelance', 'UI/UX Design Client Work', 5, 'UPI', 'Web design contract');
    addTx(8000, 'Income', 'Side Hustle', 'Consulting Session', 14, 'Bank Transfer');
    addTx(4500, 'Income', 'Investments', 'Dividend Pay Out', 20, 'Bank Transfer');

    // Expense items (Recent & past months)
    addTx(25000, 'Expense', 'Rent', 'Monthly Apartment Rent', 2, 'Bank Transfer');
    addTx(25000, 'Expense', 'Rent', 'Monthly Apartment Rent', 32, 'Bank Transfer');
    addTx(4200, 'Expense', 'Food', 'Grocery Shopping at Supermarket', 3, 'Credit Card', 'Weekly stockup');
    addTx(650, 'Expense', 'Food', 'Dinner with Friends', 4, 'UPI', 'Italian restaurant');
    addTx(350, 'Expense', 'Food', 'Morning Artisan Coffee', 1, 'UPI');
    addTx(8900, 'Expense', 'Shopping', 'New Running Shoes & Activewear', 6, 'Credit Card');
    addTx(1200, 'Expense', 'Transportation', 'Fuel Refill', 7, 'Debit Card');
    addTx(2200, 'Expense', 'Bills', 'Electricity & Water Bill', 8, 'UPI');
    addTx(999, 'Expense', 'Subscriptions', 'Netflix Premium Monthly', 9, 'Credit Card');
    addTx(149, 'Expense', 'Subscriptions', 'Spotify Family Plan', 10, 'UPI');
    addTx(2500, 'Expense', 'Gym & Fitness', 'Annual Gym Membership Renewal', 12, 'UPI');
    addTx(3400, 'Expense', 'Entertainment', 'Movie Night IMAX Tickets & Snacks', 15, 'UPI');
    addTx(1500, 'Expense', 'Healthcare', 'Dental Checkup & Cleaning', 18, 'Cash');
    addTx(5200, 'Expense', 'Food', 'Organic Grocery Restock', 22, 'Credit Card');
    addTx(4800, 'Expense', 'Shopping', 'Tech Accessories & Cables', 25, 'UPI');
    addTx(1800, 'Expense', 'Transportation', 'Weekly Cab Commute', 28, 'UPI');

    await Transaction.insertMany(transactions);
    console.log(`[Seed] Inserted ${transactions.length} transactions.`);

    // 5. Notifications
    await Notification.create([
      {
        user: demoUser._id,
        title: '⚠ Budget Warning: Food',
        message: 'You have spent 85% of your monthly Food budget (10,400 / 12,000).',
        type: 'warning',
        isRead: false,
      },
      {
        user: demoUser._id,
        title: '🔄 Recurring Expense Processed',
        message: 'Monthly subscription of 999 for "Netflix Premium" recorded.',
        type: 'info',
        isRead: true,
      },
      {
        user: demoUser._id,
        title: '🎉 Welcome to Smart Expense Tracker!',
        message: 'Start tracking your financial freedom by setting custom category budgets.',
        type: 'success',
        isRead: true,
      },
    ]);
    console.log('[Seed] Created notifications.');

    // 6. Recurring Transactions
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await RecurringTransaction.create([
      {
        user: demoUser._id,
        name: 'Apartment Rent',
        amount: 25000,
        type: 'Expense',
        category: 'Rent',
        paymentMethod: 'Bank Transfer',
        frequency: 'Monthly',
        startDate: new Date(),
        nextExecutionDate: nextMonth,
      },
      {
        user: demoUser._id,
        name: 'Netflix Premium Subscription',
        amount: 999,
        type: 'Expense',
        category: 'Subscriptions',
        paymentMethod: 'Credit Card',
        frequency: 'Monthly',
        startDate: new Date(),
        nextExecutionDate: nextMonth,
      },
    ]);
    console.log('[Seed] Created recurring transactions.');

    console.log('\n========================================');
    console.log(' SEED COMPLETED SUCCESSFULLY!');
    console.log(' Login Credentials:');
    console.log(' Email:    demo@example.com');
    console.log(' Password: Password123!');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedData();
