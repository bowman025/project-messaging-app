import { describe, it, expect } from 'vitest';
import { AppError } from '../../utils/AppError.js';

describe('AppError', () => {
  it('creates an error with the correct message and status code', () => {
    const error = new AppError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('AppError');
  });

  it('is an instance of Error', () => {
    const error = new AppError('Forbidden', 403);
    expect(error).toBeInstanceOf(Error);
  });

  it('handles different status codes correctly', () => {
    expect(new AppError('Bad request', 400).statusCode).toBe(400);
    expect(new AppError('Unauthorized', 401).statusCode).toBe(401);
    expect(new AppError('Internal server error', 500).statusCode).toBe(500);
  });
});
