import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../testApp.js';
import { createTestUser, getAuthToken, createTestConversation } from '../helpers.js';

const app = createTestApp();

describe('GET /api/conversations', () => {
  it('returns conversations for authenticated user', async () => {
    const user = await createTestUser();
    const other = await createTestUser();
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
    const user = await createTestUser();
    const other = await createTestUser();
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: [other.id] });

    expect(res.status).toBe(201);
    expect(res.body.conversation.participants).toHaveLength(2);
  });

  it('prevents duplicate DM conversations', async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    await createTestConversation([user.id, other.id]);
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ participantIds: [other.id] });

    expect(res.status).toBe(409);
  });

  it('creates a group conversation', async () => {
    const user = await createTestUser();
    const other1 = await createTestUser();
    const other2 = await createTestUser();
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
    const user = await createTestUser();
    const other = await createTestUser();
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
    const user = await createTestUser();
    const other1 = await createTestUser();
    const other2 = await createTestUser();
    const conversation = await createTestConversation([other1.id, other2.id]);
    const token = getAuthToken(user.id);

    const res = await request(app)
      .post(`/api/conversations/${conversation.id}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello!' });

    expect(res.status).toBe(403);
  });
});
