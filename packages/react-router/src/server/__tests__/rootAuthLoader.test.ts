import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { middlewareMigrationWarning } from '../../utils/errors';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';
import { rootAuthLoader } from '../rootAuthLoader';

vi.mock('../legacyAuthenticateRequest', () => {
  return {
    legacyAuthenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx' }),
      headers: new Headers(),
      status: 'signed-in',
    }),
  };
});

describe('rootAuthLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
  });

  it('should not call legacyAuthenticateRequest when middleware context exists', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockContext = {
      get: vi.fn().mockReturnValue({
        toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx' }),
      }),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    await rootAuthLoader(args, () => ({ data: 'test' }));

    expect(legacyAuthenticateRequest).not.toHaveBeenCalled();

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should call legacyAuthenticateRequest when middleware context is missing', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockContext = {
      get: vi.fn().mockReturnValue(null),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as LoaderFunctionArgs;

    await rootAuthLoader(args, () => ({ data: 'test' }));

    expect(legacyAuthenticateRequest).toHaveBeenCalled();

    expect(consoleWarnSpy).toHaveBeenCalledWith(middlewareMigrationWarning);

    consoleWarnSpy.mockRestore();
  });
});
