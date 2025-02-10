import { buildSSOCallbackURL, buildVerificationRedirectUrl, buildVerificationRedirectUrl } from '../redirects';

describe('buildVerificationRedirectUrl(routing, baseUrl)', () => {
  it('defaults to hash based routing strategy on empty routing', function () {
    expect(
      buildVerificationRedirectUrl({ ctx: { path: '', authQueryString: '' } as any, baseUrl: '', intent: 'sign-in' }),
    ).toBe('http://localhost/#/verify');
  });

  it('returns the magic link redirect url for components using path based routing ', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: { routing: 'path', authQueryString: '' } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: { routing: 'path', path: '/sign-in', authQueryString: '' } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/sign-in/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/sign-in/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/sign-in/verify?redirectUrl=https://clerk.com');
  });

  it('returns the magic link redirect url for components using hash based routing ', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          authQueryString: '',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/#/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: null,
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/#/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/#/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/#/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/#/verify?redirectUrl=https://clerk.com');
  });

  it('returns the magic link redirect url for components using virtual routing ', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'virtual',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('https://accounts.clerk.com/sign-in#/verify?redirectUrl=https://clerk.com');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'virtual',
        } as any,
        baseUrl: 'https://accounts.clerk.com/sign-in',
        intent: 'sign-in',
      }),
    ).toBe('https://accounts.clerk.com/sign-in#/verify');
  });

  it('returns the magic link redirect url for components using the combined flow based on intent', function () {
    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-up',
          isCombinedFlow: true,
        } as any,
        baseUrl: '',
        intent: 'sign-up',
      }),
    ).toBe('http://localhost/sign-up/create/verify');

    expect(
      buildVerificationRedirectUrl({
        ctx: {
          routing: 'path',
          path: '/sign-in',
          isCombinedFlow: true,
        } as any,
        baseUrl: '',
        intent: 'sign-in',
      }),
    ).toBe('http://localhost/sign-in/verify');
  });
});

describe('buildSSOCallbackURL(ctx, baseUrl)', () => {
  it('returns the SSO callback URL based on sign in|up component routing or the provided base URL', () => {
    // Default callback URLS
    expect(buildSSOCallbackURL({}, '')).toBe('http://localhost/#/sso-callback');
    expect(buildSSOCallbackURL({}, 'http://test.host')).toBe('http://localhost/#/sso-callback');
    expect(buildSSOCallbackURL({ authQueryString: 'redirect_url=%2Ffoo' }, 'http://test.host')).toBe(
      'http://localhost/#/sso-callback?redirect_url=%2Ffoo',
    );

    // Components mounted with hash routing
    expect(buildSSOCallbackURL({ routing: 'hash' }, 'http://test.host')).toBe('http://localhost/#/sso-callback');
    expect(buildSSOCallbackURL({ routing: 'hash', authQueryString: 'redirect_url=%2Ffoo' }, 'http://test.host')).toBe(
      'http://localhost/#/sso-callback?redirect_url=%2Ffoo',
    );

    // Components mounted with path routing
    expect(buildSSOCallbackURL({ routing: 'path', path: 'sign-in' }, 'http://test.host')).toBe(
      'http://localhost/sign-in/sso-callback',
    );
    expect(
      buildSSOCallbackURL(
        {
          routing: 'path',
          path: 'sign-in',
          authQueryString: 'redirect_url=%2Ffoo',
        },
        'http://test.host',
      ),
    ).toBe('http://localhost/sign-in/sso-callback?redirect_url=%2Ffoo');

    // Components mounted with virtual routing
    expect(buildSSOCallbackURL({ routing: 'virtual' }, 'http://test.host')).toBe('http://test.host/#/sso-callback');
    expect(
      buildSSOCallbackURL({ routing: 'virtual', authQueryString: 'redirect_url=%2Ffoo' }, 'http://test.host'),
    ).toBe('http://test.host/#/sso-callback?redirect_url=%2Ffoo');
  });
});
