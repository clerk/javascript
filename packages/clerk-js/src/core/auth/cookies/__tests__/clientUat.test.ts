import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCookieDomain } from '../../getCookieDomain';
import { getSecureAttribute } from '../../getSecureAttribute';
import { createClientUatCookie } from '../clientUat';
import { requiresSameSiteNone } from '../requireSameSiteNone';

vi.mock('@clerk/shared/cookie');
vi.mock('@clerk/shared/date');
vi.mock('@clerk/shared/internal/clerk-js/runtime');
vi.mock('../../getCookieDomain');
vi.mock('../../getSecureAttribute');
vi.mock('../requireSameSiteNone');

describe('createClientUatCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockExpires = new Date('2024-12-31');
  const mockDomain = 'test.domain';
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
    (getCookieDomain as ReturnType<typeof vi.fn>).mockReturnValue(mockDomain);
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
    createClientUatCookie(mockCookieSuffix, defaultOptions);
    expect(createCookieHandler).toHaveBeenCalledTimes(2);
    expect(createCookieHandler).toHaveBeenCalledWith('__client_uat');
    expect(createCookieHandler).toHaveBeenCalledWith('__client_uat_test-suffix');
  });

  it('should set cookies with correct parameters in non-cross-origin context', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith('__client_uat_test-suffix', '1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'Strict',
      secure: true,
      partitioned: false,
    });
    expect(mockSet).toHaveBeenCalledWith('__client_uat', '1704067200', expect.any(Object));
  });

  it('should set cookies with None sameSite in cross-origin context', () => {
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledWith('__client_uat_test-suffix', '1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });

  it('should set value to 0 when client is undefined', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set(undefined);

    expect(mockSet).toHaveBeenCalledWith('__client_uat_test-suffix', '0', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'Strict',
      secure: true,
      partitioned: false,
    });
  });

  it('should set value to 0 when client has no signed in sessions', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: [],
    });

    expect(mockSet).toHaveBeenCalledWith('__client_uat_test-suffix', '0', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'Strict',
      secure: true,
      partitioned: false,
    });
  });

  it('should get cookie value from suffixed cookie first, then fallback to non-suffixed', () => {
    mockGet.mockImplementationOnce(() => '1234567890').mockImplementationOnce(() => '9876543210');

    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    const result = cookieHandler.get();

    expect(result).toBe(1234567890);
  });

  it('should return 0 when no cookie value is present', () => {
    mockGet.mockImplementationOnce(() => undefined).mockImplementationOnce(() => undefined);

    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    const result = cookieHandler.get();

    expect(result).toBe(0);
  });

  it('should set cookies with SameSite=None when the host requires it', () => {
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createClientUatCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledWith('__client_uat_test-suffix', '1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });

  it('should set partitioned cookies when usePartitionedCookies returns true', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix, { usePartitionedCookies: () => true });
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledWith('__client_uat_test-suffix', '1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: true,
    });
  });

  it('clears non-partitioned domain variants before writing partitioned cookies', () => {
    let usePartitionedCookies = false;
    const cookieHandler = createClientUatCookie(mockCookieSuffix, {
      usePartitionedCookies: () => usePartitionedCookies,
    });
    const client = {
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    };

    cookieHandler.set(client);
    usePartitionedCookies = true;
    mockSet.mockClear();
    mockRemove.mockClear();
    cookieHandler.set(client);

    expect(mockRemove.mock.calls).toEqual([
      ['__client_uat_test-suffix', undefined],
      ['__client_uat', undefined],
      ['__client_uat_test-suffix', { domain: mockDomain, sameSite: 'Strict', secure: true, partitioned: false }],
      ['__client_uat', { domain: mockDomain, sameSite: 'Strict', secure: true, partitioned: false }],
      ['__client_uat_test-suffix', { domain: mockDomain, sameSite: 'None', secure: true, partitioned: false }],
      ['__client_uat', { domain: mockDomain, sameSite: 'None', secure: true, partitioned: false }],
    ]);
    expect(mockSet.mock.calls).toEqual([
      [
        '__client_uat_test-suffix',
        '1704067200',
        {
          domain: mockDomain,
          expires: mockExpires,
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      ],
      [
        '__client_uat',
        '1704067200',
        {
          domain: mockDomain,
          expires: mockExpires,
          sameSite: 'None',
          secure: true,
          partitioned: true,
        },
      ],
    ]);
    expect(Math.max(...mockRemove.mock.invocationCallOrder)).toBeLessThan(
      Math.min(...mockSet.mock.invocationCallOrder),
    );
  });
});
