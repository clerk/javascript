import { TokenType } from '@clerk/backend/internal';
import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authFnContext } from '../clerkMiddleware';
import { getAuth } from '../getAuth';

describe('getAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
  });

  it('should work when middleware context exists', async () => {
    const mockContext = {
      get: vi.fn().mockImplementation(contextKey => {
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

    const auth = await getAuth(args);

    expect(auth.userId).toBe('user_xxx');
    expect(auth.tokenType).toBe('session_token');
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
