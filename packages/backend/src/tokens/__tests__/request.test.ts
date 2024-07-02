import type QUnit from 'qunit';
import sinon from 'sinon';

import { TokenVerificationErrorReason } from '../../errors';
import { mockInvalidSignatureJwt, mockJwks, mockJwt, mockJwtPayload, mockMalformedJwt } from '../../fixtures';
import runtime from '../../runtime';
import { jsonOk } from '../../util/testUtils';
import { AuthErrorReason, type AuthReason, AuthStatus, type RequestState } from '../authStatus';
import { authenticateRequest } from '../request';
import type { AuthenticateRequestOptions } from '../types';

const PK_TEST = 'pk_test_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';
const PK_LIVE = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

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
  assert.propContains(requestState, {
    proxyUrl: '',
    status: AuthStatus.SignedOut,
    isSignedIn: false,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    message: '',
    toAuth: {},
    token: null,
    ...expectedState,
  });
}

function assertSignedOutToAuth(assert, requestState: RequestState) {
  assert.propContains(requestState.toAuth(), {
    sessionClaims: null,
    sessionId: null,
    userId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    getToken: {},
  });
}

function assertHandshake(
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
    proxyUrl: '',
    status: AuthStatus.Handshake,
    isSignedIn: false,
    isSatellite: false,
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    domain: '',
    toAuth: {},
    token: null,
    ...expectedState,
  });
}

