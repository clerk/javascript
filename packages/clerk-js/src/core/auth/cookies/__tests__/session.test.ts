import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inCrossOriginIframe } from '../../../../utils';
import { getCookieDomain } from '../../getCookieDomain';
import { getSecureAttribute } from '../../getSecureAttribute';
import { createSessionCookie } from '../session';

vi.mock('@clerk/shared/cookie');
vi.mock('@clerk/shared/date');
vi.mock('../../../../utils');
vi.mock('../../getCookieDomain');
vi.mock('../../getSecureAttribute');

describe('createSessionCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockToken = 'test-token';
  const mockExpires = new Date('2024-12-31');
  const mockDomain = 'example.com';
  const mockSet = vi.fn();
  const mockRemove = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    (addYears as ReturnType<typeof vi.fn>).mockReturnValue(mockExpires);
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getCookieDomain as ReturnType<typeof vi.fn>).mockReturnValue(mockDomain);
    (getSecureAttribute as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (createCookieHandler as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      set: mockSet,
      remove: mockRemove,
      get: mockGet,
    }));
  });

  it('should create both suffixed and non-suffixed cookie handlers', () => {
    createSessionCookie(mockCookieSuffix);
    expect(createCookieHandler).toHaveBeenCalledTimes(2);
    expect(createCookieHandler).toHaveBeenCalledWith('__session');
    expect(createCookieHandler).toHaveBeenCalledWith('__session_test-suffix');
  });

  it('should set cookies with correct parameters in non-cross-origin context', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix);
    cookieHandler.set(mockToken);

    // Should call remove first to clean up subdomain-scoped cookies (2 calls)
    // Then set with domain attribute (2 calls)
    expect(mockRemove).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(mockToken, {
      domain: mockDomain,
      expires: mockExpires,
      partitioned: false,
      sameSite: 'Lax',
      secure: true,
    });
  });

  it('should set cookies with None sameSite in cross-origin context', () => {
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const cookieHandler = createSessionCookie(mockCookieSuffix);
    cookieHandler.set(mockToken);

    expect(mockSet).toHaveBeenCalledWith(mockToken, {
      domain: mockDomain,
      expires: mockExpires,
      partitioned: false,
      sameSite: 'None',
      secure: true,
    });
  });

  it('should remove both cookies when remove is called', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix);
    cookieHandler.remove();

    // Should remove with domain (2 calls) and without domain for backward compat (2 calls)
    expect(mockRemove).toHaveBeenCalledTimes(4);
  });

  it('should remove cookies with the same attributes as set', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix);
    cookieHandler.set(mockToken);
    cookieHandler.remove();

    const expectedAttributesWithDomain = {
      domain: mockDomain,
      partitioned: false,
      sameSite: 'Lax',
      secure: true,
    };

    const expectedAttributesWithoutDomain = {
      partitioned: false,
      sameSite: 'Lax',
      secure: true,
    };

    expect(mockSet).toHaveBeenCalledWith(mockToken, {
      domain: mockDomain,
      expires: mockExpires,
      partitioned: false,
      sameSite: 'Lax',
      secure: true,
    });

    // set() calls remove twice to clean up subdomain cookies
    // remove() calls remove 4 times (2 with domain, 2 without)
    // Total: 6 remove calls
    expect(mockRemove).toHaveBeenCalledTimes(6);

    // During set(): removes without params (2 calls)
    expect(mockRemove).toHaveBeenNthCalledWith(1);
    expect(mockRemove).toHaveBeenNthCalledWith(2);

    // During remove(): removes with domain (2 calls)
    expect(mockRemove).toHaveBeenNthCalledWith(3, expectedAttributesWithDomain);
    expect(mockRemove).toHaveBeenNthCalledWith(4, expectedAttributesWithDomain);

    // During remove(): removes without domain for backward compat (2 calls)
    expect(mockRemove).toHaveBeenNthCalledWith(5, expectedAttributesWithoutDomain);
    expect(mockRemove).toHaveBeenNthCalledWith(6, expectedAttributesWithoutDomain);
  });

  it('should get cookie value from suffixed cookie first, then fallback to non-suffixed', () => {
    mockGet.mockImplementationOnce(() => 'suffixed-value').mockImplementationOnce(() => 'non-suffixed-value');

    const cookieHandler = createSessionCookie(mockCookieSuffix);
    const result = cookieHandler.get();

    expect(result).toBe('suffixed-value');
  });

  it('should fallback to non-suffixed cookie when suffixed cookie is not present', () => {
    mockGet.mockImplementationOnce(() => undefined).mockImplementationOnce(() => 'non-suffixed-value');

    const cookieHandler = createSessionCookie(mockCookieSuffix);
    const result = cookieHandler.get();

    expect(result).toBe('non-suffixed-value');
  });
});
