import { SignUpResource } from '../../../types/dist';
import {
  appendAsQueryParams,
  buildURL,
  getAllETLDs,
  hasExternalAccountSignUpError,
  isAccountsHostedPages,
  isDevOrStagingUrl,
  trimTrailingSlash,
} from './url';

describe('isAccountsHostedPages(url)', () => {
  const goodUrls: Array<[string | URL, boolean]> = [
    ['clerk.dev.lclclerk.com', false],
    ['clerk.prod.lclclerk.com', false],
    ['clerk.abc.efg.lclstage.dev', false],
    ['clerk.abc.efg.stgstage.dev', false],
    ['accounts.abc.efg.dev.lclclerk.com', true],
    ['https://accounts.abc.efg.stg.lclclerk.com', true],
    [new URL('https://clerk.abc.efg.lcl.dev'), false],
    [new URL('https://accounts.abc.efg.lcl.dev'), true],
    [new URL('https://accounts.abc.efg.stg.dev'), true],
  ];

  test.each(goodUrls)('.isAccountsHostedPages(%s)', (a, expected) => {
    expect(isAccountsHostedPages(a as any)).toBe(expected);
  });
});

describe('isDevOrStagingUrl(url)', () => {
  const goodUrls: Array<[string | URL, boolean]> = [
    ['https://www.google.com', false],
    ['https://www.clerk.dev', false],
    ['https://www.lclclerk.com', false],
    ['clerk.prod.lclclerk.com', false],
    ['something.dev.lclclerk.com', true],
    ['something.lcl.dev', true],
    ['https://www.something.stg.lclclerk.com', true],
    [new URL('https://www.lclclerk.com'), false],
    [new URL('https://www.something.stg.lclclerk.com'), true],
    [new URL('https://www.something.stg.lclclerk.com:4000'), true],
  ];

  const badUrls: Array<[string | null, boolean]> = [
    ['', false],
    [null, false],
  ];

  test.each([...goodUrls, ...badUrls])(
    '.isDevOrStagingUrl(%s)',
    (a, expected) => {
      expect(isDevOrStagingUrl(a as any)).toBe(expected);
    },
  );
});

