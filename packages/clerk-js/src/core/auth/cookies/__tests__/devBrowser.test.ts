import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecureAttribute } from '../../getSecureAttribute';
import { createDevBrowserCookie } from '../devBrowser';
import { requiresSameSiteNone } from '../requireSameSiteNone';

vi.mock('@clerk/shared/cookie');
vi.mock('@clerk/shared/date');
vi.mock('@clerk/shared/internal/clerk-js/runtime');
vi.mock('../../getSecureAttribute');
vi.mock('../requireSameSiteNone');

describe('createDevBrowserCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockDevBrowser = 'test-dev-browser';
  const mockExpires = new Date('2024-12-31');
  const defaultOptions = { usePartitionedCookies: () => false };
  const mockSet = vi.fn();
  const mockRemove = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    (addYears as ReturnType<typeof vi.fn>).mockReturnValue(mockExpires);
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (requiresSameSiteNone as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getSecureAttribute as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (createCookieHandler as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      set: mockSet,
      remove: mockRemove,
      get: mockGet,
    }));
  });

  it('should create both suffixed and non-suffixed cookie handlers', () => {
    createDevBrowserCookie(mockCookieSuffix, defaultOptions);

    expect(createCookieHandler).toHaveBeenCalledTimes(2);
    expect(createCookieHandler).toHaveBeenCalledWith('__clerk_db_jwt');
    expect(createCookieHandler).toHaveBeenCalledWith('__clerk_db_jwt_test-suffix');
  });

  it('should remove non-partitioned and partitioned cookies even when partitioned cookies are disabled', () => {
    const cookieHandler = createDevBrowserCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.remove();

    const currentAttributes = {
      sameSite: 'Lax',
      secure: true,
      partitioned: false,
    };
    const partitionedAttributes = {
      sameSite: 'None',
      secure: true,
      partitioned: true,
    };

    expect(mockRemove).toHaveBeenCalledTimes(6);
    expect(mockRemove).toHaveBeenNthCalledWith(1, currentAttributes);
    expect(mockRemove).toHaveBeenNthCalledWith(2);
    expect(mockRemove).toHaveBeenNthCalledWith(3, partitionedAttributes);
    expect(mockRemove).toHaveBeenNthCalledWith(4, currentAttributes);
    expect(mockRemove).toHaveBeenNthCalledWith(5);
    expect(mockRemove).toHaveBeenNthCalledWith(6, partitionedAttributes);
  });

  it('should clear stale partitioned cookies before setting a new non-partitioned cookie', () => {
    const cookieHandler = createDevBrowserCookie(mockCookieSuffix, defaultOptions);
    cookieHandler.set(mockDevBrowser);

    expect(mockRemove).toHaveBeenCalledWith({
      sameSite: 'None',
      secure: true,
      partitioned: true,
    });
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenCalledWith(mockDevBrowser, {
      expires: mockExpires,
      sameSite: 'Lax',
      secure: true,
      partitioned: false,
    });
  });

  it('should set partitioned cookies when usePartitionedCookies returns true', () => {
    const cookieHandler = createDevBrowserCookie(mockCookieSuffix, { usePartitionedCookies: () => true });
    cookieHandler.set(mockDevBrowser);

    expect(mockSet).toHaveBeenCalledWith(mockDevBrowser, {
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: true,
    });
  });

  it('should get cookie value from suffixed cookie first, then fallback to non-suffixed', () => {
    mockGet.mockImplementationOnce(() => 'suffixed-value').mockImplementationOnce(() => 'non-suffixed-value');

    const cookieHandler = createDevBrowserCookie(mockCookieSuffix, defaultOptions);
    const result = cookieHandler.get();

    expect(result).toBe('suffixed-value');
  });

  it('should fallback to non-suffixed cookie when suffixed cookie is not present', () => {
    mockGet.mockImplementationOnce(() => undefined).mockImplementationOnce(() => 'non-suffixed-value');

    const cookieHandler = createDevBrowserCookie(mockCookieSuffix, defaultOptions);
    const result = cookieHandler.get();

    expect(result).toBe('non-suffixed-value');
  });
});
