import { TokenType } from '@clerk/backend/internal';
import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authFnContext } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';

vi.mock('../legacyAuthenticateRequest', () => {
  return {
    legacyAuthenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockImplementation(() => ({
        userId: 'user_xxx',
        tokenType: TokenType.SessionToken,
      })),
      headers: new Headers(),
      status: 'signed-in',
    }),
  };
});

describe('getAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
  });

  it('should not call legacyAuthenticateRequest when middleware context exists', async () => {
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

    expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
    expect(auth.userId).toBe('user_xxx');
    expect(auth.tokenType).toBe('session_token');
  });

  it('should call legacyAuthenticateRequest when middleware context is missing', async () => {
    const mockContext = {
      get: vi.fn().mockReturnValue(null),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    const auth = await getAuth(args);

    expect(legacyAuthenticateRequest).toHaveBeenCalled();
    expect(auth.userId).toBe('user_xxx');
    expect(auth.tokenType).toBe('session_token');
  });
});
