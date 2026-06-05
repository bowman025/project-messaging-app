import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../testApp.js';
import { createTestUser, getAuthToken } from '../helpers.js';

const app = createTestApp();

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser',
      email: 'new@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('new@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email', async () => {
    await createTestUser({ email: 'existing@example.com' });

    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser',
      email: 'existing@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    expect(res.status).toBe(409);
  });

  it('rejects invalid input', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'ab',
      email: 'notanemail',
      password: 'short',
      confirmPassword: 'different',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    await createTestUser({
      email: 'login@example.com',
      password: 'Password123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    await createTestUser({ email: 'login2@example.com' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login2@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user when authenticated', async () => {
    const user = await createTestUser({ email: 'me@example.com' });
    const token = getAuthToken(user.id);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
  });
});
