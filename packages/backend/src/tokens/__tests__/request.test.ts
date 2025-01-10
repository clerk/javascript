import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TokenVerificationErrorReason } from '../../errors';
import {
  mockExpiredJwt,
  mockInvalidSignatureJwt,
  mockJwks,
  mockJwt,
  mockJwtPayload,
  mockMalformedJwt,
} from '../../fixtures';
import { server } from '../../mock-server';
import type { AuthReason } from '../authStatus';
import { AuthErrorReason, AuthStatus } from '../authStatus';
import {
  authenticateRequest,
  computeOrganizationSyncTargetMatchers,
  getOrganizationSyncTarget,
  type OrganizationSyncTarget,
  RefreshTokenErrorReason,
} from '../request';
import type { AuthenticateRequestOptions, OrganizationSyncOptions } from '../types';

const PK_TEST = 'pk_test_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';
const PK_LIVE = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

interface CustomMatchers<R = unknown> {
  toBeSignedOut: (expected: unknown) => R;
  toBeSignedOutToAuth: () => R;
  toMatchHandshake: (expected: unknown) => R;
  toBeSignedIn: (expected?: unknown) => R;
  toBeSignedInToAuth: () => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeSignedOut(
    received,
    expected: {
      domain?: string;
      isSatellite?: boolean;
      message?: string;
      reason: AuthReason;
      signInUrl?: string;
    },
  ) {
    const pass =
      received.afterSignInUrl === '' &&
      received.afterSignUpUrl === '' &&
      received.domain === (expected.domain ?? '') &&
      received.isSatellite === (expected.isSatellite ?? false) &&
      received.isSignedIn === false &&
      received.message === (expected.message ?? '') &&
      received.proxyUrl === '' &&
      received.reason === expected.reason &&
      received.signInUrl === (expected.signInUrl ?? '') &&
      received.signUpUrl === '' &&
      received.status === AuthStatus.SignedOut &&
      // JSON.stringify(received.toAuth) === JSON.stringify(expected.toAuth) &&
      received.token === null;

    if (pass) {
      return {
        message: () => `expected not to be signed out`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to be signed out, but got ${received.status}`,
        pass: false,
      };
    }
  },
  toBeSignedOutToAuth(received) {
    const pass =
      !received.orgId &&
      !received.orgRole &&
      !received.orgSlug &&
      !received.sessionClaims &&
      !received.sessionId &&
      !received.userId;

    if (pass) {
      return {
        message: () => `expected user not to be signed out`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected user to be signed out`,
        pass: false,
      };
    }
  },
  toMatchHandshake(
    received,
    expected: {
      domain?: string;
      isSatellite?: boolean;
      reason: AuthReason;
      signInUrl?: string;
    },
  ) {
    const hasCacheControl = !!received?.headers?.get('cache-control');

    expect(hasCacheControl).toBe(true);

    const errors: string[] = [];

    if (received.afterSignInUrl !== '') {
      errors.push('afterSignInUrl');
    }

    if (received.afterSignUpUrl !== '') {
      errors.push('afterSignUpUrl');
    }

    if (received.domain !== (expected?.domain ?? '')) {
      errors.push('domain');
    }

    if (received.isSatellite !== (expected?.isSatellite ?? false)) {
      errors.push('isSatellite');
    }

    if (received.isSignedIn !== false) {
      errors.push('isSignedIn');
    }

    if (received.proxyUrl !== '') {
      errors.push('proxyUrl');
    }

    if (received.signInUrl !== (expected?.signInUrl ?? '')) {
      errors.push('signInUrl');
    }

    if (received.signUpUrl !== '') {
      errors.push('signUpUrl');
    }

    if (received.status !== AuthStatus.Handshake) {
      errors.push('status');
    }

    if (received.token !== null) {
      errors.push('token');
    }

    if (errors.length === 0) {
      return {
        message: () => `matches handshake state`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to match handshake state but found errors: ${errors.join(', ')}`,
        pass: false,
      };
    }
  },
  toBeSignedIn(
    received,
    expected: {
      domain?: string;
      isSatellite?: boolean;
      signInUrl?: string;
    },
  ) {
    const pass =
      received.afterSignInUrl === '' &&
      received.afterSignUpUrl === '' &&
      received.domain === (expected?.domain ?? '') &&
      received.isSatellite === (expected?.isSatellite ?? false) &&
      received.isSignedIn === true &&
      received.proxyUrl === '' &&
      received.signInUrl === (expected?.signInUrl ?? '') &&
      received.signUpUrl === '' &&
      received.status === AuthStatus.SignedIn;

    if (pass) {
      return {
        message: () => `expected not to be signed in`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to be signed in, but got ${received.status}`,
        pass: false,
      };
    }
  },
  toBeSignedInToAuth(received) {
    const pass =
      received.orgId === undefined &&
      received.orgRole === undefined &&
      received.orgSlug === undefined &&
      JSON.stringify(received.sessionClaims) === JSON.stringify(mockJwtPayload) && //  These are objects so they need to be serialized
      received.sessionId === mockJwtPayload.sid &&
      received.userId === mockJwtPayload.sub;

    if (pass) {
      return {
        message: () => `expected not to be signed in to auth`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to be signed in to auth`,
        pass: false,
      };
    }
  },
});

const defaultHeaders: Record<string, string> = {
  host: 'example.com',
  'user-agent': 'Mozilla/TestAgent',
  'sec-fetch-dest': 'document',
};

const mockRequest = (headers = {}, requestUrl = 'http://clerk.com/path') => {
  return new Request(requestUrl, { headers: { ...defaultHeaders, ...headers } });
};

/* An otherwise bare state on a request. */
const mockOptions = (options?) => {
  return {
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
  } satisfies AuthenticateRequestOptions;
};

const mockRequestWithHeaderAuth = (headers?, requestUrl?) => {
  return mockRequest({ authorization: mockJwt, ...headers }, requestUrl);
};

const mockRequestWithCookies = (headers?, cookies = {}, requestUrl?) => {
  const cookieStr = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join(';');

  return mockRequest({ cookie: cookieStr, ...headers }, requestUrl);
};

// Tests both getOrganizationSyncTarget and the organizationSyncOptions usage patterns
// that are recommended for typical use.
describe('tokens.getOrganizationSyncTarget(url,options)', _ => {
  type testCase = {
    name: string;
    // When the customer app specifies these orgSyncOptions to middleware...
    whenOrgSyncOptions: OrganizationSyncOptions | undefined;
    // And the path arrives at this URL path...
    whenAppRequestPath: string;
    // A handshake should (or should not) occur:
    thenExpectActivationEntity: OrganizationSyncTarget | null;
  };

  const testCases: testCase[] = [
    {
      name: 'none activates nothing',
      whenOrgSyncOptions: undefined,
      whenAppRequestPath: '/orgs/org_foo',
      thenExpectActivationEntity: null,
    },
    {
      name: 'Can activate an org by ID (basic)',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id'],
      },
      whenAppRequestPath: '/orgs/org_foo',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'org_foo',
      },
    },
    {
      name: 'mimatch activates nothing',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id'],
      },
      whenAppRequestPath: '/personal-account/my-resource',
      thenExpectActivationEntity: null,
    },
    {
      name: 'Can activate an org by ID (recommended matchers)',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id', '/orgs/:id/', '/orgs/:id/(.*)'],
      },
      whenAppRequestPath: '/orgs/org_foo',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'org_foo',
      },
    },
    {
      name: 'Can activate an org by ID with a trailing slash',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id', '/orgs/:id/', '/orgs/:id/(.*)'],
      },
      whenAppRequestPath: '/orgs/org_foo/',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'org_foo',
      },
    },
    {
      name: 'Can activate an org by ID with a trailing path component',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id', '/orgs/:id/', '/orgs/:id/(.*)'],
      },
      whenAppRequestPath: '/orgs/org_foo/nested-resource',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'org_foo',
      },
    },
    {
      name: 'Can activate an org by ID with many trailing path component',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id/(.*)'],
      },
      whenAppRequestPath: '/orgs/org_foo/nested-resource/and/more/deeply/nested/resources',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'org_foo',
      },
    },
    {
      name: 'Can activate an org by ID with an unrelated path token in the prefix',
      whenOrgSyncOptions: {
        organizationPatterns: ['/unknown-thing/:any/orgs/:id'],
      },
      whenAppRequestPath: '/unknown-thing/thing/orgs/org_foo',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'org_foo',
      },
    },
    {
      name: 'Can activate an org by slug',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:slug'],
      },
      whenAppRequestPath: '/orgs/my-org',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationSlug: 'my-org',
      },
    },
    {
      name: 'Can activate the personal account',
      whenOrgSyncOptions: {
        personalAccountPatterns: ['/personal-account'],
      },
      whenAppRequestPath: '/personal-account',
      thenExpectActivationEntity: {
        type: 'personalAccount',
      },
    },
    {
      name: 'ID match precedes slug match',
      whenOrgSyncOptions: {
        organizationPatterns: ['/orgs/:id', '/orgs/:slug'], // bad practice
      },
      whenAppRequestPath: '/orgs/my-org',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationId: 'my-org',
      },
    },
    {
      name: 'org match match precedes personal account',
      whenOrgSyncOptions: {
        personalAccountPatterns: ['/', '/(.*)'], // Personal account captures everything
        organizationPatterns: ['/orgs/:slug'], // that isn't org scoped
      },
      whenAppRequestPath: '/orgs/my-org',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationSlug: 'my-org',
      },
    },
    {
      name: 'personal account may contain path tokens',
      whenOrgSyncOptions: {
        personalAccountPatterns: ['/user/:any', '/user/:any/(.*)'],
      },
      whenAppRequestPath: '/user/123/home',
      thenExpectActivationEntity: {
        type: 'personalAccount',
      },
    },
    {
      name: 'All of the config at once',
      whenOrgSyncOptions: {
        organizationPatterns: [
          '/orgs-by-id/:id',
          '/orgs-by-id/:id/(.*)',
          '/orgs-by-slug/:slug',
          '/orgs-by-slug/:slug/(.*)',
        ],
        personalAccountPatterns: ['/personal-account', '/personal-account/(.*)'],
      },
      whenAppRequestPath: '/orgs-by-slug/org_bar/sub-resource',
      thenExpectActivationEntity: {
        type: 'organization',
        organizationSlug: 'org_bar',
      },
    },
  ];

  test.each(testCases)('$name', ({ name, whenOrgSyncOptions, whenAppRequestPath, thenExpectActivationEntity }) => {
    if (!name) {
      return;
    }

    const path = new URL(`http://localhost:3000${whenAppRequestPath}`);
    const matchers = computeOrganizationSyncTargetMatchers(whenOrgSyncOptions);
    const toActivate = getOrganizationSyncTarget(path, whenOrgSyncOptions, matchers);
    expect(toActivate).toEqual(thenExpectActivationEntity);
  });
});

