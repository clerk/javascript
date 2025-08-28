import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuth } from '../getAuth';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';

vi.mock('../legacyAuthenticateRequest', async importOriginal => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('../legacyAuthenticateRequest')>();
  return {
    ...actual,
    legacyAuthenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockReturnValue({ userId: '123' }),
      headers: new Headers(),
      status: 'signed-out',
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
        userId: '123',
        ...options,
      })),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as any;

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
    } as any;

    await getAuth(args);

    expect(legacyAuthenticateRequest).toHaveBeenCalled();
  });
});
