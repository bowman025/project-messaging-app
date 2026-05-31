import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '@project-messaging-app/zod-schemas/user';
import { sendMessageSchema } from '@project-messaging-app/zod-schemas/message';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      username: 'testuser',
      email: 'notanemail',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects username that is too short', () => {
    const result = registerSchema.safeParse({
      username: 'ab',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects username with invalid characters', () => {
    const result = registerSchema.safeParse({
      username: 'test user!',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'notanemail',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('sendMessageSchema', () => {
  it('accepts valid message with content', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: 'clh1234567890abcdefghijk',
      content: 'Hello!',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid message with imageUrl only', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: 'clh1234567890abcdefghijk',
      imageUrl: 'https://res.cloudinary.com/test/image/upload/test.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects message with neither content nor imageUrl', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: 'clh1234567890abcdefghijk',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message with content exceeding 2000 characters', () => {
    const result = sendMessageSchema.safeParse({
      conversationId: 'clh1234567890abcdefghijk',
      content: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
