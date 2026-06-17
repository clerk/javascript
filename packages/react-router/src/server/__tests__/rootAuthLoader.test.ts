import { TokenType } from '@clerk/backend/internal';
import { data, type LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { authFnContext, middlewareConfigContext, requestStateContext } from '../clerkMiddleware';
import { rootAuthLoader } from '../rootAuthLoader';

vi.mock('../clerkClient');
const mockClerkClient = vi.mocked(clerkClient);

describe('rootAuthLoader', () => {
  const mockRequestState = {
    toAuth: vi.fn().mockImplementation(() => ({
      userId: 'user_xxx',
      tokenType: TokenType.SessionToken,
    })),
    headers: new Headers(),
    status: 'signed-in',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
    // rootAuthLoader re-derives the request state from the request rather than
    // reading the value cached on the context.
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn().mockResolvedValue(mockRequestState),
    } as any);
  });

  describe('with middleware context', () => {
    const makeContext = (additionalState: Record<string, unknown> = {}) => ({
      get: vi.fn().mockImplementation(contextKey => {
        if (contextKey === middlewareConfigContext) {
          return { secretKey: 'sk_test_...', publishableKey: 'pk_test_...', acceptsToken: 'any' };
        }
        if (contextKey === requestStateContext) {
          return { requestState: mockRequestState, additionalState };
        }
        if (contextKey === authFnContext) {
          return vi.fn().mockReturnValue({ userId: 'user_xxx', tokenType: TokenType.SessionToken });
        }
        return null;
      }),
      set: vi.fn(),
    });

    const args = {
      context: makeContext(),
      request: new Request('http://clerk.com'),
    } as unknown as LoaderFunctionArgs;

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

    it('should forward redirect URL options from additionalState into clerkState', async () => {
      const result = (await rootAuthLoader({
        context: makeContext({
          signInForceRedirectUrl: '/dashboard',
          signUpForceRedirectUrl: '/welcome',
          signInFallbackRedirectUrl: '/home',
          signUpFallbackRedirectUrl: '/home',
        }),
        request: new Request('http://clerk.com'),
      } as unknown as LoaderFunctionArgs)) as any;

      const internalState = result.clerkState.__internal_clerk_state;
      expect(internalState.__signInForceRedirectUrl).toBe('/dashboard');
      expect(internalState.__signUpForceRedirectUrl).toBe('/welcome');
      expect(internalState.__signInFallbackRedirectUrl).toBe('/home');
      expect(internalState.__signUpFallbackRedirectUrl).toBe('/home');
    });
  });
});
