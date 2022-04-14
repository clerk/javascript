import { Base } from '../Base';
import { AuthErrorReason, AuthStateParams, AuthStatus } from '../types';
import { TokenVerificationError } from '../util/errors';
const mockCrossOrigin = jest.fn();
const mockFetchInterstitial = jest.fn();
const mockIsDevelopmentOrStaging = jest.fn();
const mockIsProduction = jest.fn();

jest.mock('../util/jwt', () => ({
  checkClaims: jest.fn(),
}));

jest.mock('../util/request', () => ({
  checkCrossOrigin: () => mockCrossOrigin(),
}));

jest.mock('../util/clerkApiKey', () => ({
  isDevelopmentOrStaging: () => mockIsDevelopmentOrStaging(),
  isProduction: () => mockIsProduction(),
}));

const environmentJWTKey = 'CLERK_JWT_KEY';
const mockInterstitialValue = '';

/* An otherwise bare state on a request. */
const defaultAuthState: AuthStateParams = {
  host: 'clerk.dev',
  fetchInterstitial: () => mockFetchInterstitial(),
  userAgent: 'Mozilla/',
};

const mockImportKey = jest.fn();
const mockVerifySignature = jest.fn();
const mockBase64Decode = jest.fn();
const mockLoadCryptoKeyFunction = jest.fn();

describe('Base verifySessionToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses supplied crypto key function by default when present', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    testBase.verifyJwt = jest.fn();
    testBase.loadCryptoKey = jest.fn();
    await testBase.verifySessionToken('1');
    expect(testBase.verifyJwt).toHaveBeenCalledTimes(1);
    expect(testBase.loadCryptoKey).not.toHaveBeenCalled();
    expect(mockLoadCryptoKeyFunction).toHaveBeenCalledTimes(1);
  });

  it('throws on failed public key fetching', () => {
    mockLoadCryptoKeyFunction.mockImplementationOnce(() => {
      throw new Error();
    });
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    testBase.verifyJwt = jest.fn();
    testBase.loadCryptoKey = jest.fn();
    expect(async () => await testBase.verifySessionToken('1')).rejects.toThrow(TokenVerificationError);
    expect(testBase.verifyJwt).not.toHaveBeenCalled();
    expect(testBase.loadCryptoKey).not.toHaveBeenCalled();
    expect(mockLoadCryptoKeyFunction).toHaveBeenCalledTimes(1);
  });

  it('uses supplied jwtKey versus loadCryptoKey or CLERK_JWT_KEY', async () => {
    jest.resetModules();
    process.env.CLERK_JWT_KEY = environmentJWTKey;
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    testBase.verifyJwt = jest.fn();
    testBase.loadCryptoKey = jest.fn();
    await testBase.verifySessionToken('1', { jwtKey: 'test_jwt_key' });
    expect(testBase.verifyJwt).toHaveBeenCalledTimes(1);
    expect(testBase.loadCryptoKey).toHaveBeenCalledTimes(1);
    expect(mockLoadCryptoKeyFunction).not.toHaveBeenCalled();
    expect(testBase.loadCryptoKey).toHaveBeenCalledWith('test_jwt_key');
  });

  it('uses environment variable when loadCryptoKey function is not present', async () => {
    const mockImportKey = jest.fn();
    const mockVerifySignature = jest.fn();
    const mockBase64Decode = jest.fn();
    jest.resetModules();
    process.env.CLERK_JWT_KEY = environmentJWTKey;
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode);
    testBase.verifyJwt = jest.fn();
    testBase.loadCryptoKey = jest.fn();
    await testBase.verifySessionToken('1');
    expect(testBase.verifyJwt).toHaveBeenCalledTimes(1);
    expect(testBase.loadCryptoKey).toHaveBeenCalledTimes(1);
    expect(testBase.loadCryptoKey).toHaveBeenCalledWith(environmentJWTKey);
  });
});

