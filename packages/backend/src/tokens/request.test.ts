import type QUnit from 'qunit';
import sinon from 'sinon';

import runtime from '../runtime';
import { jsonOk } from '../util/mockFetch';
import { AuthErrorReason, type AuthReason, AuthStatus, type RequestState } from './authStatus';
import { TokenVerificationErrorReason } from './errors';
import { mockInvalidSignatureJwt, mockJwks, mockJwt, mockJwtPayload, mockMalformedJwt } from './fixtures';
import type { AuthenticateRequestOptions } from './request';
import { authenticateRequest, loadOptionsFromHeaders } from './request';

function assertSignedOut(
  assert,
  requestState: RequestState,
  expectedState: {
    reason: AuthReason;
    isSatellite?: boolean;
    domain?: string;
    signInUrl?: string;
    message?: string;
  },
) {
  assert.propEqual(requestState, {
    publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    proxyUrl: '',
    status: AuthStatus.SignedOut,
    isSignedIn: false,
    isInterstitial: false,
    isUnknown: false,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    message: '',
    toAuth: {},
    ...expectedState,
  });
}

function assertSignedOutToAuth(assert, requestState: RequestState) {
  assert.propContains(requestState.toAuth(), {
    sessionClaims: null,
    sessionId: null,
    session: null,
    userId: null,
    user: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    organization: null,
    getToken: {},
  });
}

function assertInterstitial(
  assert,
  requestState: RequestState,
  expectedState: {
    reason: AuthReason;
    isSatellite?: boolean;
    domain?: string;
    signInUrl?: string;
  },
) {
  assert.propContains(requestState, {
    publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    proxyUrl: '',
    status: AuthStatus.Interstitial,
    isSignedIn: false,
    isInterstitial: true,
    isUnknown: false,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    toAuth: {},
    ...expectedState,
  });
}

function assertUnknown(assert, requestState: RequestState, reason: AuthReason) {
  assert.propContains(requestState, {
    publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    status: AuthStatus.Unknown,
    isSignedIn: false,
    isInterstitial: false,
    isUnknown: true,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    reason,
    toAuth: {},
  });
}

