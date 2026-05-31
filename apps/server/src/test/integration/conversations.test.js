import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../testApp.js';
import { createTestUser, getAuthToken, createTestConversation } from '../helpers.js';

const app = createTestApp();

describe('GET /api/conversations', () => {
  it('returns conversations for authenticated user', async () => {
    const user = await createTestUser({ email: 'user1@example.com' });
    const other = await createTestUser({ email: 'user2@example.com', username: 'user2' });
    await createTestConversation([user.id, other.id]);
    const token = getAuthToken(user.id);

    const res = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(1);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/conversations');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/conversations', () => {
  it('creates a DM conversation', async () => {
    const user = await createTestUser({ email: 'user3@example.com', username: 'user3' });
    const other = await createTestUser({ email: 'user4@example.com', username: 'user4' });
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: [other.id] });

    expect(res.status).toBe(201);
    expect(res.body.conversation.participants).toHaveLength(2);
  });

  it('prevents duplicate DM conversations', async () => {
    const user = await createTestUser({ email: 'user5@example.com', username: 'user5' });
    const other = await createTestUser({ email: 'user6@example.com', username: 'user6' });
    await createTestConversation([user.id, other.id]);
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: [other.id] });

    expect(res.status).toBe(409);
  });

  it('creates a group conversation', async () => {
    const user = await createTestUser({ email: 'user7@example.com', username: 'user7' });
    const other1 = await createTestUser({ email: 'user8@example.com', username: 'user8' });
    const other2 = await createTestUser({ email: 'user9@example.com', username: 'user9' });
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: [other1.id, other2.id], name: 'Test Group' });

    expect(res.status).toBe(201);
    expect(res.body.conversation.isGroup).toBe(true);
    expect(res.body.conversation.participants).toHaveLength(3);
  });
});

describe('POST /api/conversations/:id/messages', () => {
  it('sends a message in a conversation', async () => {
    const user = await createTestUser({ email: 'user10@example.com', username: 'user10' });
    const other = await createTestUser({ email: 'user11@example.com', username: 'user11' });
    const conversation = await createTestConversation([user.id, other.id]);
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post(`/api/conversations/${conversation.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello!' });

    expect(res.status).toBe(201);
    expect(res.body.message.content).toBe('Hello!');
    expect(res.body.message.authorId).toBe(user.id);
  });

  it('returns 403 for non-members', async () => {
    const user = await createTestUser({ email: 'user12@example.com', username: 'user12' });
    const other1 = await createTestUser({ email: 'user13@example.com', username: 'user13' });
    const other2 = await createTestUser({ email: 'user14@example.com', username: 'user14' });
    const conversation = await createTestConversation([other1.id, other2.id]);
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post(`/api/conversations/${conversation.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello!' });

    expect(res.status).toBe(403);
  });
});
