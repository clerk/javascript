import { beforeEach, describe, expect, it, vi } from 'vitest';

import { middlewareMigrationWarning } from '../../utils/errors';
import { legacyAuthenticateRequest } from '../legacyAuthenticateRequest';
import { rootAuthLoader } from '../rootAuthLoader';

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

describe('rootAuthLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';
  });

  it('should not call legacyAuthenticateRequest when middleware context exists', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockContext = {
      get: vi.fn().mockReturnValue({
        toAuth: vi.fn().mockReturnValue({ userId: '123' }),
      }),
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as any;

    await rootAuthLoader(args, () => ({ data: 'test' }));

    expect(legacyAuthenticateRequest).not.toHaveBeenCalled();

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should call legacyAuthenticateRequest when middleware context is missing', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mockContext = {
      get: vi.fn().mockReturnValue(null), // No middleware context
    };

    const args = {
      context: mockContext,
      request: new Request('http://clerk.com'),
    } as any;

    await rootAuthLoader(args, () => ({ data: 'test' }));

    expect(legacyAuthenticateRequest).toHaveBeenCalled();

    expect(consoleWarnSpy).toHaveBeenCalledWith(middlewareMigrationWarning);

    consoleWarnSpy.mockRestore();
  });
});
