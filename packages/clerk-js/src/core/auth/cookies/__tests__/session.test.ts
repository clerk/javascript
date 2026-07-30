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
  const mockSet = vi.fn();
  const mockRemove = vi.fn();
  const mockGet = vi.fn();
  const mockCookieCalls: Array<{
    type: 'set' | 'remove';
    name: string;
    value?: string;
    attributes?: object;
  }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieCalls.length = 0;
    mockGet.mockReset();
    (addYears as ReturnType<typeof vi.fn>).mockReturnValue(mockExpires);
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getSecureAttribute as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (createCookieHandler as ReturnType<typeof vi.fn>).mockImplementation((name: string) => ({
      set: (value: string, attributes?: object) => {
        mockSet(value, attributes);
        mockCookieCalls.push({ type: 'set', name, value, attributes });
      },
      remove: (attributes?: object) => {
        mockRemove(attributes);
        mockCookieCalls.push({ type: 'remove', name, attributes });
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
    expect(mockSet).toHaveBeenCalledWith(mockToken, {
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

    expect(mockSet).toHaveBeenCalledWith(mockToken, {
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

    expect(mockSet).toHaveBeenCalledWith(mockToken, {
      expires: mockExpires,
      sameSite: 'Lax',
      secure: true,
      partitioned: false,
    });

    expect(mockRemove).toHaveBeenCalledWith(expectedAttributes);
    expect(mockRemove).toHaveBeenCalledTimes(2);
    expect(mockRemove).toHaveBeenNthCalledWith(1, expectedAttributes);
    expect(mockRemove).toHaveBeenNthCalledWith(2, expectedAttributes);
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

    expect(mockSet).toHaveBeenCalledWith(mockToken, {
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
    expect(mockSet).toHaveBeenCalledWith(mockToken, {
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
    mockCookieCalls.length = 0;
    cookieHandler.set('partitioned-token');

    expect(mockCookieCalls).toEqual([
      { type: 'remove', name: '__session', attributes: undefined },
      { type: 'remove', name: '__session_test-suffix', attributes: undefined },
      {
        type: 'set',
        name: '__session',
        value: 'partitioned-token',
        attributes: {
          expires: mockExpires,
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      },
      {
        type: 'set',
        name: '__session_test-suffix',
        value: 'partitioned-token',
        attributes: {
          expires: mockExpires,
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      },
    ]);
  });
});
