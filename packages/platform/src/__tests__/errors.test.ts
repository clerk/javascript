import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ClerkPlatformError,
  ConflictError,
  createErrorFromResponse,
  NotFoundError,
  TimeoutError,
  UnprocessableEntityError,
} from '../errors';

describe('Error classes', () => {
  describe('ClerkPlatformError', () => {
    it('should create error with all properties', () => {
      const errors = [{ message: 'Test error', long_message: 'A test error', code: 'test_error' }];
      const error = new ClerkPlatformError('Test message', 400, errors, 'trace_123', { key: 'value' });

      expect(error.message).toBe('Test message');
      expect(error.status).toBe(400);
      expect(error.errors).toEqual(errors);
      expect(error.clerkTraceId).toBe('trace_123');
      expect(error.meta).toEqual({ key: 'value' });
      expect(error.name).toBe('ClerkPlatformError');
    });

    it('should create error with minimal properties', () => {
      const error = new ClerkPlatformError('Test', 500);

      expect(error.message).toBe('Test');
      expect(error.status).toBe(500);
      expect(error.errors).toEqual([]);
      expect(error.clerkTraceId).toBeUndefined();
      expect(error.meta).toBeUndefined();
    });
  });

  describe('BadRequestError', () => {
    it('should create error with correct status', () => {
      const error = new BadRequestError();
      expect(error.status).toBe(400);
      expect(error.name).toBe('BadRequestError');
      expect(error.message).toBe('Bad request');
    });

    it('should use error message if provided', () => {
      const error = new BadRequestError([{ message: 'Invalid input', long_message: '', code: '' }]);
      expect(error.message).toBe('Invalid input');
    });
  });

  describe('AuthenticationError', () => {
    it('should create error with correct status', () => {
      const error = new AuthenticationError();
      expect(error.status).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('AuthorizationError', () => {
    it('should create error with correct status', () => {
      const error = new AuthorizationError();
      expect(error.status).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create error with correct status', () => {
      const error = new NotFoundError();
      expect(error.status).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ConflictError', () => {
    it('should create error with correct status', () => {
      const error = new ConflictError();
      expect(error.status).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('UnprocessableEntityError', () => {
    it('should create error with correct status', () => {
      const error = new UnprocessableEntityError();
      expect(error.status).toBe(422);
      expect(error.name).toBe('UnprocessableEntityError');
    });
  });

  describe('TimeoutError', () => {
    it('should create error with timeout', () => {
      const error = new TimeoutError(5000);
      expect(error.timeout).toBe(5000);
      expect(error.message).toBe('Request timed out after 5000ms');
      expect(error.name).toBe('TimeoutError');
    });
  });
});

describe('createErrorFromResponse', () => {
  const createMockResponse = (status: number, body: unknown): Response => {
    return {
      status,
      statusText: 'Error',
      text: () => Promise.resolve(JSON.stringify(body)),
    } as Response;
  };

  it('should create BadRequestError for 400', async () => {
    const response = createMockResponse(400, {
      errors: [{ message: 'Bad', long_message: '', code: '' }],
    });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(BadRequestError);
  });

  it('should create AuthenticationError for 401', async () => {
    const response = createMockResponse(401, { errors: [] });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(AuthenticationError);
  });

  it('should create AuthorizationError for 403', async () => {
    const response = createMockResponse(403, { errors: [] });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(AuthorizationError);
  });

  it('should create NotFoundError for 404', async () => {
    const response = createMockResponse(404, { errors: [] });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('should create ConflictError for 409', async () => {
    const response = createMockResponse(409, { errors: [] });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(ConflictError);
  });

  it('should create UnprocessableEntityError for 422', async () => {
    const response = createMockResponse(422, { errors: [] });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(UnprocessableEntityError);
  });

  it('should create generic ClerkPlatformError for other statuses', async () => {
    const response = createMockResponse(500, { errors: [] });
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(ClerkPlatformError);
    expect(error).not.toBeInstanceOf(BadRequestError);
  });

  it('should handle clerk_trace_id', async () => {
    const response = createMockResponse(400, {
      errors: [],
      clerk_trace_id: 'trace_abc',
    });
    const error = await createErrorFromResponse(response);
    expect(error.clerkTraceId).toBe('trace_abc');
  });

  it('should handle invalid JSON in response', async () => {
    const response = {
      status: 500,
      statusText: 'Error',
      text: () => Promise.resolve('not json'),
    } as Response;
    const error = await createErrorFromResponse(response);
    expect(error).toBeInstanceOf(ClerkPlatformError);
  });
});
