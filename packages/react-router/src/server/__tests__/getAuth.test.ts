import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuth } from '../getAuth';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';

vi.mock('../legacyAuthenticateRequest', () => {
  return {
    legacyAuthenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx' }),
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
      get: vi.fn().mockReturnValue((options?: any) => ({
        userId: 'user_xxx',
        ...options,
      })),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    await getAuth(args);

    expect(legacyAuthenticateRequest).not.toHaveBeenCalled();
  });

  it('should call legacyAuthenticateRequest when middleware context is missing', async () => {
    const mockContext = {
      get: vi.fn().mockReturnValue(null),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    await getAuth(args);

    expect(legacyAuthenticateRequest).toHaveBeenCalled();
  });
});
