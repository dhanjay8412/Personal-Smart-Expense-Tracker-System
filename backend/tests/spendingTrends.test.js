const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

describe('Spending Trends Detection API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: 'trendtest@example.com' });
    const user = await User.create({
      name: 'Trend Tester',
      email: 'trendtest@example.com',
      password: 'Password123!',
    });
    userId = user._id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'trendtest@example.com',
      password: 'Password123!',
    });
    token = res.body.data.token;

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // Current month expense
    await Transaction.create({
      user: userId,
      amount: 5500,
      type: 'Expense',
      category: 'Food',
      description: 'Current month food',
      date: new Date(curYear, curMonth, 10),
    });

    // Previous month expense
    await Transaction.create({
      user: userId,
      amount: 4000,
      type: 'Expense',
      category: 'Food',
      description: 'Previous month food',
      date: new Date(curYear, curMonth - 1, 10),
    });
  });

  afterAll(async () => {
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    await mongoose.connection.close();
  });

  it('should detect spending difference and category level changes', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/spending-trends')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('difference');
    expect(res.body.data.difference).toBe(1500); // 5500 - 4000
    expect(res.body.data.overallTrend).toBe('Increasing');
    expect(res.body.data.categoryChanges.length).toBeGreaterThan(0);
  });
});
