import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecureAttribute } from '../../getSecureAttribute';
import { requiresSameSiteNone } from '../requireSameSiteNone';
import { createSessionCookie } from '../session';

vi.mock('@clerk/shared/cookie');
vi.mock('@clerk/shared/date');
vi.mock('@clerk/shared/internal/clerk-js/runtime');
vi.mock('../../getSecureAttribute');
vi.mock('../requireSameSiteNone');

describe('createSessionCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockToken = 'test-token';
  const mockExpires = new Date('2024-12-31');
  const defaultOptions = { usePartitionedCookies: () => false };
  const mockSet = vi.fn<(name: string, value: string, attributes?: object) => void>();
  const mockRemove = vi.fn<(name: string, attributes?: object) => void>();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    (addYears as ReturnType<typeof vi.fn>).mockReturnValue(mockExpires);
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getSecureAttribute as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (createCookieHandler as ReturnType<typeof vi.fn>).mockImplementation((name: string) => ({
      set: (value: string, attributes?: object) => {
        mockSet(name, value, attributes);
      },
      remove: (attributes?: object) => {
        mockRemove(name, attributes);
      },
      get: mockGet,
    }));
  });

  it('should create both suffixed and non-suffixed cookie handlers', () => {
    createSessionCookie(mockCookieSuffix, defaultOptions);
    expect(createCookieHandler).toHaveBeenCalledTimes(2);
    expect(createCookieHandler).toHaveBeenCalledWith('__session');
    expect(createCookieHandler).toHaveBeenCalledWith('__session_test-suffix');
  });

  it('should set cookies with correct parameters in non-cross-origin context', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set(mockToken);

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith('__session', mockToken, {
      expires: mockExpires,
      sameSite: 'Lax',
      secure: true,
      partitioned: false,
    });
  });

  it('should set cookies with None sameSite in cross-origin context', () => {
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set(mockToken);

    expect(mockSet).toHaveBeenCalledWith('__session', mockToken, {
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });

  it('should remove both cookies when remove is called', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.remove();

    expect(mockRemove).toHaveBeenCalledTimes(2);
  });

  it('should remove cookies with the same attributes as set', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set(mockToken);
    cookieHandler.remove();

    const expectedAttributes = {
      sameSite: 'Lax',
      secure: true,
      partitioned: false,
    };

    expect(mockSet).toHaveBeenCalledWith('__session', mockToken, {
      expires: mockExpires,
      sameSite: 'Lax',
      secure: true,
      partitioned: false,
    });

    expect(mockRemove).toHaveBeenCalledWith('__session', expectedAttributes);
    expect(mockRemove).toHaveBeenCalledTimes(2);
    expect(mockRemove).toHaveBeenNthCalledWith(1, '__session', expectedAttributes);
    expect(mockRemove).toHaveBeenNthCalledWith(2, '__session_test-suffix', expectedAttributes);
  });

  it('should get cookie value from suffixed cookie first, then fallback to non-suffixed', () => {
    mockGet.mockImplementationOnce(() => 'suffixed-value').mockImplementationOnce(() => 'non-suffixed-value');

    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    const result = cookieHandler.get();

    expect(result).toBe('suffixed-value');
  });

  it('should fallback to non-suffixed cookie when suffixed cookie is not present', () => {
    mockGet.mockImplementationOnce(() => undefined).mockImplementationOnce(() => 'non-suffixed-value');

    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    const result = cookieHandler.get();

    expect(result).toBe('non-suffixed-value');
  });

  it('should set cookies with None sameSite on .replit.dev origins', () => {
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createSessionCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set(mockToken);

    expect(mockSet).toHaveBeenCalledWith('__session', mockToken, {
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });

  it('should set partitioned cookies when usePartitionedCookies returns true', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix, { usePartitionedCookies: () => true });
    cookieHandler.set(mockToken);

    expect(mockRemove).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith('__session', mockToken, {
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: true,
    });
  });

  it('clears non-partitioned variants before writing partitioned cookies after the environment changes', () => {
    let usePartitionedCookies = false;
    const cookieHandler = createSessionCookie(mockCookieSuffix, {
      usePartitionedCookies: () => usePartitionedCookies,
    });

    cookieHandler.set('non-partitioned-token');
    usePartitionedCookies = true;
    mockSet.mockClear();
    mockRemove.mockClear();
    cookieHandler.set('partitioned-token');

    expect(mockRemove.mock.calls).toEqual([
      ['__session', undefined],
      ['__session_test-suffix', undefined],
    ]);
    expect(mockSet.mock.calls).toEqual([
      [
        '__session',
        'partitioned-token',
        {
          expires: mockExpires,
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      ],
      [
        '__session_test-suffix',
        'partitioned-token',
        {
          expires: mockExpires,
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      ],
    ]);
    const firstInvocationOrder = mockRemove.mock.invocationCallOrder[0];
    expect(mockRemove.mock.invocationCallOrder).toEqual([firstInvocationOrder, firstInvocationOrder + 1]);
    expect(mockSet.mock.invocationCallOrder).toEqual([firstInvocationOrder + 2, firstInvocationOrder + 3]);
  });
});
