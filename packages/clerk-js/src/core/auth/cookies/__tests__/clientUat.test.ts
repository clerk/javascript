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
  const mockSet = vi.fn();
  const mockRemove = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    (addYears as ReturnType<typeof vi.fn>).mockReturnValue(mockExpires);
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getCookieDomain as ReturnType<typeof vi.fn>).mockReturnValue(mockDomain);
    (getSecureAttribute as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (createCookieHandler as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      set: mockSet,
      remove: mockRemove,
      get: mockGet,
    }));
  });

  it('should create both suffixed and non-suffixed cookie handlers', () => {
    createClientUatCookie(mockCookieSuffix);
    expect(createCookieHandler).toHaveBeenCalledTimes(2);
    expect(createCookieHandler).toHaveBeenCalledWith('__client_uat');
    expect(createCookieHandler).toHaveBeenCalledWith('__client_uat_test-suffix');
  });

  it('should set cookies with correct parameters in non-cross-origin context', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith('1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'Strict',
      secure: true,
      partitioned: false,
    });
  });

  it('should set cookies with None sameSite in cross-origin context', () => {
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledWith('1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });

  it('should set value to 0 when client is undefined', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    cookieHandler.set(undefined);

    expect(mockSet).toHaveBeenCalledWith('0', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'Strict',
      secure: true,
      partitioned: false,
    });
  });

  it('should set value to 0 when client has no signed in sessions', () => {
    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: [],
    });

    expect(mockSet).toHaveBeenCalledWith('0', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'Strict',
      secure: true,
      partitioned: false,
    });
  });

  it('should get cookie value from suffixed cookie first, then fallback to non-suffixed', () => {
    mockGet.mockImplementationOnce(() => '1234567890').mockImplementationOnce(() => '9876543210');

    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    const result = cookieHandler.get();

    expect(result).toBe(1234567890);
  });

  it('should return 0 when no cookie value is present', () => {
    mockGet.mockImplementationOnce(() => undefined).mockImplementationOnce(() => undefined);

    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    const result = cookieHandler.get();

    expect(result).toBe(0);
  });

  it('should set cookies with None sameSite on .replit.dev origins', () => {
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createClientUatCookie(mockCookieSuffix);
    cookieHandler.set({
      id: 'test-client',
      updatedAt: new Date('2024-01-01'),
      signedInSessions: ['session1'],
    });

    expect(mockSet).toHaveBeenCalledWith('1704067200', {
      domain: mockDomain,
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });
});
