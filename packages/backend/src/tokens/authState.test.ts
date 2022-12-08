import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { jsonOk } from '../util/mockFetch';
import { type AuthStateOptions, getAuthState } from './authState';
import { mockJwks, mockJwt, mockJwtPayload } from './fixtures';

export default (QUnit: QUnit) => {
  const { module, test, todo } = QUnit;

  /* An otherwise bare state on a request. */
  const defaultMockAuthState: AuthStateOptions = {
    apiKey: 'deadbeef',
    apiUrl: 'https://api.clerk.test',
    apiVersion: 'v1',
    frontendApi: 'cafe.babe.clerk.ts',
    host: 'example.com',
    userAgent: 'Mozilla/TestAgent',
    skipJwksCache: true,
  };

  module('tokens.getAuthState(options)', hooks => {
    let fakeClock;
    let fakeFetch;

    hooks.beforeEach(() => {
      fakeClock = sinon.useFakeTimers(new Date(mockJwtPayload.iat * 1000).getTime());
      fakeFetch = sinon.stub(runtime, 'fetch');
      fakeFetch.onCall(0).returns(jsonOk(mockJwks));
    });

    hooks.afterEach(() => {
      fakeClock.restore();
      fakeFetch.restore();
      sinon.restore();
    });

    todo('throws if jwk fails to load from local', assert => {
      assert.true(true);
    });

    todo('throws if jwk fails to load from remote', assert => {
      assert.true(true);
    });

    test('returns the signed in state when a valid token is in HTTP Authorization header', async assert => {
      const authState = await getAuthState({
        ...defaultMockAuthState,
        headerToken: mockJwt,
      });

      assert.propContains(authState, {
        frontendApi: 'cafe.babe.clerk.ts',
        isSignedIn: true,
        isInterstitial: false,
        sessionClaims: mockJwtPayload,
        sessionId: mockJwtPayload.sid,
        session: undefined,
        userId: mockJwtPayload.sub,
        user: undefined,
        orgId: undefined,
        orgRole: undefined,
        orgSlug: undefined,
        organization: undefined,
        getToken: {},
      });
    });

    todo(
      'returns the full signed in state when a valid token is in HTTP Authorization header, the organizations are enabled and the resources are loaded',
      assert => {
        assert.true(true);
      },
    );

    test('returns the signed out state when a token with invalid authorizedParties is in HTTP Authorization header', async assert => {
      const authState = await getAuthState({
        ...defaultMockAuthState,
        headerToken: mockJwt,
        authorizedParties: ['whatever'],
      });

      assert.propEqual(authState, {
        frontendApi: 'cafe.babe.clerk.ts',
        isSignedIn: false,
        isInterstitial: false,
        reason: 'token-verification-error',
        message:
          'Invalid JWT Authorized party claim (azp) "https://accounts.inspired.puma-74.lcl.dev". Expected "whatever". (reason=token-invalid-authorized-parties, token-carrier=header)',
        sessionClaims: null,
        sessionId: null,
        session: null,
        actor: null,
        userId: null,
        user: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        organization: null,
        getToken: {},
      });
    });

    test('returns the signed out state when an invalid token is in HTTP Authorization header', async assert => {
      const authState = await getAuthState({
        ...defaultMockAuthState,
        headerToken: 'test_header_token',
      });

      assert.propEqual(authState, {
        frontendApi: 'cafe.babe.clerk.ts',
        isSignedIn: false,
        isInterstitial: false,
        message:
          'Invalid JWT form. A JWT consists of three parts separated by dots. (reason=token-invalid, token-carrier=header)',
        reason: 'token-verification-error',
        sessionClaims: null,
        sessionId: null,
        session: null,
        actor: null,
        userId: null,
        user: null,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        organization: null,
        getToken: {},
      });
    });
  });
};

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
