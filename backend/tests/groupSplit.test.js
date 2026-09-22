const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Group = require('../src/models/Group');
const SharedExpense = require('../src/models/SharedExpense');

describe('Shared Expenses & Group Splitting API', () => {
  let token1, token2;
  let user1, user2;
  let groupId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_expense_tracker_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: { $in: ['group1@example.com', 'group2@example.com'] } });
    user1 = await User.create({ name: 'Group User 1', email: 'group1@example.com', password: 'Password123!' });
    user2 = await User.create({ name: 'Group User 2', email: 'group2@example.com', password: 'Password123!' });

    const res1 = await request(app).post('/api/v1/auth/login').send({ email: 'group1@example.com', password: 'Password123!' });
    token1 = res1.body.data.token;

    const res2 = await request(app).post('/api/v1/auth/login').send({ email: 'group2@example.com', password: 'Password123!' });
    token2 = res2.body.data.token;
  });

  afterAll(async () => {
    if (groupId) {
      await Group.findByIdAndDelete(groupId);
      await SharedExpense.deleteMany({ groupId });
    }
    await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
    await mongoose.connection.close();
  });

  it('should create a new group', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Goa Trip 2026', description: 'Vacation expenses' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Goa Trip 2026');
    groupId = res.body.data._id;
  });

  it('should add a member by email', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ email: 'group2@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create an equal split shared expense', async () => {
    const res = await request(app)
      .post(`/api/v1/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        amount: 3000,
        description: 'Hotel Resort Stay',
        category: 'Travel',
        splitMethod: 'equal',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.participants.length).toBe(2);
    expect(res.body.data.participants[0].shareAmount).toBe(1500);
  });

  it('should calculate correct net group balances', async () => {
    const res = await request(app)
      .get(`/api/v1/groups/${groupId}/balances`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balances.length).toBe(2);
  });

  it('should deny unauthorized user non-member access', async () => {
    // Create non-member user 3
    const user3 = await User.create({ name: 'Stranger', email: 'stranger@example.com', password: 'Password123!' });
    const res3 = await request(app).post('/api/v1/auth/login').send({ email: 'stranger@example.com', password: 'Password123!' });
    const token3 = res3.body.data.token;

    const res = await request(app)
      .get(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${token3}`);

    expect(res.statusCode).toBe(403);
    await User.findByIdAndDelete(user3._id);
  });
});