function assertSignedInToAuth(assert, requestState: RequestState) {
  assert.propContains(requestState.toAuth(), {
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
}

function assertSignedIn(
  assert,
  requestState: RequestState,
  expectedState?: {
    isSatellite?: boolean;
    signInUrl?: string;
    domain?: string;
  },
) {
  assert.propContains(requestState, {
    publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    proxyUrl: '',
    status: AuthStatus.SignedIn,
    isSignedIn: true,
    isInterstitial: false,
    isUnknown: false,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    ...expectedState,
  });
}

export default (QUnit: QUnit) => {
  const { module, test, skip } = QUnit;

  /* An otherwise bare state on a request. */
  const defaultMockAuthenticateRequestOptions = {
    secretKey: 'deadbeef',
    apiUrl: 'https://api.clerk.test',
    apiVersion: 'v1',
    publishableKey: 'pk_test_Y2xlcmsuaW5jbHVkZWQua2F0eWRpZC05Mi5sY2wuZGV2JA',
    proxyUrl: '',
    host: 'example.com',
    userAgent: 'Mozilla/TestAgent',
    skipJwksCache: true,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    searchParams: new URLSearchParams(),
  } satisfies AuthenticateRequestOptions;

  module('tokens.authenticateRequest(options)', hooks => {
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

    //
    // HTTP Authorization exists
    //

    test('returns signed out state if jwk fails to load from remote', async assert => {
      fakeFetch.onCall(0).returns(jsonOk({}));
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        headerToken: mockJwt,
        skipJwksCache: false,
      });

      const errMessage =
        'The JWKS endpoint did not contain any signing keys. Contact support@clerk.com. Contact support@clerk.com (reason=jwk-remote-failed-to-load, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('headerToken: returns signed in state when a valid token [1y.2y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        headerToken: mockJwt,
      });

      assertSignedIn(assert, requestState);
      assertSignedInToAuth(assert, requestState);
    });

    // todo(
    //   'headerToken: returns full signed in state when a valid token with organizations enabled and resources loaded [1y.2y]',
    //   assert => {
    //     assert.true(true);
    //   },
    // );

    test('headerToken: returns signed out state when a token with invalid authorizedParties [1y.2n]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        headerToken: mockJwt,
        authorizedParties: ['whatever'],
      });

      const errMessage =
        'Invalid JWT Authorized party claim (azp) "https://accounts.inspired.puma-74.lcl.dev". Expected "whatever". (reason=token-invalid-authorized-parties, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('headerToken: returns interstitial state when token expired [1y.2n]', async assert => {
      // advance clock for 1 hour
      fakeClock.tick(3600 * 1000);

      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        headerToken: mockJwt,
      });

      assertUnknown(assert, requestState, TokenVerificationErrorReason.TokenExpired);
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('headerToken: returns signed out state when invalid signature [1y.2n]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        headerToken: mockInvalidSignatureJwt,
      });

      const errMessage = 'JWT signature is invalid. (reason=token-invalid-signature, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenInvalidSignature,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('headerToken: returns signed out state when an malformed token [1y.1n]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        headerToken: 'test_header_token',
      });

      const errMessage =
        'Invalid JWT form. A JWT consists of three parts separated by dots. (reason=token-invalid, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenInvalid,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    //
    // HTTP Authorization does NOT exist and __session cookie exists
    //

    test('cookieToken: returns signed out state when cross-origin request [2y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        origin: 'https://clerk.com',
        forwardedProto: 'http',
        cookieToken: mockJwt,
      });

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.HeaderMissingCORS,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns signed out when non browser requests in development [3y]', async assert => {
      const nonBrowserUserAgent = 'curl';
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'test_deadbeef',
        userAgent: nonBrowserUserAgent,
        clientUat: '12345',
        cookieToken: mockJwt,
      });

      assertSignedOut(assert, requestState, { reason: AuthErrorReason.HeaderMissingNonBrowser });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns interstitial when clientUat is missing or equals to 0 and is satellite and not is synced [11y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'deadbeef',
        clientUat: '0',
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
      });

      assertInterstitial(assert, requestState, {
        reason: AuthErrorReason.SatelliteCookieNeedsSyncing,
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
      });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out is satellite but a non-browser request [11y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'deadbeef',
        clientUat: '0',
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
        userAgent: '[some-agent]',
      });

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.SatelliteCookieNeedsSyncing,
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('returns interstitial when app is satellite, returns from primary and is dev instance [13y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'sk_test_deadbeef',
        signInUrl: 'http://primary.example/sign-in',
        isSatellite: true,
        domain: 'satellite.example',
      });

      assertInterstitial(assert, requestState, {
        reason: AuthErrorReason.SatelliteCookieNeedsSyncing,
        isSatellite: true,
        domain: 'satellite.example',
        signInUrl: 'http://primary.example/sign-in',
      });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns interstitial when app is not satellite and responds to syncing on dev instances[12y]', async assert => {
      const sp = new URLSearchParams();
      sp.set('__clerk_satellite_url', 'http://localhost:3000');
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'sk_test_deadbeef',
        clientUat: '12345',
        isSatellite: false,
        cookieToken: mockJwt,
        searchParams: sp,
      });

      assertInterstitial(assert, requestState, {
        reason: AuthErrorReason.PrimaryRespondsToSyncing,
      });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out when no cookieToken and no clientUat in production [4y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'live_deadbeef',
      });

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.CookieAndUATMissing,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns interstitial when no clientUat in development [5y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        secretKey: 'test_deadbeef',
      });

      assertInterstitial(assert, requestState, { reason: AuthErrorReason.CookieUATMissing });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    // Omit because it caused view-source to always returns the interstitial in development mode (there's no referrer for view-source)
    skip('cookieToken: returns interstitial when no referrer in development [6y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        secretKey: 'test_deadbeef',
        clientUat: '12345',
      });

      assertInterstitial(assert, requestState, { reason: AuthErrorReason.CrossOriginReferrer });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns interstitial when crossOriginReferrer in development [6y]', async assert => {
      // Scenario: after auth action on Clerk-hosted UIs
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        secretKey: 'test_deadbeef',
        clientUat: '12345',
        referrer: 'https://clerk.com',
      });

      assertInterstitial(assert, requestState, { reason: AuthErrorReason.CrossOriginReferrer });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns undefined when crossOriginReferrer in development and is satellite [6n]', async assert => {
      // Scenario: after auth action on Clerk-hosted UIs
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        secretKey: 'pk_test_deadbeef',
        clientUat: '12345',
        referrer: 'https://clerk.com',
        isSatellite: true,
        signInUrl: 'https://localhost:3000/sign-in/',
        domain: 'localhost:3001',
      });

      assertSignedIn(assert, requestState, {
        isSatellite: true,
        signInUrl: 'https://localhost:3000/sign-in/',
        domain: 'localhost:3001',
      });
      assertSignedInToAuth(assert, requestState);
    });

    // // Note: The user is definitely signed out here so this interstitial can be
    // // eliminated. We can keep it if we're worried about something inspecting
    // // the __session cookie manually
    skip('cookieToken: returns interstitial when clientUat = 0 [7y]', assert => {
      assert.true(true);
    });

    test('cookieToken: returns interstitial when clientUat > 0 and no cookieToken [8y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'deadbeef',
        clientUat: '1234',
      });

      assertInterstitial(assert, requestState, { reason: AuthErrorReason.CookieMissing });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out when clientUat = 0 and no cookieToken [9y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        clientUat: '0',
      });

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.StandardSignedOut,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns interstitial when clientUat > cookieToken.iat [10n]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        clientUat: `${mockJwtPayload.iat + 10}`,
      });

      assertInterstitial(assert, requestState, { reason: AuthErrorReason.CookieOutDated });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out when cookieToken.iat >= clientUat and malformed token [10y.1n]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockMalformedJwt,
        clientUat: `${mockJwtPayload.iat - 10}`,
      });

      const errMessage =
        'Subject claim (sub) is required and must be a string. Received undefined. Make sure that this is a valid Clerk generate JWT. (reason=token-verification-failed, token-carrier=cookie)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns signed in when cookieToken.iat >= clientUat and valid token [10y.2y]', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        clientUat: `${mockJwtPayload.iat - 10}`,
      });

      assertSignedIn(assert, requestState);
      assertSignedInToAuth(assert, requestState);
    });

    // todo(
    //   'cookieToken: returns signed in when cookieToken.iat >= clientUat and expired token and ssrToken [10y.2n.1y]',
    //   assert => {
    //     assert.true(true);
    //   },
    // );

    test('cookieToken: returns interstitial when cookieToken.iat >= clientUat and expired token [10y.2n.1n]', async assert => {
      // advance clock for 1 hour
      fakeClock.tick(3600 * 1000);

      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        cookieToken: mockJwt,
        clientUat: `${mockJwtPayload.iat - 10}`,
      });

      assertInterstitial(assert, requestState, { reason: TokenVerificationErrorReason.TokenExpired });
      assert.true(/^JWT is expired/.test(requestState.message || ''));
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed in for Amazon Cloudfront userAgent', async assert => {
      const requestState = await authenticateRequest({
        ...defaultMockAuthenticateRequestOptions,
        secretKey: 'test_deadbeef',
        userAgent: 'Amazon CloudFront',
        clientUat: '12345',
        cookieToken: mockJwt,
      });

      assertSignedIn(assert, requestState);
      assertSignedInToAuth(assert, requestState);
    });
  });

  module('tokens.loadOptionsFromHeaders', () => {
    const defaultOptions = {
      headerToken: '',
      origin: '',
      host: '',
      forwardedHost: '',
      forwardedPort: '',
      forwardedProto: '',
      referrer: '',
      userAgent: '',
    };

    test('returns options even if headers exist', async assert => {
      const headers = key => (key === 'x-forwarded-proto' ? 'https' : '');
      const options = { forwardedProto: 'http' };
      assert.propEqual(loadOptionsFromHeaders(options, headers), {
        ...defaultOptions,
        forwardedProto: 'http',
      });
    });

    test('returns forwarded headers from headers', async assert => {
      const headersData = { 'x-forwarded-proto': 'http', 'x-forwarded-port': '80', 'x-forwarded-host': 'example.com' };
      const headers = key => headersData[key] || '';

      assert.propEqual(loadOptionsFromHeaders({}, headers), {
        ...defaultOptions,
        forwardedProto: 'http',
        forwardedPort: '80',
        forwardedHost: 'example.com',
      });
    });

    test('returns Cloudfront forwarded proto from headers even if forwarded proto header exists', async assert => {
      const headersData = {
        'cloudfront-forwarded-proto': 'https',
        'x-forwarded-proto': 'http',
        'x-forwarded-port': '80',
        'x-forwarded-host': 'example.com',
      };
      const headers = key => headersData[key] || '';

      assert.propEqual(loadOptionsFromHeaders({}, headers), {
        ...defaultOptions,
        forwardedProto: 'https',
        forwardedPort: '80',
        forwardedHost: 'example.com',
      });
    });
  });
};
