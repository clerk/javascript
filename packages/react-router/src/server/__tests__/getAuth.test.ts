import type { ClerkClient } from '@clerk/backend';
import { TokenType } from '@clerk/backend/internal';
import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { middlewareConfigContext } from '../clerkMiddleware';
import { getAuth } from '../getAuth';

vi.mock('../clerkClient');
const mockClerkClient = vi.mocked(clerkClient);

describe('getAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn().mockResolvedValue({
        headers: new Headers(),
        toAuth: (options?: Record<string, unknown>) => ({
          userId: 'user_xxx',
          tokenType: TokenType.SessionToken,
          ...(options ?? {}),
        }),
      }),
    } as unknown as ClerkClient);
  });

  it('should re-derive auth from the request when middleware ran', async () => {
    // Middleware stashes identity-free options; getAuth re-derives the user from
    // the request via authenticateRequest rather than reading a cached value.
    const mockContext = {
      get: vi.fn().mockImplementation(contextKey => {
        if (contextKey === middlewareConfigContext) {
          return { secretKey: 'sk_test_...', publishableKey: 'pk_test_...', acceptsToken: 'any' };
        }
        return null;
      }),
      set: vi.fn(),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    const auth = await getAuth(args);

    expect(auth.userId).toBe('user_xxx');
    expect(auth.tokenType).toBe('session_token');
  });

  it('returns signed-out instead of throwing when the re-derive yields a handshake state', async () => {
    // A fresh GET loader request (Request-instance miss) can re-authenticate into a
    // handshake state, whose toAuth() is null. The middleware redirects before loaders run,
    // but the re-derive can't, so getAuth must fall back to signed-out rather than
    // dereferencing null.
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn().mockResolvedValue({
        headers: new Headers(),
        status: 'handshake',
        toAuth: () => null,
      }),
    } as unknown as ClerkClient);

    const mockContext = {
      get: vi.fn().mockImplementation(contextKey => {
        if (contextKey === middlewareConfigContext) {
          return { secretKey: 'sk_test_...', publishableKey: 'pk_test_...', acceptsToken: 'any' };
        }
        return null;
      }),
      set: vi.fn(),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    const auth = await getAuth(args);

    expect(auth.userId).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
  });

  it('should throw an error when middleware context is missing', async () => {
    const mockContext = {
      get: vi.fn().mockReturnValue(null),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    await expect(getAuth(args)).rejects.toThrow('Clerk: clerkMiddleware() not detected');
  });
});
