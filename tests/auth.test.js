const request = require('supertest');
const app = require('../app'); // app.js faylingizni import qilish

describe('Auth API', () => {
  it('should login admin user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Tizimga kirdingiz!');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@example.com',
        password: 'WrongPassword'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Parol noto‘g‘ri');
  });
});