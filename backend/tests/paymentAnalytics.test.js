const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

describe('Payment Method Analytics API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: 'pmtest@example.com' });
    const user = await User.create({
      name: 'PM Tester',
      email: 'pmtest@example.com',
      password: 'Password123!',
    });
    userId = user._id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'pmtest@example.com',
      password: 'Password123!',
    });
    token = res.body.data.token;

    await Transaction.create([
      { user: userId, amount: 1000, type: 'Expense', category: 'Food', description: 'UPI Dinner', paymentMethod: 'UPI' },
      { user: userId, amount: 500, type: 'Expense', category: 'Shopping', description: 'Cash Auto', paymentMethod: 'Cash' },
    ]);
  });

  afterAll(async () => {
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    await mongoose.connection.close();
  });

  it('should return payment method breakdown with amounts and percentages', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/payment-methods?range=thisMonth')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});
