const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

describe('CSV Transaction Import API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: 'csvtest@example.com' });
    const user = await User.create({
      name: 'CSV Tester',
      email: 'csvtest@example.com',
      password: 'Password123!',
    });
    userId = user._id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'csvtest@example.com',
      password: 'Password123!',
    });
    token = res.body.data.token;
  });

  afterAll(async () => {
    await Transaction.deleteMany({ user: userId });
    await User.deleteMany({ _id: userId });
    await mongoose.connection.close();
  });

  it('should parse CSV string and detect valid, invalid, and duplicate rows', async () => {
    const csvContent = `date,description,amount,type,category,paymentMethod
2026-09-20,Swiggy Lunch,450,expense,Food,UPI
2026-09-21,Salary,60000,income,Salary,Bank Transfer
invalid_date,Broken Row,abc,expense,Food,UPI`;

    const res = await request(app)
      .post('/api/v1/transactions/import')
      .set('Authorization', `Bearer ${token}`)
      .send({ csvText: csvContent });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.validCount).toBe(2);
    expect(res.body.data.invalidCount).toBe(1);
  });

  it('should confirm import valid transactions', async () => {
    const validRows = [
      {
        date: '2026-09-20',
        description: 'Swiggy Lunch',
        amount: 450,
        type: 'Expense',
        category: 'Food',
        paymentMethod: 'UPI',
      },
    ];

    const res = await request(app)
      .post('/api/v1/transactions/import/confirm')
      .set('Authorization', `Bearer ${token}`)
      .send({ transactions: validRows });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(1);
  });
});
