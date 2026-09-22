const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'testuser@example.com' });
    await mongoose.connection.close();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        currency: 'INR',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('testuser@example.com');
  });

  it('should fail registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User 2',
        email: 'testuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login existing user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'WrongPassword!',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
