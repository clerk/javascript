import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';

import { inCrossOriginIframe } from '../../../../utils';
import { getSecureAttribute } from '../../getSecureAttribute';
import { createSessionCookie } from '../session';

jest.mock('@clerk/shared/cookie');
jest.mock('@clerk/shared/date');
jest.mock('../../../../utils');
jest.mock('../../getSecureAttribute');

describe('createSessionCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockToken = 'test-token';
  const mockExpires = new Date('2024-12-31');
  const mockSet = jest.fn();
  const mockRemove = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    (addYears as jest.Mock).mockReturnValue(mockExpires);
    (inCrossOriginIframe as jest.Mock).mockReturnValue(false);
    (getSecureAttribute as jest.Mock).mockReturnValue(true);
    (createCookieHandler as jest.Mock).mockImplementation(() => ({
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
    (inCrossOriginIframe as jest.Mock).mockReturnValue(true);
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
