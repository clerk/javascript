import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformHttpClient } from '../client';
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ClerkPlatformError,
  ConflictError,
  NotFoundError,
  TimeoutError,
  UnprocessableEntityError,
} from '../errors';

describe('PlatformHttpClient', () => {
  const mockFetch = vi.fn();
  const defaultOptions = {
    accessToken: 'test_token',
    fetch: mockFetch,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when accessToken is missing', () => {
      expect(() => new PlatformHttpClient({ accessToken: '' })).toThrow('accessToken is required');
    });

    it('should use default baseUrl when not provided', () => {
      const client = new PlatformHttpClient(defaultOptions);
      expect(client).toBeDefined();
    });

    it('should strip trailing slash from baseUrl', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{}'),
      });

      const client = new PlatformHttpClient({
        ...defaultOptions,
        baseUrl: 'https://custom.api.com/v1/',
      });

      void client.get('/test');
      expect(mockFetch).toHaveBeenCalledWith('https://custom.api.com/v1/test', expect.any(Object));
    });
  });

  describe('request methods', () => {
    let client: PlatformHttpClient;

    beforeEach(() => {
      client = new PlatformHttpClient(defaultOptions);
    });

    it('should make GET request with correct headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"data": "test"}'),
      });

      const result = await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.clerk.com/v1/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
            Accept: 'application/json',
          }),
        }),
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"id": "123"}'),
      });

      const body = { name: 'test' };
      const result = await client.post('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.clerk.com/v1/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(body),
        }),
      );
      expect(result).toEqual({ id: '123' });
    });

    it('should make PATCH request with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"updated": true}'),
      });

      const body = { name: 'updated' };
      await client.patch('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      );
    });

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"deleted": true}'),
      });

      await client.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{}'),
      });

      await client.get('/test', { foo: 'bar', num: 123, bool: true });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('foo=bar');
      expect(calledUrl).toContain('num=123');
      expect(calledUrl).toContain('bool=true');
    });

    it('should handle array query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{}'),
      });

      await client.get('/test', { status: ['pending', 'completed'] });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('status=pending');
      expect(calledUrl).toContain('status=completed');
    });

    it('should skip undefined query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{}'),
      });

      await client.get('/test', { foo: 'bar', undef: undefined });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('foo=bar');
      expect(calledUrl).not.toContain('undef');
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers(),
        text: () => Promise.resolve(''),
      });

      const result = await client.get('/test');
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    let client: PlatformHttpClient;

    beforeEach(() => {
      client = new PlatformHttpClient(defaultOptions);
    });

    it('should throw BadRequestError on 400', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Invalid input', long_message: 'The input is invalid', code: 'invalid_input' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(BadRequestError);
    });

    it('should throw AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Invalid token', long_message: 'The token is invalid', code: 'invalid_token' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('should throw AuthorizationError on 403', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Access denied', long_message: 'You do not have access', code: 'access_denied' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(AuthorizationError);
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Not found', long_message: 'Resource not found', code: 'not_found' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw ConflictError on 409', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Conflict', long_message: 'Resource conflict', code: 'conflict' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(ConflictError);
    });

    it('should throw UnprocessableEntityError on 422', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Invalid params', long_message: 'Invalid parameters', code: 'invalid_params' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(UnprocessableEntityError);
    });

    it('should throw generic ClerkPlatformError on other status codes', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Server error', long_message: 'Internal server error', code: 'server_error' }],
            }),
          ),
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(ClerkPlatformError);
    });

    it('should include clerk_trace_id in error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () =>
          Promise.resolve(
            JSON.stringify({
              errors: [{ message: 'Error', long_message: 'Error', code: 'error' }],
              clerk_trace_id: 'trace_123',
            }),
          ),
      });

      try {
        await client.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestError);
        expect((error as BadRequestError).clerkTraceId).toBe('trace_123');
      }
    });
  });

  describe('timeout', () => {
    let client: PlatformHttpClient;

    beforeEach(() => {
      client = new PlatformHttpClient({
        ...defaultOptions,
        timeout: 100, // Use short timeout for testing
      });
    });

    it('should timeout request after configured duration', async () => {
      // Mock fetch that respects abort signal
      mockFetch.mockImplementation((url: string, options: RequestInit) => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            resolve({
              ok: true,
              headers: new Headers({ 'content-type': 'application/json' }),
              text: () => Promise.resolve('{}'),
            });
          }, 200); // Takes 200ms, but timeout is 100ms

          // Listen for abort signal
          options.signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      });

      await expect(client.get('/test')).rejects.toBeInstanceOf(TimeoutError);
    }, 10000);

    it('should allow custom timeout per request', async () => {
      // Mock fetch that respects abort signal
      mockFetch.mockImplementation((url: string, options: RequestInit) => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            resolve({
              ok: true,
              headers: new Headers({ 'content-type': 'application/json' }),
              text: () => Promise.resolve('{}'),
            });
          }, 100); // Takes 100ms, but timeout is 50ms

          options.signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      });

      await expect(client.get('/test', {}, { timeout: 50 })).rejects.toBeInstanceOf(TimeoutError);
    }, 10000);

    it('should not timeout if request completes in time', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve('{"success": true}'),
      });

      const result = await client.get('/test');
      expect(result).toEqual({ success: true });
    });
  });
});