function assertSignedInToAuth(assert, requestState: RequestState) {
  assert.propContains(requestState.toAuth(), {
    sessionClaims: mockJwtPayload,
    sessionId: mockJwtPayload.sid,
    userId: mockJwtPayload.sub,
    orgId: undefined,
    orgRole: undefined,
    orgSlug: undefined,
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
    proxyUrl: '',
    status: AuthStatus.SignedIn,
    isSignedIn: true,
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
  const { module, test } = QUnit;

  const defaultHeaders: Record<string, string> = {
    host: 'example.com',
    'user-agent': 'Mozilla/TestAgent',
    'sec-fetch-dest': 'document',
  };

  const mockRequest = (headers = {}, requestUrl = 'http://clerk.com/path') => {
    return new Request(requestUrl, { headers: { ...defaultHeaders, ...headers } });
  };

  /* An otherwise bare state on a request. */
  const mockOptions = (options?) =>
    ({
      secretKey: 'deadbeef',
      apiUrl: 'https://api.clerk.test',
      apiVersion: 'v1',
      publishableKey: PK_TEST,
      proxyUrl: '',
      skipJwksCache: true,
      isSatellite: false,
      signInUrl: '',
      signUpUrl: '',
      afterSignInUrl: '',
      afterSignUpUrl: '',
      domain: '',
      ...options,
    }) satisfies AuthenticateRequestOptions;

  const mockRequestWithHeaderAuth = (headers?, requestUrl?) => {
    return mockRequest({ authorization: mockJwt, ...headers }, requestUrl);
  };

  const mockRequestWithCookies = (headers?, cookies = {}, requestUrl?) => {
    const cookieStr = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join(';');

    return mockRequest({ cookie: cookieStr, ...headers }, requestUrl);
  };

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

      const requestState = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());

      const errMessage =
        'The JWKS endpoint did not contain any signing keys. Contact support@clerk.com. Contact support@clerk.com (reason=jwk-remote-failed-to-load, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('headerToken: returns signed in state when a valid token [1y.2y]', async assert => {
      const requestState = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());

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
      const requestState = await authenticateRequest(
        mockRequestWithHeaderAuth(),
        mockOptions({
          authorizedParties: ['whatever'],
        }),
      );

      const errMessage =
        'Invalid JWT Authorized party claim (azp) "https://accounts.inspired.puma-74.lcl.dev". Expected "whatever". (reason=token-invalid-authorized-parties, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('headerToken: returns handshake state when token expired [1y.2n]', async assert => {
      // advance clock for 1 hour
      fakeClock.tick(3600 * 1000);

      const requestState = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());

      assertHandshake(assert, requestState, { reason: AuthErrorReason.SessionTokenOutdated });
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('headerToken: returns signed out state when invalid signature [1y.2n]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithHeaderAuth({
          authorization: mockInvalidSignatureJwt,
        }),
        mockOptions(),
      );

      const errMessage = 'JWT signature is invalid. (reason=token-invalid-signature, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenInvalidSignature,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('headerToken: returns signed out state when an malformed token [1y.1n]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithHeaderAuth({ authorization: 'test_header_token' }),
        mockOptions(),
      );

      const errMessage =
        'Invalid JWT form. A JWT consists of three parts separated by dots. (reason=token-invalid, token-carrier=header)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenInvalid,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns handshake when clientUat is missing or equals to 0 and is satellite and not is synced [11y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {},
          {
            __client_uat: '0',
          },
        ),
        mockOptions({
          secretKey: 'deadbeef',
          clientUat: '0',
          isSatellite: true,
          signInUrl: 'https://primary.dev/sign-in',
          domain: 'satellite.dev',
        }),
      );

      assertHandshake(assert, requestState, {
        reason: AuthErrorReason.SatelliteCookieNeedsSyncing,
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
      });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out is satellite but a non-browser request [11y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {
            ...defaultHeaders,
            'sec-fetch-dest': 'empty',
            'user-agent': '[some-agent]',
          },
          { __client_uat: '0' },
        ),
        mockOptions({
          publishableKey: PK_LIVE,
          secretKey: 'deadbeef',
          isSatellite: true,
          signInUrl: 'https://primary.dev/sign-in',
          domain: 'satellite.dev',
        }),
      );

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.SessionTokenAndUATMissing,
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns handshake when app is satellite, returns from primary and is dev instance [13y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies({}, {}, `http://satellite.example/path?__clerk_synced=true&__clerk_db_jwt=${mockJwt}`),
        mockOptions({
          secretKey: 'sk_test_deadbeef',
          signInUrl: 'http://primary.example/sign-in',
          isSatellite: true,
          domain: 'satellite.example',
        }),
      );

      assertHandshake(assert, requestState, {
        reason: AuthErrorReason.DevBrowserSync,
        isSatellite: true,
        domain: 'satellite.example',
        signInUrl: 'http://primary.example/sign-in',
      });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns handshake when app is not satellite and responds to syncing on dev instances[12y]', async assert => {
      const sp = new URLSearchParams();
      sp.set('__clerk_redirect_url', 'http://localhost:3000');
      const requestUrl = `http://clerk.com/path?${sp.toString()}`;
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          { ...defaultHeaders, 'sec-fetch-dest': 'document' },
          { __client_uat: '12345', __session: mockJwt },
          requestUrl,
        ),
        mockOptions({ secretKey: 'sk_test_deadbeef', isSatellite: false }),
      );

      assertHandshake(assert, requestState, {
        reason: AuthErrorReason.PrimaryRespondsToSyncing,
      });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out when no cookieToken and no clientUat in production [4y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(),
        mockOptions({
          publishableKey: 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA',
          secretKey: 'live_deadbeef',
        }),
      );

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.SessionTokenAndUATMissing,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns handshake when no dev browser in development', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies({}, { __session: mockJwt }),
        mockOptions({
          secretKey: 'test_deadbeef',
        }),
      );

      assertHandshake(assert, requestState, { reason: AuthErrorReason.DevBrowserMissing });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns handshake when no clientUat in development [5y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies({}, { __clerk_db_jwt: 'deadbeef', __session: mockJwt }),
        mockOptions({
          secretKey: 'test_deadbeef',
        }),
      );

      assertHandshake(assert, requestState, { reason: AuthErrorReason.SessionTokenWithoutClientUAT });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns handshake when no cookies in development [5y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies({}),
        mockOptions({
          secretKey: 'test_deadbeef',
        }),
      );

      assertHandshake(assert, requestState, { reason: AuthErrorReason.DevBrowserMissing });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signedIn when satellite but valid token and clientUat', async assert => {
      // Scenario: after auth action on Clerk-hosted UIs
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {
            ...defaultHeaders,
            'sec-fetch-dest': 'empty',
            // this is not a typo, it's intentional to be `referer` to match HTTP header key
            referer: 'https://clerk.com',
          },
          { __clerk_db_jwt: 'deadbeef', __client_uat: '12345', __session: mockJwt },
        ),
        mockOptions({
          secretKey: 'pk_test_deadbeef',
          isSatellite: true,
          signInUrl: 'https://localhost:3000/sign-in/',
          domain: 'localhost:3001',
        }),
      );

      assertSignedIn(assert, requestState, {
        isSatellite: true,
        signInUrl: 'https://localhost:3000/sign-in/',
        domain: 'localhost:3001',
      });
      assertSignedInToAuth(assert, requestState);
    });

    test('cookieToken: returns handshake when clientUat > 0 and no cookieToken [8y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies({}, { __client_uat: '12345' }),
        mockOptions({ secretKey: 'deadbeef', publishableKey: PK_LIVE }),
      );

      assertHandshake(assert, requestState, { reason: AuthErrorReason.ClientUATWithoutSessionToken });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out when clientUat = 0 and no cookieToken [9y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies({}, { __client_uat: '0' }),
        mockOptions({ publishableKey: PK_LIVE }),
      );

      assertSignedOut(assert, requestState, {
        reason: AuthErrorReason.SessionTokenAndUATMissing,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns handshake when clientUat > cookieToken.iat [10n]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {},
          {
            __clerk_db_jwt: 'deadbeef',
            __client_uat: `${mockJwtPayload.iat + 10}`,
            __session: mockJwt,
          },
        ),
        mockOptions(),
      );

      assertHandshake(assert, requestState, { reason: AuthErrorReason.SessionTokenOutdated });
      assert.equal(requestState.message, '');
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed out when cookieToken.iat >= clientUat and malformed token [10y.1n]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {},
          {
            __clerk_db_jwt: 'deadbeef',
            __client_uat: `${mockJwtPayload.iat - 10}`,
            __session: mockMalformedJwt,
          },
        ),
        mockOptions(),
      );

      const errMessage =
        'Subject claim (sub) is required and must be a string. Received undefined. Make sure that this is a valid Clerk generate JWT. (reason=token-verification-failed, token-carrier=cookie)';
      assertSignedOut(assert, requestState, {
        reason: TokenVerificationErrorReason.TokenVerificationFailed,
        message: errMessage,
      });
      assertSignedOutToAuth(assert, requestState);
    });

    test('cookieToken: returns signed in when cookieToken.iat >= clientUat and valid token [10y.2y]', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {},
          {
            __clerk_db_jwt: 'deadbeef',
            __client_uat: `${mockJwtPayload.iat - 10}`,
            __session: mockJwt,
          },
        ),
        mockOptions(),
      );

      assertSignedIn(assert, requestState);
      assertSignedInToAuth(assert, requestState);
    });

    // todo(
    //   'cookieToken: returns signed in when cookieToken.iat >= clientUat and expired token and ssrToken [10y.2n.1y]',
    //   assert => {
    //     assert.true(true);
    //   },
    // );

    test('cookieToken: returns handshake when cookieToken.iat >= clientUat and expired token [10y.2n.1n]', async assert => {
      // advance clock for 1 hour
      fakeClock.tick(3600 * 1000);

      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {},
          {
            __clerk_db_jwt: 'deadbeef',
            __client_uat: `${mockJwtPayload.iat - 10}`,
            __session: mockJwt,
          },
        ),
        mockOptions(),
      );

      assertHandshake(assert, requestState, { reason: AuthErrorReason.SessionTokenOutdated });
      assert.true(/^JWT is expired/.test(requestState.message || ''));
      assert.strictEqual(requestState.toAuth(), null);
    });

    test('cookieToken: returns signed in for Amazon Cloudfront userAgent', async assert => {
      const requestState = await authenticateRequest(
        mockRequestWithCookies(
          {
            ...defaultHeaders,
            'user-agent': 'Amazon CloudFront',
          },
          { __client_uat: `12345`, __session: mockJwt },
        ),
        mockOptions({ secretKey: 'test_deadbeef', publishableKey: PK_LIVE }),
      );

      assertSignedIn(assert, requestState);
      assertSignedInToAuth(assert, requestState);
    });
  });
};
