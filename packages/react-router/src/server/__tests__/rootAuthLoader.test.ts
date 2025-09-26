import { TokenType } from '@clerk/backend/internal';
import { logger } from '@clerk/shared/logger';
import { data, type LoaderFunctionArgs } from 'react-router';
import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { middlewareMigrationWarning } from '../../utils/errors';
import { authFnContext, requestStateContext } from '../clerkMiddleware';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';
import { rootAuthLoader } from '../rootAuthLoader';

vi.mock('../legacyAuthenticateRequest', () => {
  return {
    legacyAuthenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockImplementation(() => ({
        userId: 'user_xxx',
        tokenType: TokenType.SessionToken,
      })),
      headers: new Headers({
        'x-clerk-auth-status': 'signed-in',
        'x-clerk-auth-reason': 'auth-reason',
        'x-clerk-auth-message': 'auth-message',
      }),
      status: 'signed-in',
    }),
  };
});

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

    it('should not call legacyAuthenticateRequest when middleware context exists', async () => {
      const warnOnceSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});

      await rootAuthLoader(args, () => ({ data: 'test' }));

      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
      expect(warnOnceSpy).not.toHaveBeenCalled();

      warnOnceSpy.mockRestore();
    });

    it('should handle no callback', async () => {
      const result = await rootAuthLoader(args);

      expect(result).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
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

      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
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

      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });

    it('should handle callback returning plain object', async () => {
      const nonCriticalData = new Promise(res => setTimeout(() => res('non-critical'), 5000));
      const plainObject = { message: 'Hello from plain object', nonCriticalData };

      const result = await rootAuthLoader(args, () => plainObject);

      expect(result).toHaveProperty('message', 'Hello from plain object');
      expect(result).toHaveProperty('nonCriticalData', nonCriticalData);
      expect(result).toHaveProperty('clerkState');

      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });

    it('should handle callback returning null', async () => {
      const result = await rootAuthLoader(args, () => null);

      expect(result).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    });
  });

  describe('without middleware context', () => {
    const mockContext = {
      // No get/set methods - simulates v8_middleware flag not enabled
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    let warnOnceSpy: MockInstance<(msg: string) => void>;

    beforeEach(() => {
      warnOnceSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    });

    afterEach(() => {
      warnOnceSpy.mockRestore();
    });

    it('should call legacyAuthenticateRequest when middleware context is missing', async () => {
      await rootAuthLoader(args, () => ({ data: 'test' }));

      expect(legacyAuthenticateRequest).toHaveBeenCalled();
      expect(warnOnceSpy).toHaveBeenCalledWith(middlewareMigrationWarning);
    });

    it('should handle no callback', async () => {
      const result = await rootAuthLoader(args);

      const response = result as Response;

      expect(result).toBeInstanceOf(Response);
      expect(await response.json()).toHaveProperty('clerkState');
      expect(legacyAuthenticateRequest).toHaveBeenCalled();

      expect(response.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
      expect(response.headers.get('x-clerk-auth-status')).toBe('signed-in');
      expect(response.headers.get('x-clerk-auth-message')).toBe('auth-message');
    });

    it('should handle callback returning Response', async () => {
      const mockResponse = new Response(JSON.stringify({ message: 'Hello' }));

      const response = await rootAuthLoader(args, () => mockResponse);

      expect(response).toBeInstanceOf(Response);
      expect(await response.json()).toHaveProperty('clerkState');

      expect(response.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
      expect(response.headers.get('x-clerk-auth-status')).toBe('signed-in');
      expect(response.headers.get('x-clerk-auth-message')).toBe('auth-message');

      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning data()', async () => {
      const result = await rootAuthLoader(args, () => data({ message: 'Hello from data()' }));

      const response = result as unknown as Response;

      expect(response).toBeInstanceOf(Response);
      const json = await response.json();
      expect(json).toHaveProperty('message', 'Hello from data()');
      expect(json).toHaveProperty('clerkState');

      expect(response.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
      expect(response.headers.get('x-clerk-auth-status')).toBe('signed-in');
      expect(response.headers.get('x-clerk-auth-message')).toBe('auth-message');

      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning plain object', async () => {
      const nonCriticalData = new Promise(res => setTimeout(() => res('non-critical'), 5000));
      const plainObject = { message: 'Hello from plain object', nonCriticalData };

      const result = await rootAuthLoader(args, () => plainObject);

      const response = result as unknown as Response;

      expect(result).toBeInstanceOf(Response);
      const json = await response.json();
      expect(json).toHaveProperty('message', 'Hello from plain object');
      expect(json).toHaveProperty('nonCriticalData', {}); // serialized to {}
      expect(json).toHaveProperty('clerkState');

      expect(response.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
      expect(response.headers.get('x-clerk-auth-status')).toBe('signed-in');
      expect(response.headers.get('x-clerk-auth-message')).toBe('auth-message');

      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });

    it('should handle callback returning null', async () => {
      const result = await rootAuthLoader(args, () => null);

      const response = result as unknown as Response;

      expect(result).toBeInstanceOf(Response);
      expect(await response.json()).toHaveProperty('clerkState');

      expect(response.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
      expect(response.headers.get('x-clerk-auth-status')).toBe('signed-in');
      expect(response.headers.get('x-clerk-auth-message')).toBe('auth-message');

      expect(legacyAuthenticateRequest).toHaveBeenCalled();
    });
  });
});