describe('Base getAuthState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses header token if present to build the state', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    testBase.buildAuthenticatedState = jest.fn();
    await testBase.getAuthState({ ...defaultAuthState, headerToken: 'test_header_token' });
    expect(testBase.buildAuthenticatedState).toHaveBeenCalledTimes(1);
  });

  it('returns correct errorReason on failed pk fetching', async () => {
    mockLoadCryptoKeyFunction.mockImplementationOnce(() => {
      throw new Error();
    });
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    const authStateResult = await testBase.getAuthState({ ...defaultAuthState, headerToken: 'test_header_token' });
    expect(authStateResult).toEqual({
      status: AuthStatus.SignedOut,
      errorReason: AuthErrorReason.PublicKeyFetchError,
    });
  });

  it('returns signed out on development non browser requests', async () => {
    const nonBrowserUserAgent = 'curl';
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    testBase.buildAuthenticatedState = jest.fn();
    mockIsDevelopmentOrStaging.mockImplementationOnce(() => true);
    const authStateResult = await testBase.getAuthState({
      ...defaultAuthState,
      userAgent: nonBrowserUserAgent,
      clientUat: '12345',
    });
    expect(testBase.buildAuthenticatedState).toHaveBeenCalledTimes(0);
    expect(authStateResult).toEqual({
      status: AuthStatus.SignedOut,
      errorReason: AuthErrorReason.HeaderMissingNonBrowser,
    });
  });

  it('returns signed out when no header token is present in cross-origin request', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    mockCrossOrigin.mockImplementationOnce(() => true);
    const authStateResult = await testBase.getAuthState({ ...defaultAuthState, origin: 'https://clerk.dev' });
    expect(mockCrossOrigin).toHaveBeenCalledTimes(1);
    expect(authStateResult).toEqual({ status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingCORS });
  });

  it('returns interstitial when in development we find no clientUat', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
    mockIsDevelopmentOrStaging.mockImplementationOnce(() => true);
    const authStateResult = await testBase.getAuthState({
      ...defaultAuthState,
      fetchInterstitial: mockFetchInterstitial,
    });

    expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
    expect(authStateResult).toEqual({
      status: AuthStatus.Interstitial,
      interstitial: mockInterstitialValue,
      errorReason: AuthErrorReason.UATMissing,
    });
  });

  it('returns signed out on first production load without cookieToken and clientUat', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    mockIsProduction.mockImplementationOnce(() => true);
    const authStateResult = await testBase.getAuthState({ ...defaultAuthState });
    expect(authStateResult).toEqual({ status: AuthStatus.SignedOut, errorReason: AuthErrorReason.CookieAndUATMissing });
  });

  it('returns interstitial on development after auth action on Clerk-hosted UIs', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
    mockIsDevelopmentOrStaging.mockImplementationOnce(() => true);
    mockCrossOrigin.mockImplementationOnce(() => true);
    const authStateResult = await testBase.getAuthState({
      ...defaultAuthState,
      fetchInterstitial: mockFetchInterstitial,
      referrer: 'https://random.clerk.hosted.ui',
      clientUat: '12345',
    });

    expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
    expect(authStateResult).toEqual({
      status: AuthStatus.Interstitial,
      interstitial: mockInterstitialValue,
      errorReason: AuthErrorReason.CrossOriginReferrer,
    });
  });

  it('returns signed out on clientUat signaled as 0', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    mockIsProduction.mockImplementationOnce(() => true);
    const authStateResult = await testBase.getAuthState({ ...defaultAuthState, clientUat: '0' });
    expect(authStateResult).toEqual({ status: AuthStatus.SignedOut, errorReason: AuthErrorReason.StandardOut });
  });

  it('returns interstitial when on production and have a valid clientUat value without cookieToken', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    mockIsProduction.mockImplementationOnce(() => true);
    mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
    const authStateResult = await testBase.getAuthState({
      ...defaultAuthState,
      clientUat: '12345',
      fetchInterstitial: mockFetchInterstitial,
    });
    expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
    expect(authStateResult).toEqual({
      status: AuthStatus.Interstitial,
      interstitial: mockInterstitialValue,
      errorReason: AuthErrorReason.CookieMissing,
    });
  });

  it('returns sessionClaims cookieToken is available and clientUat is valid', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
    const validJwtToken = { sessionClaims: { iat: Number(new Date()) + 50 } };
    testBase.buildAuthenticatedState = jest.fn().mockImplementationOnce(() => validJwtToken);
    const authStateResult = await testBase.getAuthState({
      ...defaultAuthState,
      clientUat: String(new Date().getTime()),
      cookieToken: 'valid_token',
    });
    expect(authStateResult).toEqual(validJwtToken);
  });

  it('returns interstitial cookieToken is valid but token iat is in past date', async () => {
    const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);

    const validJwtToken = { sessionClaims: { iat: Number(new Date()) - 50 } };
    testBase.buildAuthenticatedState = jest.fn().mockImplementationOnce(() => validJwtToken);
    mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
    const authStateResult = await testBase.getAuthState({
      ...defaultAuthState,
      clientUat: String(new Date().getTime()),
      cookieToken: 'valid_token',
      fetchInterstitial: mockFetchInterstitial,
    });
    expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
    expect(authStateResult).toEqual({
      status: AuthStatus.Interstitial,
      interstitial: mockInterstitialValue,
      errorReason: AuthErrorReason.CookieOutDated,
    });
  });
});
