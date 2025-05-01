import { createClientUatCookie } from '../clientUat';
import { createCookieHandler } from '@clerk/shared/cookie';
import { addYears } from '@clerk/shared/date';
import { inCrossOriginIframe } from '../../../../utils';
import { getCookieDomain } from '../../getCookieDomain';
import { getSecureAttribute } from '../../getSecureAttribute';

// Mock dependencies
jest.mock('@clerk/shared/cookie');
jest.mock('@clerk/shared/date');
jest.mock('../../../../utils');
jest.mock('../../getCookieDomain');
jest.mock('../../getSecureAttribute');

describe('createClientUatCookie', () => {
  const mockCookieSuffix = 'test-suffix';
  const mockExpires = new Date('2024-12-31');
  const mockDomain = 'test.domain';
  const mockSet = jest.fn();
  const mockRemove = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    (addYears as jest.Mock).mockReturnValue(mockExpires);
    (inCrossOriginIframe as jest.Mock).mockReturnValue(false);
    (getCookieDomain as jest.Mock).mockReturnValue(mockDomain);
    (getSecureAttribute as jest.Mock).mockReturnValue(true);
    (createCookieHandler as jest.Mock).mockImplementation(() => ({
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
    (inCrossOriginIframe as jest.Mock).mockReturnValue(true);
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
});
