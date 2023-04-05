import { buildMagicLinkRedirectUrl, buildSSOCallbackURL } from '../redirects';

describe('buildMagicLinkRedirectUrl(routing, baseUrl)', () => {
  it('handles empty routing strategy based routing ', function () {
    expect(buildMagicLinkRedirectUrl({ path: '', authQueryString: '' } as any, '')).toBe('http://localhost/#/verify');
  });

  it('returns the magic link redirect url for components using path based routing ', function () {
    expect(buildMagicLinkRedirectUrl({ routing: 'path', authQueryString: '' } as any, '')).toBe(
      'http://localhost/verify',
    );

    expect(buildMagicLinkRedirectUrl({ routing: 'path', path: '/sign-in', authQueryString: '' } as any, '')).toBe(
      'http://localhost/sign-in/verify',
    );

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'path',
          path: '',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        '',
      ),
    ).toBe('http://localhost/verify?redirectUrl=https://clerk.com');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'path',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        '',
      ),
    ).toBe('http://localhost/sign-in/verify?redirectUrl=https://clerk.com');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'path',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        'https://accounts.clerk.com/sign-in',
      ),
    ).toBe('http://localhost/sign-in/verify?redirectUrl=https://clerk.com');
  });

  it('returns the magic link redirect url for components using hash based routing ', function () {
    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'hash',
          authQueryString: '',
        } as any,
        '',
      ),
    ).toBe('http://localhost/#/verify');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: null,
        } as any,
        '',
      ),
    ).toBe('http://localhost/#/verify');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'hash',
          path: '',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        '',
      ),
    ).toBe('http://localhost/#/verify?redirectUrl=https://clerk.com');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        '',
      ),
    ).toBe('http://localhost/#/verify?redirectUrl=https://clerk.com');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'hash',
          path: '/sign-in',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        'https://accounts.clerk.com/sign-in',
      ),
    ).toBe('http://localhost/#/verify?redirectUrl=https://clerk.com');
  });

  it('returns the magic link redirect url for components using virtual routing ', function () {
    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'virtual',
          authQueryString: 'redirectUrl=https://clerk.com',
        } as any,
        'https://accounts.clerk.com/sign-in',
      ),
    ).toBe('https://accounts.clerk.com/sign-in#/verify?redirectUrl=https://clerk.com');

    expect(
      buildMagicLinkRedirectUrl(
        {
          routing: 'virtual',
        } as any,
        'https://accounts.clerk.com/sign-in',
      ),
    ).toBe('https://accounts.clerk.com/sign-in#/verify');
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
