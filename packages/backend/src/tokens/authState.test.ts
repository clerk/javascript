import nock from 'nock';

import { type AuthStateParams, getAuthState } from './authState';
import { mockJwks, mockJwt, mockJwtPayload } from './fixtures';

/* An otherwise bare state on a request. */
const defaultMockAuthState: AuthStateParams = {
  apiKey: 'deadbeef',
  apiUrl: 'https://api.clerk.test',
  host: 'example.com',
  userAgent: 'Mozilla/TestAgent',
};

describe('getAuthState', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  afterEach(() => {
    nock.cleanAll();
  });

  it.todo('throws if jwk fails to load from local');

  it.todo('throws if jwk fails to load from remote');

  describe('with token in HTTP Authorization header', () => {
    describe('when token verification is successful', () => {
      // Notice: The modern fake timers of Jest can't be used as crypto uses timers under the hood.
      //
      // So instead of
      // jest.useFakeTimers('modern');
      // jest.setSystemTime(new Date(...));
      //
      // we just mock Date.now().

      const RealDate = Date;

      beforeEach(() => {
        nock('https://api.clerk.test').get('/v1/jwks').reply(200, mockJwks);

        global.Date.now = jest.fn(() => new Date(mockJwtPayload.iat * 1000).getTime());
      });
      afterEach(() => {
        global.Date = RealDate;
      });

      it('returns the signed in state', async () => {
        const authState = await getAuthState({
          ...defaultMockAuthState,
          headerToken: mockJwt,
        });

        expect(authState).toEqual({
          session: {
            id: mockJwtPayload.sid,
            orgId: undefined,
            orgRole: undefined,
            userId: mockJwtPayload.sub,
          },
          sessionClaims: mockJwtPayload,
          status: 'signed-in',
        });
      });
    });

    describe('when token verification is not successful', () => {
      it('returns the signed out state with the proper token verification error reason and message', async () => {
        let authState = await getAuthState({
          ...defaultMockAuthState,
          headerToken: mockJwt,
          authorizedParties: ['whatever'],
        });

        expect(authState).toEqual({
          message:
            'Invalid JWT Authorized party claim (azp) "https://accounts.inspired.puma-74.lcl.dev". Expected "whatever". (reason=token-verification-failed, carrier=header)',
          reason: 'token-verification-error',
          status: 'signed-out',
        });

        authState = await getAuthState({
          ...defaultMockAuthState,
          headerToken: 'test_header_token',
        });

        expect(authState).toEqual({
          message:
            'Invalid JWT form. A JWT consists of three parts separated by dots. (reason=token-invalid, carrier=header)',
          reason: 'token-verification-error',
          status: 'signed-out',
        });
      });
    });
  });

  // it('returns signed out on development non browser requests', async () => {
  //   const nonBrowserUserAgent = 'curl';
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   testBase.buildAuthenticatedState = jest.fn();
  //   mockIsDevelopmentOrStaging.mockImplementationOnce(() => true);
  //   const authStateResult = await testBase.getAuthState({
  //     ...defaultAuthState,
  //     userAgent: nonBrowserUserAgent,
  //     clientUat: '12345',
  //   });
  //   expect(testBase.buildAuthenticatedState).toHaveBeenCalledTimes(0);
  //   expect(authStateResult).toEqual({
  //     status: AuthStatus.SignedOut,
  //     errorReason: AuthErrorReason.HeaderMissingNonBrowser,
  //   });
  // });

  // it('returns signed out when no header token is present in cross-origin request', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   mockCrossOrigin.mockImplementationOnce(() => true);
  //   const authStateResult = await testBase.getAuthState({ ...defaultAuthState, origin: 'https://clerk.dev' });
  //   expect(mockCrossOrigin).toHaveBeenCalledTimes(1);
  //   expect(authStateResult).toEqual({ status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingCORS });
  // });

  // it('returns interstitial when in development we find no clientUat', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
  //   mockIsDevelopmentOrStaging.mockImplementationOnce(() => true);
  //   const authStateResult = await testBase.getAuthState({
  //     ...defaultAuthState,
  //     fetchInterstitial: mockFetchInterstitial,
  //   });

  //   expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
  //   expect(authStateResult).toEqual({
  //     status: AuthStatus.Interstitial,
  //     interstitial: mockInterstitialValue,
  //     errorReason: AuthErrorReason.UATMissing,
  //   });
  // });

  // it('returns signed out on first production load without cookieToken and clientUat', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   mockIsProduction.mockImplementationOnce(() => true);
  //   const authStateResult = await testBase.getAuthState({ ...defaultAuthState });
  //   expect(authStateResult).toEqual({ status: AuthStatus.SignedOut, errorReason: AuthErrorReason.CookieAndUATMissing });
  // });

  // it('returns interstitial on development after auth action on Clerk-hosted UIs', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
  //   mockIsDevelopmentOrStaging.mockImplementationOnce(() => true);
  //   mockCrossOrigin.mockImplementationOnce(() => true);
  //   const authStateResult = await testBase.getAuthState({
  //     ...defaultAuthState,
  //     fetchInterstitial: mockFetchInterstitial,
  //     referrer: 'https://random.clerk.hosted.ui',
  //     clientUat: '12345',
  //   });

  //   expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
  //   expect(authStateResult).toEqual({
  //     status: AuthStatus.Interstitial,
  //     interstitial: mockInterstitialValue,
  //     errorReason: AuthErrorReason.CrossOriginReferrer,
  //   });
  // });

  // it('returns signed out on clientUat signaled as 0', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   mockIsProduction.mockImplementationOnce(() => true);
  //   const authStateResult = await testBase.getAuthState({ ...defaultAuthState, clientUat: '0' });
  //   expect(authStateResult).toEqual({ status: AuthStatus.SignedOut, errorReason: AuthErrorReason.StandardSignedOut });
  // });

  // it('returns interstitial when on production and have a valid clientUat value without cookieToken', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   mockIsProduction.mockImplementationOnce(() => true);
  //   mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
  //   const authStateResult = await testBase.getAuthState({
  //     ...defaultAuthState,
  //     clientUat: '12345',
  //     fetchInterstitial: mockFetchInterstitial,
  //   });
  //   expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
  //   expect(authStateResult).toEqual({
  //     status: AuthStatus.Interstitial,
  //     interstitial: mockInterstitialValue,
  //     errorReason: AuthErrorReason.CookieMissing,
  //   });
  // });

  // it('returns sessionClaims cookieToken is available and clientUat is valid', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);
  //   const validJwtToken = { sessionClaims: { iat: Number(new Date()) + 50 } };
  //   testBase.buildAuthenticatedState = jest.fn().mockImplementationOnce(() => validJwtToken);
  //   const authStateResult = await testBase.getAuthState({
  //     ...defaultAuthState,
  //     clientUat: String(new Date().getTime()),
  //     cookieToken: 'valid_token',
  //   });
  //   expect(authStateResult).toEqual(validJwtToken);
  // });

  // it('returns interstitial cookieToken is valid but token iat is in past date', async () => {
  //   const testBase = new Base(mockImportKey, mockVerifySignature, mockBase64Decode, mockLoadCryptoKeyFunction);

  //   const validJwtToken = { sessionClaims: { iat: Number(new Date()) - 50 } };
  //   testBase.buildAuthenticatedState = jest.fn().mockImplementationOnce(() => validJwtToken);
  //   mockFetchInterstitial.mockImplementationOnce(() => Promise.resolve(mockInterstitialValue));
  //   const authStateResult = await testBase.getAuthState({
  //     ...defaultAuthState,
  //     clientUat: String(new Date().getTime()),
  //     cookieToken: 'valid_token',
  //     fetchInterstitial: mockFetchInterstitial,
  //   });
  //   expect(mockFetchInterstitial).toHaveBeenCalledTimes(1);
  //   expect(authStateResult).toEqual({
  //     status: AuthStatus.Interstitial,
  //     interstitial: mockInterstitialValue,
  //     errorReason: AuthErrorReason.CookieOutDated,
  //   });
  // });
});
