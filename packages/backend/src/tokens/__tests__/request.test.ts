import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { MachineTokenVerificationErrorCode, TokenVerificationErrorReason } from '../../errors';
import {
  mockExpiredJwt,
  mockInvalidSignatureJwt,
  mockJwks,
  mockJwt,
  mockJwtPayload,
  mockMalformedJwt,
} from '../../fixtures';
import { mockMachineAuthResponses, mockTokens, mockVerificationResults } from '../../fixtures/machine';
import { server } from '../../mock-server';
import type { AuthReason } from '../authStatus';
import { AuthErrorReason, AuthStatus } from '../authStatus';
import { OrganizationMatcher } from '../organizationMatcher';
import { authenticateRequest, RefreshTokenErrorReason } from '../request';
import { type MachineTokenType, TokenType } from '../tokenTypes';
import type { AuthenticateRequestOptions } from '../types';

const PK_TEST = 'pk_test_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';
const PK_LIVE = 'pk_live_Y2xlcmsuaW5zcGlyZWQucHVtYS03NC5sY2wuZGV2JA';

interface CustomMatchers<R = unknown> {
  toBeSignedOut: (expected: unknown) => R;
  toBeSignedOutToAuth: () => R;
  toMatchHandshake: (expected: unknown) => R;
  toBeSignedIn: (expected?: unknown) => R;
  toBeSignedInToAuth: () => R;
  toBeMachineAuthenticated: () => R;
  toBeMachineAuthenticatedToAuth: () => R;
  toBeMachineUnauthenticated: (expected: unknown) => R;
  toBeMachineUnauthenticatedToAuth: (expected: unknown) => R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  toBeMachineAuthenticated(received) {
    const pass = received.status === AuthStatus.SignedIn && received.tokenType !== 'session_token';
    if (pass) {
      return {
        message: () => `expected to be machine authenticated with token type ${received.tokenType}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to be machine authenticated with token type ${received.tokenType}`,
        pass: false,
      };
    }
  },
  toBeMachineUnauthenticated(
    received,
    expected: {
      tokenType: MachineTokenType | null;
      reason: AuthReason;
      message: string;
    },
  ) {
    const pass =
      received.status === AuthStatus.SignedOut &&
      received.tokenType === expected.tokenType &&
      received.reason === expected.reason &&
      received.message === expected.message &&
      !received.isAuthenticated &&
      !received.token;

    if (pass) {
      return {
        message: () => `expected to be machine unauthenticated with token type ${received.tokenType}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected to be machine unauthenticated with token type ${received.tokenType} but got ${received.status}`,
        pass: false,
      };
    }
  },
  toBeMachineUnauthenticatedToAuth(
    received,
    expected: {
      tokenType: MachineTokenType | null;
    },
  ) {
    const pass =
      received.tokenType === expected.tokenType && !received.isAuthenticated && !received.name && !received.id;

    if (pass) {
      return {
        message: () => `expected to be machine unauthenticated to auth with token type ${received.tokenType}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected to be machine unauthenticated to auth with token type ${received.tokenType}`,
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
// @ts-expect-error - Testing
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

// @ts-expect-error - Testing
const mockRequestWithHeaderAuth = (headers?, requestUrl?) => {
  return mockRequest({ authorization: `Bearer ${mockJwt}`, ...headers }, requestUrl);
};

// @ts-expect-error - Testing
const mockRequestWithCookies = (headers?, cookies = {}, requestUrl?) => {
  const cookieStr = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join(';');

  return mockRequest({ cookie: cookieStr, ...headers }, requestUrl);
};

describe('getOrganizationSyncTarget', () => {
  it.each([
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
  ])('$name', ({ whenOrgSyncOptions, whenAppRequestPath, thenExpectActivationEntity }) => {
    const path = new URL(`http://localhost:3000${whenAppRequestPath || ''}`);
    const matcher = new OrganizationMatcher(whenOrgSyncOptions);
    const toActivate = matcher.findTarget(path);
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

  test('does not throw error with missing auth scheme from Authorization header', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    await expect(
      authenticateRequest(mockRequestWithHeaderAuth({ authorization: mockInvalidSignatureJwt }), mockOptions()),
    ).resolves.not.toThrow();
  });

  test('does not throw error with Basic auth scheme from Authorization header', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    await expect(
      authenticateRequest(mockRequestWithHeaderAuth({ authorization: 'Basic dXNlcjpwYXNzd29yZA==' }), mockOptions()),
    ).resolves.not.toThrow();
  });

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
        authorization: `Bearer ${mockInvalidSignatureJwt}`,
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
      mockRequestWithHeaderAuth({ authorization: 'Bearer test_header_token' }),
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
    expect(requestState.headers.get('location')).toEqual(
      `https://primary.dev/sign-in?__clerk_redirect_url=http%3A%2F%2Fexample.com%2Fpath`,
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

  test('cookieToken: primary responds to syncing takes precedence over dev-browser-sync in multi-domain flow', async () => {
    const sp = new URLSearchParams();
    sp.set('__clerk_redirect_url', 'http://localhost:3001/dashboard');
    sp.set('__clerk_db_jwt', mockJwt);
    const requestUrl = `http://localhost:3000/sign-in?${sp.toString()}`;
    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        { ...defaultHeaders, 'sec-fetch-dest': 'document' },
        { __client_uat: '12345', __session: mockJwt, __clerk_db_jwt: mockJwt },
        requestUrl,
      ),
      mockOptions({ secretKey: 'sk_test_deadbeef', isSatellite: false }),
    );

    expect(requestState).toMatchHandshake({
      reason: AuthErrorReason.PrimaryRespondsToSyncing,
    });
    expect(requestState.message).toBe('');
    expect(requestState.toAuth()).toBeNull();

    const location = requestState.headers.get('location');
    expect(location).toBeTruthy();
    expect(location).toContain('localhost:3001/dashboard');
    expect(location).toContain('__clerk_synced=true');
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

  test('cookieToken: returns signedIn when no clientUat but in redirect loop with valid session (Safari ITP workaround)', async () => {
    server.use(
      http.get('https://api.clerk.test/v1/jwks', () => {
        return HttpResponse.json(mockJwks);
      }),
    );

    // Simulate Safari ITP scenario: valid session token, no client_uat, redirect loop detected
    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        {},
        {
          __clerk_db_jwt: 'deadbeef',
          __session: mockJwt,
          __clerk_redirect_count: '1', // Redirect loop counter > 0
        },
      ),
      mockOptions({
        secretKey: 'test_deadbeef',
      }),
    );

    expect(requestState).toBeSignedIn();
    expect(requestState.toAuth()).toBeSignedInToAuth();
  });

  test('cookieToken: returns handshake when no clientUat and redirect loop but invalid session token', async () => {
    // Simulate scenario where we're in a redirect loop but the session token is invalid
    const requestState = await authenticateRequest(
      mockRequestWithCookies(
        {},
        {
          __clerk_db_jwt: 'deadbeef',
          __session: mockMalformedJwt,
          __clerk_redirect_count: '1',
        },
      ),
      mockOptions({
        secretKey: 'test_deadbeef',
      }),
    );

    // Should still return handshake since token verification failed
    expect(requestState).toMatchHandshake({ reason: AuthErrorReason.SessionTokenWithoutClientUAT });
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
      'Subject claim (sub) is required and must be a string. Received undefined. Make sure that this is a valid Clerk-generated JWT. (reason=token-verification-failed, token-carrier=cookie)';
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

  describe('refreshToken', async () => {
    test('returns signed in with valid refresh token cookie if token is expired and refresh token exists', async () => {
      server.use(
        http.get('https://api.clerk.test/v1/jwks', () => {
          return HttpResponse.json(mockJwks);
        }),
      );

      // return cookies from endpoint
      const refreshSession = vi.fn(() => ({
        object: 'cookies',
        cookies: [`__session_MqCvchyS=${mockJwt}; Path=/; Secure; SameSite=Lax`],
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
      expect(requestState.headers.getSetCookie()).toContain(
        `__session_MqCvchyS=${mockJwt}; Path=/; Secure; SameSite=Lax`,
      );
      expect(refreshSession).toHaveBeenCalled();
    });

    test('does not try to refresh if refresh token does not exist', async () => {
      server.use(
        http.get('https://api.clerk.test/v1/jwks', () => {
          return HttpResponse.json(mockJwks);
        }),
      );

      // return cookies from endpoint
      const refreshSession = vi.fn(() => ({
        object: 'cookies',
        cookies: [`__session_MqCvchyS=${mockJwt}; Path=/; Secure; SameSite=Lax`],
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

    test('does not try to refresh if refresh exists but token is not expired', async () => {
      // return cookies from endpoint
      const refreshSession = vi.fn(() => ({
        object: 'cookies',
        cookies: [`__session_MqCvchyS=${mockJwt}; Path=/; Secure; SameSite=Lax`],
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

    test('uses suffixed refresh cookie even if un-suffixed is present', async () => {
      server.use(
        http.get('https://api.clerk.test/v1/jwks', () => {
          return HttpResponse.json(mockJwks);
        }),
      );

      // return cookies from endpoint
      const refreshSession = vi.fn(() => ({
        object: 'cookies',
        cookies: [`__session_MqCvchyS=${mockJwt}; Path=/; Secure; SameSite=Lax`],
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
      expect(requestState.headers.getSetCookie()).toContain(
        `__session_MqCvchyS=${mockJwt}; Path=/; Secure; SameSite=Lax`,
      );
      expect(refreshSession).toHaveBeenCalled();
    });

    test('should default to session_token if acceptsToken is not provided', async () => {
      server.use(
        http.get('https://api.clerk.test/v1/jwks', () => {
          return HttpResponse.json({}, { status: 200 });
        }),
      );

      const result = await authenticateRequest(mockRequestWithHeaderAuth(), mockOptions());
      expect(result.tokenType).toBe('session_token');
    });
  });

  describe('Machine authentication', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    // Test each token type with parameterized tests
    const tokenTypes = [TokenType.ApiKey, TokenType.OAuthToken, TokenType.M2MToken];

    describe.each(tokenTypes)('%s Authentication', tokenType => {
      const mockToken = mockTokens[tokenType];
      const mockVerification = mockVerificationResults[tokenType];
      const mockConfig = mockMachineAuthResponses[tokenType];

      test('returns authenticated state with valid token', async () => {
        server.use(
          http.post(mockConfig.endpoint, () => {
            return HttpResponse.json(mockVerification);
          }),
        );

        const request = mockRequest({ authorization: `Bearer ${mockToken}` });
        const requestState = await authenticateRequest(request, mockOptions({ acceptsToken: tokenType }));

        expect(requestState).toBeMachineAuthenticated();
      });

      test('returns unauthenticated state with invalid token', async () => {
        server.use(
          http.post(mockConfig.endpoint, () => {
            return HttpResponse.json({}, { status: 404 });
          }),
        );

        const request = mockRequest({ authorization: `Bearer ${mockToken}` });
        const requestState = await authenticateRequest(request, mockOptions({ acceptsToken: tokenType }));

        expect(requestState).toBeMachineUnauthenticated({
          tokenType,
          reason: MachineTokenVerificationErrorCode.TokenInvalid,
          message: `${mockConfig.errorMessage} (code=token-invalid, status=404)`,
        });
        expect(requestState.toAuth()).toBeMachineUnauthenticatedToAuth({
          tokenType,
          isAuthenticated: false,
        });
      });
    });

    test('accepts machine secret when verifying machine-to-machine token', async () => {
      server.use(
        http.post(mockMachineAuthResponses.m2m_token.endpoint, ({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
          return HttpResponse.json(mockVerificationResults.m2m_token);
        }),
      );

      const request = mockRequest({ authorization: `Bearer ${mockTokens.m2m_token}` });
      const requestState = await authenticateRequest(
        request,
        mockOptions({ acceptsToken: 'm2m_token', machineSecretKey: 'ak_xxxxx' }),
      );

      expect(requestState).toBeMachineAuthenticated();
    });

    test('throws an error if acceptsToken is m2m_token but machineSecretKey or secretKey is not provided', async () => {
      const request = mockRequest({ authorization: `Bearer ${mockTokens.m2m_token}` });

      await expect(
        authenticateRequest(request, mockOptions({ acceptsToken: 'm2m_token', secretKey: undefined })),
      ).rejects.toThrow(
        'Machine token authentication requires either a Machine secret key or a Clerk secret key. ' +
          'Ensure a Clerk secret key or Machine secret key is set.',
      );
    });

    describe('Any Token Type Authentication', () => {
      test.each(tokenTypes)('accepts %s when acceptsToken is "any"', async tokenType => {
        const mockToken = mockTokens[tokenType];
        const mockVerification = mockVerificationResults[tokenType];
        const mockConfig = mockMachineAuthResponses[tokenType];

        server.use(
          http.post(mockConfig.endpoint, () => {
            return HttpResponse.json(mockVerification);
          }),
        );

        const request = mockRequest({ authorization: `Bearer ${mockToken}` });
        const requestState = await authenticateRequest(request, mockOptions({ acceptsToken: 'any' }));

        expect(requestState).toBeMachineAuthenticated();
      });

      test('accepts session token when acceptsToken is "any"', async () => {
        server.use(
          http.get('https://api.clerk.test/v1/jwks', () => {
            return HttpResponse.json(mockJwks);
          }),
        );

        const request = mockRequestWithHeaderAuth();
        const requestState = await authenticateRequest(request, mockOptions({ acceptsToken: 'any' }));

        expect(requestState).toBeSignedIn();
        expect(requestState.toAuth()).toBeSignedInToAuth();
      });
    });

    describe('Token Type Mismatch', () => {
      test('returns unauthenticated state when token type mismatches (API key provided, OAuth token expected)', async () => {
        const request = mockRequest({ authorization: `Bearer ${mockTokens.api_key}` });
        const result = await authenticateRequest(request, mockOptions({ acceptsToken: 'oauth_token' }));

        expect(result).toBeMachineUnauthenticated({
          tokenType: 'oauth_token',
          reason: AuthErrorReason.TokenTypeMismatch,
          message: '',
        });
        expect(result.toAuth()).toBeMachineUnauthenticatedToAuth({
          tokenType: 'oauth_token',
          isAuthenticated: false,
        });
      });

      test('returns unauthenticated state when token type mismatches (OAuth token provided, M2M token expected)', async () => {
        const request = mockRequest({ authorization: `Bearer ${mockTokens.oauth_token}` });
        const result = await authenticateRequest(request, mockOptions({ acceptsToken: 'm2m_token' }));

        expect(result).toBeMachineUnauthenticated({
          tokenType: 'm2m_token',
          reason: AuthErrorReason.TokenTypeMismatch,
          message: '',
        });
        expect(result.toAuth()).toBeMachineUnauthenticatedToAuth({
          tokenType: 'm2m_token',
          isAuthenticated: false,
        });
      });

      test('returns unauthenticated state when token type mismatches (M2M token provided, API key expected)', async () => {
        const request = mockRequest({ authorization: `Bearer ${mockTokens.m2m_token}` });
        const result = await authenticateRequest(request, mockOptions({ acceptsToken: 'api_key' }));

        expect(result).toBeMachineUnauthenticated({
          tokenType: 'api_key',
          reason: AuthErrorReason.TokenTypeMismatch,
          message: '',
        });
        expect(result.toAuth()).toBeMachineUnauthenticatedToAuth({
          tokenType: 'api_key',
          isAuthenticated: false,
        });
      });

      test('returns unauthenticated state when session token is provided but machine token is expected', async () => {
        const request = mockRequestWithHeaderAuth();
        const result = await authenticateRequest(request, mockOptions({ acceptsToken: 'm2m_token' }));

        expect(result).toBeMachineUnauthenticated({
          tokenType: 'm2m_token',
          reason: AuthErrorReason.TokenTypeMismatch,
          message: '',
          isAuthenticated: false,
        });
        expect(result.toAuth()).toBeMachineUnauthenticatedToAuth({
          tokenType: 'm2m_token',
          isAuthenticated: false,
        });
      });
    });

    describe('Array of Accepted Token Types', () => {
      test('accepts token when it is in the acceptsToken array', async () => {
        server.use(
          http.post(mockMachineAuthResponses.api_key.endpoint, () => {
            return HttpResponse.json(mockVerificationResults.api_key);
          }),
        );

        const request = mockRequest({ authorization: `Bearer ${mockTokens.api_key}` });
        const requestState = await authenticateRequest(
          request,
          mockOptions({ acceptsToken: ['api_key', 'oauth_token'] }),
        );

        expect(requestState).toBeMachineAuthenticated();
      });

      test('returns unauthenticated state when token type is not in the acceptsToken array', async () => {
        const request = mockRequest({ authorization: `Bearer ${mockTokens.m2m_token}` });
        const requestState = await authenticateRequest(
          request,
          mockOptions({ acceptsToken: ['api_key', 'oauth_token'] }),
        );

        expect(requestState).toBeMachineUnauthenticated({
          tokenType: null,
          reason: AuthErrorReason.TokenTypeMismatch,
          message: '',
        });
        expect(requestState.toAuth()).toBeMachineUnauthenticatedToAuth({
          tokenType: null,
          isAuthenticated: false,
        });
      });
    });

    describe('Token Location Validation', () => {
      test.each(tokenTypes)('returns unauthenticated state when %s is in cookie instead of header', async tokenType => {
        const mockToken = mockTokens[tokenType];

        const requestState = await authenticateRequest(
          mockRequestWithCookies(
            {},
            {
              __session: mockToken,
            },
          ),
          mockOptions({ acceptsToken: tokenType }),
        );

        expect(requestState).toBeMachineUnauthenticated({
          tokenType,
          reason: 'No token in header',
          message: '',
        });
      });
    });
  });

  describe('Cross-origin sync', () => {
    beforeEach(() => {
      server.use(
        http.get('https://api.clerk.test/v1/jwks', () => {
          return HttpResponse.json(mockJwks);
        }),
      );
    });

    test('triggers handshake for cross-origin document request on primary domain', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://satellite.com/signin',
          'sec-fetch-dest': 'document',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toMatchHandshake({
        reason: AuthErrorReason.PrimaryDomainCrossOriginSync,
        domain: 'primary.com',
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('triggers handshake for cross-site document request on primary domain', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://satellite.com/signin',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toMatchHandshake({
        reason: AuthErrorReason.PrimaryDomainCrossOriginSync,
        domain: 'primary.com',
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referer is same origin', async () => {
      const request = mockRequestWithCookies(
        {
          host: 'primary.com',
          referer: 'https://primary.com/signin',
          'sec-fetch-dest': 'document',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referer is same origin', async () => {
      const request = mockRequestWithCookies(
        {
          host: 'localhost:3000',
          referer: 'http://localhost:3000',
          'sec-fetch-dest': 'document',
        },
        {
          __clerk_db_jwt: mockJwt,
          __session: mockJwt,
          __client_uat: '12345',
        },
        'http://localhost:3000',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        signInUrl: 'http://localhost:3000/sign-in',
      });

      expect(requestState).toBeSignedIn({
        signInUrl: 'http://localhost:3000/sign-in',
      });
    });

    test('does not trigger handshake when no referer header', async () => {
      const request = mockRequestWithCookies(
        {
          'sec-fetch-dest': 'document',
          origin: 'https://primary.com',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake for non-document requests', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://satellite.com/signin',
          'sec-fetch-dest': 'empty',
          origin: 'https://primary.com',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/api/data',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referer header contains invalid URL format', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'invalid-url-format',
          'sec-fetch-dest': 'document',
          origin: 'https://primary.com',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referer is from production accounts portal', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://accounts.example.com/sign-in',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referer is from dev accounts portal (current format)', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://foo-bar-13.accounts.dev/sign-in',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referer is from dev accounts portal (legacy format)', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://accounts.foo-bar-13.lcl.dev/sign-in',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger cross-origin handshake when referer is from expected accounts portal derived from frontend API', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://accounts.inspired.puma-74.lcl.dev/sign-in',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      // Should not trigger the specific cross-origin sync handshake we're trying to prevent
      expect(requestState.reason).not.toBe(AuthErrorReason.PrimaryDomainCrossOriginSync);
    });

    test('does not trigger handshake when referer is from FAPI domain (redirect-based auth)', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://clerk.inspired.puma-74.lcl.dev/v1/client/sign_ins/12345/attempt_first_factor',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      // Should not trigger the specific cross-origin sync handshake we're trying to prevent
      expect(requestState.reason).not.toBe(AuthErrorReason.PrimaryDomainCrossOriginSync);
    });

    test('does not trigger handshake when referer is from FAPI domain with https prefix', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://clerk.inspired.puma-74.lcl.dev/sign-in',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      // Should not trigger the specific cross-origin sync handshake we're trying to prevent
      expect(requestState.reason).not.toBe(AuthErrorReason.PrimaryDomainCrossOriginSync);
    });

    test('still triggers handshake for legitimate cross-origin requests from non-accounts domains', async () => {
      const request = mockRequestWithCookies(
        {
          referer: 'https://satellite.com/sign-in',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site',
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      expect(requestState).toMatchHandshake({
        reason: AuthErrorReason.PrimaryDomainCrossOriginSync,
        domain: 'primary.com',
        signInUrl: 'https://primary.com/sign-in',
      });
    });

    test('does not trigger handshake when referrer matches current origin despite sec-fetch-site cross-site (redirect chain)', async () => {
      const request = mockRequestWithCookies(
        {
          host: 'primary.com',
          referer: 'https://primary.com/some-page',
          'sec-fetch-dest': 'document',
          'sec-fetch-site': 'cross-site', // This can happen due to redirect chains through Clerk domains
        },
        {
          __session: mockJwt,
          __client_uat: '12345',
        },
        'https://primary.com/dashboard',
      );

      const requestState = await authenticateRequest(request, {
        ...mockOptions(),
        publishableKey: PK_LIVE,
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });

      // Should not trigger handshake because referrer origin matches current origin
      expect(requestState).toBeSignedIn({
        domain: 'primary.com',
        isSatellite: false,
        signInUrl: 'https://primary.com/sign-in',
      });
    });
  });
});
