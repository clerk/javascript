import { TokenType } from '@clerk/backend/internal';
import { data, type LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authFnContext, requestStateContext } from '../clerkMiddleware';
import { rootAuthLoader } from '../rootAuthLoader';

describe('rootAuthLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
  });

  describe('with middleware context', () => {
    const mockContext = {
      get: vi.fn().mockImplementation(contextKey => {
        if (contextKey === requestStateContext) {
          return {
            toAuth: vi.fn().mockImplementation(() => ({
              userId: 'user_xxx',
              tokenType: TokenType.SessionToken,
            })),
            headers: new Headers(),
            status: 'signed-in',
          };
        }
        if (contextKey === authFnContext) {
          return vi.fn().mockImplementation((options?: any) => ({
            userId: 'user_xxx',
            tokenType: TokenType.SessionToken,
            ...options,
          }));
        }
        return null;
      }),
      set: vi.fn(),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    it('should work with a callback', async () => {
      await rootAuthLoader(args, () => ({ data: 'test' }));
    });

    it('should handle no callback', async () => {
      const result = await rootAuthLoader(args);

      expect(result).toHaveProperty('clerkState');
    });

    it('should handle callback returning a Response', async () => {
      const mockResponse = new Response(JSON.stringify({ message: 'Hello' }), {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rootAuthLoader(args, () => mockResponse);

      expect(response).toBeInstanceOf(Response);
      const json = await response.json();
      expect(json).toHaveProperty('message', 'Hello');
      expect(json).toHaveProperty('clerkState');

      // Headers will be set by middleware
      expect(response.headers.get('x-clerk-auth-reason')).toBeNull();
      expect(response.headers.get('x-clerk-auth-status')).toBeNull();
      expect(response.headers.get('x-clerk-auth-message')).toBeNull();
    });

    it('should handle callback returning data()', async () => {
      const result = await rootAuthLoader(args, () => data({ message: 'Hello from data()' }));

      const response = result as unknown as Response;

      expect(response).toBeInstanceOf(Response);
      const json = await response.json();
      expect(json).toHaveProperty('message', 'Hello from data()');
      expect(json).toHaveProperty('clerkState');

      // Headers will be set by middleware
      expect(response.headers.get('x-clerk-auth-reason')).toBeNull();
      expect(response.headers.get('x-clerk-auth-status')).toBeNull();
      expect(response.headers.get('x-clerk-auth-message')).toBeNull();
    });

    it('should handle callback returning plain object', async () => {
      const nonCriticalData = new Promise(res => setTimeout(() => res('non-critical'), 5000));
      const plainObject = { message: 'Hello from plain object', nonCriticalData };

      const result = await rootAuthLoader(args, () => plainObject);

      expect(result).toHaveProperty('message', 'Hello from plain object');
      expect(result).toHaveProperty('nonCriticalData', nonCriticalData);
      expect(result).toHaveProperty('clerkState');
    });

    it('should handle callback returning null', async () => {
      const result = await rootAuthLoader(args, () => null);

      expect(result).toHaveProperty('clerkState');
    });
  });
});
