const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

describe('Transaction API Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: 'txtest@example.com' });
    const user = await User.create({
      name: 'Tx Tester',
      email: 'txtest@example.com',
      password: 'Password123!',
    });

    userId = user._id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'txtest@example.com',
      password: 'Password123!',
    });

    token = res.body.data.token;
  });

  afterAll(async () => {
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    await mongoose.connection.close();
  });

  it('should create a new expense transaction', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 500,
        type: 'Expense',
        category: 'Food',
        description: 'Lunch with team',
        paymentMethod: 'UPI',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(500);
    expect(res.body.data.description).toBe('Lunch with team');
  });

  it('should fetch user transactions with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/transactions?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should prevent access without auth token', async () => {
    const res = await request(app).get('/api/v1/transactions');
    expect(res.statusCode).toBe(401);
  });
});