describe('buildURL(options: URLParams, skipOrigin)', () => {
  it('builds a URL()', () => {
    expect(buildURL({}, { stringify: true })).toBe('http://localhost/');
    expect(
      buildURL(
        {
          pathname: 'my-path',
          hash: 'my-hash?my-hashed-search',
          search: 'my-search',
        },
        { stringify: true },
      ),
    ).toBe('http://localhost/my-path?my-search#my-hash?my-hashed-search');
    expect(
      buildURL(
        {
          base: 'http://test.host',
          pathname: 'my-path',
          hash: 'my-hash?my-hashed-search',
          search: 'my-search',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/my-path?my-search#my-hash?my-hashed-search');
    expect(
      buildURL(
        {
          base: 'http://test.host/my-path-1',
          pathname: '../my-path-2',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/my-path-2');
    expect(
      buildURL(
        {
          base: 'http://test.host/my-path-1',
          pathname: '../',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/');
    expect(
      buildURL(
        {
          base: 'http://test.host/my-path-1',
          pathname: '../',
          hash: '/my-hash?my-hashed-search',
          search: 'my-search',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/?my-search#/my-hash?my-hashed-search');
    expect(
      buildURL(
        {
          base: 'http://test.host',
          pathname: 'my-path',
          hash: 'my-hash?my-hashed-search',
          search: 'my-search',
        },
        { stringify: true, skipOrigin: true },
      ),
    ).toBe('/my-path?my-search#my-hash?my-hashed-search');
    expect(
      buildURL(
        {
          base: 'http://test.host/my-path-1',
          pathname: '../',
          hash: '/my-hash?my-hashed-search',
          search: 'my-search',
        },
        { stringify: true, skipOrigin: true },
      ),
    ).toBe('/?my-search#/my-hash?my-hashed-search');
    expect(
      buildURL(
        {
          base: 'http://test.host/',
          pathname: '/foo?bar=42',
          search: 'my-search',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/foo%3Fbar=42?my-search');
  });
});

describe('trimTrailingSlash(string)', () => {
  it('trims all the final slashes', () => {
    expect(trimTrailingSlash('')).toBe('');
    expect(trimTrailingSlash('/foo')).toBe('/foo');
    expect(trimTrailingSlash('/foo/')).toBe('/foo');
    expect(trimTrailingSlash('//foo//bar///')).toBe('//foo//bar');
  });
});

describe('appendQueryParams(base,url)', () => {
  it('returns the same url if no params provided', () => {
    const base = new URL('https://dashboard.clerk.dev');
    const res = appendAsQueryParams(base);
    expect(res).toBe('https://dashboard.clerk.dev/');
  });

  it('handles URL objects', () => {
    const base = new URL('https://dashboard.clerk.dev');
    const url = new URL(
      'https://dashboard.clerk.dev/applications/appid/instances/',
    );
    const res = appendAsQueryParams(base, { redirect_url: url });
    expect(res).toBe(
      'https://dashboard.clerk.dev/#/?redirect_url=%2Fapplications%2Fappid%2Finstances%2F',
    );
  });

  it('handles plain strings', () => {
    const base = 'https://dashboard.clerk.dev';
    const url = 'https://dashboard.clerk.dev/applications/appid/instances/';
    const res = appendAsQueryParams(base, { redirect_url: url });
    expect(res).toBe(
      'https://dashboard.clerk.dev/#/?redirect_url=%2Fapplications%2Fappid%2Finstances%2F',
    );
  });

  it('handles multiple params', () => {
    const base = 'https://dashboard.clerk.dev';
    const url = 'https://dashboard.clerk.dev/applications/appid/instances/';
    const res = appendAsQueryParams(base, {
      redirect_url: url,
      after_sign_in_url: url,
    });
    expect(res).toBe(
      'https://dashboard.clerk.dev/#/?redirect_url=%2Fapplications%2Fappid%2Finstances%2F&after_sign_in_url=%2Fapplications%2Fappid%2Finstances%2F',
    );
  });

  it('skips falsy values', () => {
    const base = new URL('https://dashboard.clerk.dev');
    const res = appendAsQueryParams(base, { redirect_url: undefined });
    expect(res).toBe('https://dashboard.clerk.dev/');
  });

  it('converts relative to absolute urls', () => {
    const base = new URL('https://dashboard.clerk.dev');
    const res = appendAsQueryParams(base, { redirect_url: '/test' });
    expect(res).toBe(
      'https://dashboard.clerk.dev/#/?redirect_url=http%3A%2F%2Flocalhost%2Ftest',
    );
  });

  it('converts keys from camel to snake case', () => {
    const base = new URL('https://dashboard.clerk.dev');
    const res = appendAsQueryParams(base, { redirectUrl: '/test' });
    expect(res).toBe(
      'https://dashboard.clerk.dev/#/?redirect_url=http%3A%2F%2Flocalhost%2Ftest',
    );
  });

  it('keeps origin before appending if base and url have different origin', () => {
    const base = new URL('https://dashboard.clerk.dev');
    const url = new URL('https://www.google.com/something');
    const res = appendAsQueryParams(base, { redirect_url: url });
    expect(res).toBe(
      'https://dashboard.clerk.dev/#/?redirect_url=https%3A%2F%2Fwww.google.com%2Fsomething',
    );
  });
});

describe('getAllETLDs(hostname)', () => {
  it('returns all ETLDs for a give hostname', () => {
    expect(getAllETLDs('foo.bar.qux.baz')).toEqual([
      'baz',
      'qux.baz',
      'bar.qux.baz',
    ]);
  });
});

describe('hasExternalAccountSignUpError(signUpResource)', () => {
  it('returns true if the signup attempt with external account has an error', () => {
    expect(hasExternalAccountSignUpError({
      verifications: {
        externalAccount: {
          error: {}
        }
      }
    } as SignUpResource)).toBe(true);
  });

  it('returns false if there is no signup attempt error on an external account', () => {
    expect(hasExternalAccountSignUpError({
      verifications: {
        externalAccount: {
          error: null
        }
      }
    } as SignUpResource)).toBe(false);
  });
});
