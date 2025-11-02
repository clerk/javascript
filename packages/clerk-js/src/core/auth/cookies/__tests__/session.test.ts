import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '@clerk/shared/internal/clerk-js/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecureAttribute } from '../../getSecureAttribute';
import { createSessionCookie } from '../session';

vi.mock('@clerk/shared/cookie');
vi.mock('@clerk/shared/date');
vi.mock('@clerk/shared/internal/clerk-js/runtime');
vi.mock('../../getSecureAttribute');

describe('createSessionCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockToken = 'test-token';
  const mockExpires = new Date('2024-12-31');
  const mockSet = vi.fn();
  const mockRemove = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    (addYears as ReturnType<typeof vi.fn>).mockReturnValue(mockExpires);
    (inCrossOriginIframe as ReturnType<typeof vi.fn>).mockReturnValue(false);
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
    const cookieHandler = createSessionCookie(mockCookieSuffix);
    cookieHandler.set(mockToken);

    expect(mockSet).toHaveBeenCalledWith(mockToken, {
      expires: mockExpires,
      sameSite: 'None',
      secure: true,
      partitioned: false,
    });
  });

  it('should remove both cookies when remove is called', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix);
    cookieHandler.remove();

    expect(mockRemove).toHaveBeenCalledTimes(2);
  });

  it('should remove cookies with the same attributes as set', () => {
    const cookieHandler = createSessionCookie(mockCookieSuffix);
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