describe('tokens.authenticateRequest(options)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockJwtPayload.iat * 1000));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  //
  // HTTP Authorization exists
  //

  test('returns signed out state if jwk fails to load from remote', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    const requestState = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());

    const errMessage =
      'The JWKS endpoint did not contain any signing keys. Contact support@clerk.com. Contact support@clerk.com (reason=jwk-remote-failed-to-load, token-carrier=header)';

    expect(requestState).toBeSignedOut({
      reason: TokenVerificationErrorReason.RemoteJWKFailedToLoad,
      message: errMessage,
    });

    expect(requestState.toAuth()).toBeSignedOutToAuth();
  });

  test('headerToken: returns signed in state when a valid token [1y.2y]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    const requestState = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());

    expect(requestState).toBeSignedIn();
    expect(requestState.toAuth()).toBeSignedInToAuth();
  });

  // todo(
  //   'headerToken: returns full signed in state when a valid token with organizations enabled and resources loaded [1y.2y]',
  //   assert => {
  //     assert.true(true);
  //   },
  // );

  test('headerToken: returns signed out state when a token with invalid authorizedParties [1y.2n]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    const requestState = await authenticateRequest(
      mockRequestWithHeaderAuth(),
      mockOptions({
        authorizedParties: ['whatever'],
      }),
    );

    expect(requestState).toBeSignedOut({
      reason: TokenVerificationErrorReason.TokenInvalidAuthorizedParties,
      message:
        'Invalid JWT Authorized party claim (azp) "https://accounts.inspired.puma-74.lcl.dev". Expected "whatever". (reason=token-invalid-authorized-parties, token-carrier=header)',
    });
    expect(requestState).toBeSignedOutToAuth();
  });

  test('headerToken: returns handshake state when token expired [1y.2n]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    // advance clock for 1 hour
    vi.advanceTimersByTime(3600 * 1000);

    const requestState = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());

    expect(requestState).toMatchHandshake({
      reason: `${AuthErrorReason.SessionTokenExpired}-refresh-${RefreshTokenErrorReason.NonEligibleNoCookie}`,
    });

    expect(requestState.toAuth()).toBeNull();
  });

  test('headerToken: returns signed out state when invalid signature [1y.2n]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    const requestState = await authenticateRequest(
      mockRequestWithHeaderAuth({
        authorization: mockInvalidSignatureJwt,
      }),
      mockOptions(),
    );

    const errMessage = 'JWT signature is invalid. (reason=token-invalid-signature, token-carrier=header)';
    expect(requestState).toBeSignedOut({
      reason: TokenVerificationErrorReason.TokenInvalidSignature,
      message: errMessage,
    });
    expect(requestState).toBeSignedOutToAuth();
  });

  test('headerToken: returns signed out state when an malformed token [1y.1n]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithHeaderAuth({ authorization: 'test_header_token' }),
      mockOptions(),
    );

    expect(requestState).toBeSignedOut({
      reason: TokenVerificationErrorReason.TokenInvalid,
      message:
        'Invalid JWT form. A JWT consists of three parts separated by dots. (reason=token-invalid, token-carrier=header)',
    });
    expect(requestState).toBeSignedOutToAuth();
  });

  test('cookieToken: returns handshake when clientUat is missing or equals to 0 and is satellite and not is synced [11y]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

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

    expect(requestState).toMatchHandshake({
      reason: AuthErrorReason.SatelliteCookieNeedsSyncing,
      isSatellite: true,
      signInUrl: 'https://primary.dev/sign-in',
      domain: 'satellite.dev',
    });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: redirects to signInUrl when is satellite dev and not synced', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        {},
        {
          __client_uat: '0',
        },
      ),
      mockOptions({
        secretKey: 'deadbeef',
        publishableKey: PK_TEST,
        clientUat: '0',
        isSatellite: true,
        signInUrl: 'https://primary.dev/sign-in',
        domain: 'satellite.dev',
      }),
    );

    expect(requestState).toMatchHandshake({
      reason: AuthErrorReason.SatelliteCookieNeedsSyncing,
      isSatellite: true,
      signInUrl: 'https://primary.dev/sign-in',
      domain: 'satellite.dev',
    });
    expect(requestState.message).toBe('');
    expect(requestState.headers.get('location')).toMatchInlineSnapshot(
      `"https://primary.dev/sign-in?__clerk_redirect_url=http%3A%2F%2Fexample.com%2Fpath"`,
    );
  });

  test('cookieToken: returns signed out is satellite but a non-browser request [11y]', async () => {
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

    expect(requestState).toBeSignedOut({
      reason: AuthErrorReason.SessionTokenAndUATMissing,
      isSatellite: true,
      signInUrl: 'https://primary.dev/sign-in',
      domain: 'satellite.dev',
    });
    expect(requestState).toBeSignedOutToAuth();
  });

  test('cookieToken: returns handshake when app is satellite, returns from primary and is dev instance [13y]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies({}, {}, `http://satellite.example/path?__clerk_synced=true&__clerk_db_jwt=${mockJwt}`),
      mockOptions({
        secretKey: 'sk_test_deadbeef',
        signInUrl: 'http://primary.example/sign-in',
        isSatellite: true,
        domain: 'satellite.example',
      }),
    );

    expect(requestState).toMatchHandshake({
      reason: AuthErrorReason.DevBrowserSync,
      isSatellite: true,
      domain: 'satellite.example',
      signInUrl: 'http://primary.example/sign-in',
    });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: does not trigger satellite sync if just synced', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        {},
        {
          __clerk_db_jwt: mockJwt,
        },
        `http://satellite.example/path?__clerk_synced=true`,
      ),
      mockOptions({
        secretKey: 'sk_test_deadbeef',
        signInUrl: 'http://primary.example/sign-in',
        isSatellite: true,
        domain: 'satellite.example',
      }),
    );

    expect(requestState).toBeSignedOut({
      reason: AuthErrorReason.SessionTokenAndUATMissing,
      isSatellite: true,
      domain: 'satellite.example',
      signInUrl: 'http://primary.example/sign-in',
    });
    expect(requestState.toAuth()).toBeSignedOutToAuth();
  });

  test('cookieToken: returns handshake when app is not satellite and responds to syncing on dev instances[12y]', async () => {
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

    expect(requestState).toMatchHandshake({
      reason: AuthErrorReason.PrimaryRespondsToSyncing,
    });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns signed out when no cookieToken and no clientUat in production [4y]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies(),
      mockOptions({
        publishableKey: 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA',
        secretKey: 'live_deadbeef',
      }),
    );

    expect(requestState).toBeSignedOut({
      reason: AuthErrorReason.SessionTokenAndUATMissing,
    });
    expect(requestState).toBeSignedOutToAuth();
  });

  test('cookieToken: returns handshake when no dev browser in development', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies({}, { __session: mockJwt }),
      mockOptions({
        secretKey: 'test_deadbeef',
      }),
    );

    expect(requestState).toMatchHandshake({ reason: AuthErrorReason.DevBrowserMissing });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns handshake when no clientUat in development [5y]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies({}, { __clerk_db_jwt: 'deadbeef', __session: mockJwt }),
      mockOptions({
        secretKey: 'test_deadbeef',
      }),
    );

    expect(requestState).toMatchHandshake({ reason: AuthErrorReason.SessionTokenWithoutClientUAT });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns handshake when no cookies in development [5y]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies({}),
      mockOptions({
        secretKey: 'test_deadbeef',
      }),
    );

    expect(requestState).toMatchHandshake({ reason: AuthErrorReason.DevBrowserMissing });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns signedIn when satellite but valid token and clientUat', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

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

    expect(requestState).toBeSignedIn({
      isSatellite: true,
      signInUrl: 'https://localhost:3000/sign-in/',
      domain: 'localhost:3001',
    });
    expect(requestState.toAuth()).toBeSignedInToAuth();
  });

  test('cookieToken: returns handshake when clientUat > 0 and no cookieToken [8y]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies({}, { __client_uat: '12345' }),
      mockOptions({ secretKey: 'deadbeef', publishableKey: PK_LIVE }),
    );

    expect(requestState).toMatchHandshake({ reason: AuthErrorReason.ClientUATWithoutSessionToken });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns signed out when clientUat = 0 and no cookieToken [9y]', async () => {
    const requestState = await authenticateRequest(
      mockRequestWithCookies({}, { __client_uat: '0' }),
      mockOptions({ publishableKey: PK_LIVE }),
    );

    expect(requestState).toBeSignedOut({
      reason: AuthErrorReason.SessionTokenAndUATMissing,
    });
    expect(requestState).toBeSignedOutToAuth();
  });

  test('cookieToken: returns handshake when clientUat > cookieToken.iat [10n]', async () => {
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

    expect(requestState).toMatchHandshake({ reason: AuthErrorReason.SessionTokenIATBeforeClientUAT });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns signed out when cookieToken.iat >= clientUat and malformed token [10y.1n]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

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
    expect(requestState).toBeSignedOut({
      reason: TokenVerificationErrorReason.TokenVerificationFailed,
      message: errMessage,
    });
    expect(requestState.toAuth()).toBeSignedOutToAuth();
  });

  test('cookieToken: returns signed in when cookieToken.iat >= clientUat and valid token [10y.2y]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

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

    expect(requestState).toBeSignedIn();
    expect(requestState.toAuth()).toBeSignedInToAuth();
  });

  // todo(
  //   'cookieToken: returns signed in when cookieToken.iat >= clientUat and expired token and ssrToken [10y.2n.1y]',
  //   assert => {
  //     assert.true(true);
  //   },
  // );

  test('cookieToken: returns handshake when cookieToken.iat >= clientUat and expired token [10y.2n.1n]', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    // advance clock for 1 hour
    vi.advanceTimersByTime(3600 * 1000);

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

    expect(requestState).toMatchHandshake({
      reason: `${AuthErrorReason.SessionTokenExpired}-refresh-${RefreshTokenErrorReason.NonEligibleNoCookie}`,
    });
    expect(requestState.message || '').toMatch(/^JWT is expired/);
    expect(requestState.toAuth()).toBeNull();
  });

  test('cookieToken: returns signed in for Amazon Cloudfront userAgent', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

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

    expect(requestState).toBeSignedIn();
    expect(requestState.toAuth()).toBeSignedInToAuth();
  });

  test('refreshToken: returns signed in with valid refresh token cookie if token is expired and refresh token exists', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    // return cookies from endpoint
    const refreshSession = vi.fn(() => ({
      object: 'token',
      jwt: mockJwt,
    }));

    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        {
          ...defaultHeaders,
          origin: 'https://example.com',
        },
        { __client_uat: `12345`, __session: mockExpiredJwt, __refresh_MqCvchyS: 'can_be_anything' },
      ),
      mockOptions({
        secretKey: 'test_deadbeef',
        publishableKey: PK_LIVE,
        apiClient: { sessions: { refreshSession } },
      }),
    );

    expect(requestState).toBeSignedIn();
    expect(requestState.toAuth()).toBeSignedInToAuth();
    expect(refreshSession).toHaveBeenCalled();
  });

  test('refreshToken: does not try to refresh if refresh token does not exist', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    // return cookies from endpoint
    const refreshSession = vi.fn(() => ({
      object: 'token',
      jwt: mockJwt,
    }));

    await authenticateRequest(
      mockRequestWithCookies(
        {
          ...defaultHeaders,
          origin: 'https://example.com',
        },
        { __client_uat: `12345`, __session: mockExpiredJwt },
      ),
      mockOptions({
        secretKey: 'test_deadbeef',
        publishableKey: PK_LIVE,
        apiClient: { sessions: { refreshSession } },
      }),
    );
    expect(refreshSession).not.toHaveBeenCalled();
  });

  test('refreshToken: does not try to refresh if refresh exists but token is not expired', async () => {
    // return cookies from endpoint
    const refreshSession = vi.fn(() => ({
      object: 'token',
      jwt: mockJwt,
    }));

    await authenticateRequest(
      mockRequestWithCookies(
        {
          ...defaultHeaders,
          origin: 'https://example.com',
        },
        // client_uat is missing, need to handshake not to refresh
        { __session: mockJwt, __refresh_MqCvchyS: 'can_be_anything' },
      ),
      mockOptions({
        secretKey: 'test_deadbeef',
        publishableKey: PK_LIVE,
        apiClient: { sessions: { refreshSession } },
      }),
    );

    expect(refreshSession).not.toHaveBeenCalled();
  });

  test('refreshToken: uses suffixed refresh cookie even if un-suffixed is present', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    // return cookies from endpoint
    const refreshSession = vi.fn(() => ({
      object: 'token',
      jwt: mockJwt,
    }));

    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        {
          ...defaultHeaders,
          origin: 'https://example.com',
        },
        {
          __client_uat: `12345`,
          __session: mockExpiredJwt,
          __refresh_MqCvchyS: 'can_be_anything',
          __refresh: 'should_not_be_used',
        },
      ),
      mockOptions({
        secretKey: 'test_deadbeef',
        publishableKey: PK_LIVE,
        apiClient: { sessions: { refreshSession } },
      }),
    );

    expect(requestState).toBeSignedIn();
    expect(requestState.toAuth()).toBeSignedInToAuth();
    expect(refreshSession).toHaveBeenCalled();
  });
});
