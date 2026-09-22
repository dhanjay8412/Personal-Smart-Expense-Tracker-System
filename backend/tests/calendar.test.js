const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

describe('Calendar API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: 'caltest@example.com' });
    const user = await User.create({
      name: 'Calendar Tester',
      email: 'caltest@example.com',
      password: 'Password123!',
    });
    userId = user._id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'caltest@example.com',
      password: 'Password123!',
    });
    token = res.body.data.token;

    await Transaction.create({
      user: userId,
      amount: 1500,
      type: 'Expense',
      category: 'Food',
      description: 'Test dinner',
      date: new Date(2026, 8, 20), // 20 Sep 2026
    });
  });

  afterAll(async () => {
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    await mongoose.connection.close();
  });

  it('should return aggregated daily calendar entries', async () => {
    const res = await request(app)
      .get('/api/v1/calendar?month=9&year=2026')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('expense');
  });
});
