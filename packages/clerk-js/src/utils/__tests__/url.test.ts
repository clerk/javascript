import type { SignUpResource } from '@clerk/types';

import {
  appendAsQueryParams,
  buildURL,
  getAllETLDs,
  getETLDPlusOneFromFrontendApi,
  getSearchParameterFromHash,
  hasBannedProtocol,
  hasExternalAccountSignUpError,
  isAllowedRedirectOrigin,
  isDataUri,
  isDevAccountPortalOrigin,
  isRedirectForFAPIInitiatedFlow,
  isValidUrl,
  mergeFragmentIntoUrl,
  requiresUserInput,
  trimTrailingSlash,
} from '../url';

describe('isDevAccountPortalOrigin(url)', () => {
  const goodUrls: Array<[string | URL, boolean]> = [
    ['clerk.com.lclclerk.com', false],
    ['clerk.prod.lclclerk.com', false],
    ['clerk.abc.efg.lclstage.dev', false],
    ['clerk.abc.efg.stgstage.dev', false],
    ['accounts.abc.efg.dev.lclclerk.com', true],
    ['rested-anemone-14.accounts.dev', true],
    ['rested-anemone-14.accounts.dev.accountsstage.dev', true],
    ['rested-anemone-14.accounts.dev.accounts.lclclerk.com', true],
    ['rested-anemone-14.clerk.accounts.dev', false],
  ];

  test.each(goodUrls)('.isDevAccountPortalOrigin(%s)', (a, expected) => {
    // @ts-ignore
    expect(isDevAccountPortalOrigin(a)).toBe(expected);
  });
});

describe('isValidUrl(url)', () => {
  const cases: Array<[string, boolean]> = [
    ['https://www.clerk.com/', true],
    ['https://www.clerk.com/?test=clerk', true],
    ['https://www.clerk.com', true],
    ['https://clerk.com', true],
    ['www.clerk.com/', false],
    ['www.clerk.com', false],
    ['www.clerk', false],
    ['clerk.com', false],
    ['clerk.com?clerk=yes', false],
    ['clerk.com#/?clerk=yes', false],
  ];

  test.each(cases)('.isValidUrl(%s)', (a, expected) => {
    expect(isValidUrl(a)).toBe(expected);
  });
});

describe('isValidUrl(url,base)', () => {
  const cases: Array<[string, boolean]> = [
    ['', true],
    ['/', true],
    ['/test', true],
    ['/test?clerk=true', true],
    ['/?clerk=true', true],
  ];

  test.each(cases)('.isValidUrl(%s,%s)', (a, expected) => {
    expect(isValidUrl(a, { includeRelativeUrls: true })).toBe(expected);
  });
});

describe('isDataUri(url)', () => {
  const cases: Array<[string, boolean]> = [
    ['https://www.clerk.com/', false],
    ['data:image/png;base64,iVBORw0KGgoAAA5ErkJggg==', true],
  ];

  test.each(cases)('.isDataUri(%s)', (a, expected) => {
    expect(isDataUri(a)).toBe(expected);
  });
});

describe('hasBannedProtocol(url)', () => {
  const cases: Array<[string, boolean]> = [
    ['https://www.clerk.com/', false],
    ['http://www.clerk.com/', false],
    ['/sign-in', false],
    ['/sign-in?test=1', false],
    ['/?test', false],
    ['javascript:console.log(document.cookies)', true],
    ['data:image/png;base64,iVBORw0KGgoAAA5ErkJggg==', false],
  ];

  test.each(cases)('.hasBannedProtocol(%s)', (a, expected) => {
    expect(hasBannedProtocol(a)).toBe(expected);
  });
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
    expect(
      buildURL(
        {
          base: 'http://test.host/',
          pathname: '/foo?bar=42',
          search: 'my-search=42',
          hashPath: '/qux',
          hashSearch: 'my-hash-search=42',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/foo%3Fbar=42?my-search=42#/qux?my-hash-search=42');
    expect(
      buildURL(
        {
          base: 'http://test.host/',
          pathname: '/foo?bar=42',
          search: 'my-search=42',
          hash: 'my-hash',
          hashPath: '/qux',
          hashSearch: 'my-hash-search=42',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/foo%3Fbar=42?my-search=42#my-hash/qux?my-hash-search=42');
    expect(
      buildURL(
        {
          base: 'http://test.host/',
          hash: '?my-hash-search=42',
          hashPath: '/foo',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/#/foo?my-hash-search=42');
    expect(
      buildURL(
        {
          base: 'http://test.host/foo?my-search=42#my-hash?my-hash-search-1=42',
          hashPath: '/qux',
          hashSearch: 'my-hash-search-2=42',
        },
        { stringify: true },
      ),
    ).toBe('http://test.host/foo?my-search=42#my-hash/qux?my-hash-search-1=42&my-hash-search-2=42');
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
    const base = new URL('https://dashboard.clerk.com');
    const res = appendAsQueryParams(base);
    expect(res).toBe('https://dashboard.clerk.com/');
  });

  it('handles plain strings', () => {
    const base = 'https://dashboard.clerk.com';
    const url = 'https://dashboard.clerk.com/applications/appid/instances/';
    const res = appendAsQueryParams(base, { redirect_url: url });
    expect(res).toBe(
      'https://dashboard.clerk.com/#/?redirect_url=https%3A%2F%2Fdashboard.clerk.com%2Fapplications%2Fappid%2Finstances%2F',
    );
  });

  it('handles multiple params', () => {
    const base = 'https://dashboard.clerk.com';
    const url = 'https://dashboard.clerk.com/applications/appid/instances/';
    const res = appendAsQueryParams(base, { redirect_url: url, after_sign_in_url: url });
    expect(res).toBe(
      'https://dashboard.clerk.com/#/?redirect_url=https%3A%2F%2Fdashboard.clerk.com%2Fapplications%2Fappid%2Finstances%2F&after_sign_in_url=https%3A%2F%2Fdashboard.clerk.com%2Fapplications%2Fappid%2Finstances%2F',
    );
  });

  it('skips falsy values', () => {
    const base = new URL('https://dashboard.clerk.com');
    const res = appendAsQueryParams(base, { redirect_url: undefined });
    expect(res).toBe('https://dashboard.clerk.com/');
  });

  it('converts relative to absolute urls', () => {
    const base = new URL('https://dashboard.clerk.com');
    const res = appendAsQueryParams(base, { redirect_url: 'http://localhost/test' });
    expect(res).toBe('https://dashboard.clerk.com/#/?redirect_url=http%3A%2F%2Flocalhost%2Ftest');
  });

  it('converts keys from camel to snake case', () => {
    const base = new URL('https://dashboard.clerk.com');
    const res = appendAsQueryParams(base, { redirectUrl: 'http://localhost/test' });
    expect(res).toBe('https://dashboard.clerk.com/#/?redirect_url=http%3A%2F%2Flocalhost%2Ftest');
  });

  it('keeps origin before appending if base and url have different origin', () => {
    const base = new URL('https://dashboard.clerk.com');
    const url = new URL('https://www.google.com/something').href;
    const res = appendAsQueryParams(base, { redirect_url: url });
    expect(res).toBe('https://dashboard.clerk.com/#/?redirect_url=https%3A%2F%2Fwww.google.com%2Fsomething');
  });
});

describe('getAllETLDs(hostname)', () => {
  it('returns all ETLDs for a give hostname', () => {
    expect(getAllETLDs('foo.bar.qux.baz')).toEqual(['baz', 'qux.baz', 'bar.qux.baz']);
  });
});

describe('hasExternalAccountSignUpError(signUpResource)', () => {
  it('returns true if the signup attempt with external account has an error', () => {
    expect(
      hasExternalAccountSignUpError({
        verifications: {
          externalAccount: {
            error: {},
          },
        },
      } as SignUpResource),
    ).toBe(true);
  });

  it('returns false if there is no signup attempt error on an external account', () => {
    expect(
      hasExternalAccountSignUpError({
        verifications: {
          externalAccount: {
            error: null,
          },
        },
      } as SignUpResource),
    ).toBe(false);
  });
});

describe('getSearchParameterFromHash(options)', () => {
  const testCases: Array<[string, string, string | null]> = [
    ['#random-hash', 'foo', null],
    ['random-hash', 'foo', null],
    ['#random-hash?foo=42', 'foo', '42'],
    ['random-hash?foo=42&bar=84', 'bar', '84'],
  ];

  test.each(testCases)('hash=(%s), paramName=(%s), expected value=(%s)', (hash, paramName, expectedParamValue) => {
    expect(
      getSearchParameterFromHash({
        hash,
        paramName,
      }),
    ).toEqual(expectedParamValue);
  });
});

describe('mergeFragmentIntoUrl(url | string)', () => {
  const testCases: Array<[string | URL, URL]> = [
    ['https://test.test#/foo/bar', new URL('https://test.test/foo/bar')],
    ['https://test.test#/foo/bar?a=a', new URL('https://test.test/foo/bar?a=a')],
    ['https://test.test?a=a#/foo/bar?b=b', new URL('https://test.test/foo/bar?a=a&b=b')],
    ['https://test.test?a=a', new URL('https://test.test?a=a')],
    ['https://test.test/foo', new URL('https://test.test/foo')],
    ['https://test.test', new URL('https://test.test')],
    ['https://test.test#data', new URL('https://test.test#data')],
    ['https://test.test/foo?a=a&b=b#/bar?c=c', new URL('https://test.test/foo/bar?a=a&b=b&c=c')],
    ['https://test.test?a=a#/?a=b', new URL('https://test.test?a=b')],
    ['https://test.test/en-US/sign-in#/?a=b', new URL('https://test.test/en-US/sign-in?a=b')],
  ];

  test.each(testCases)('url=(%s), expected value=(%s)', (url, expectedParamValue) => {
    expect(mergeFragmentIntoUrl(new URL(url)).href).toEqual(expectedParamValue.href);
    expect(mergeFragmentIntoUrl(url).href).toEqual(expectedParamValue.href);
  });
});

describe('isRedirectForFAPIInitiatedFlow(frontendAp: string, redirectUrl: string)', () => {
  const testCases: Array<[string, string, boolean]> = [
    ['clerk.foo.bar-53.lcl.dev', 'foo', false],
    ['clerk.foo.bar-53.lcl.dev', 'https://clerk.foo.bar-53.lcl.dev/deadbeef.', false],
    ['clerk.foo.bar-53.lcl.dev', 'https://clerk.foo.bar-53.lcl.dev/oauth/authorize', true],
    ['clerk.foo.bar-53.lcl.dev', 'https://clerk.foo.bar-53.lcl.dev/v1/verify', true],
    ['clerk.foo.bar-53.lcl.dev', 'https://clerk.foo.bar-53.lcl.dev/v1/tickets/accept', true],
    ['clerk.foo.bar-53.lcl.dev', 'https://google.com', false],
    ['clerk.foo.bar-53.lcl.dev', 'https://google.com/v1/verify', false],
  ];

  test.each(testCases)(
    'frontendApi=(%s), redirectUrl=(%s), expected value=(%s)',
    (frontendApi, redirectUrl, expectedValue) => {
      expect(isRedirectForFAPIInitiatedFlow(frontendApi, redirectUrl)).toEqual(expectedValue);
    },
  );
});

describe('requiresUserInput(redirectUrl: string)', () => {
  const testCases: Array<[string, boolean]> = [
    ['foo', false],
    ['https://clerk.foo.bar-53.lcl.dev/deadbeef.', false],
    ['https://clerk.foo.bar-53.lcl.dev/oauth/authorize', true],
    ['https://clerk.foo.bar-53.lcl.dev/v1/verify', false],
    ['https://clerk.foo.bar-53.lcl.dev/v1/tickets/accept', false],
    ['https://google.com', false],
    ['https://google.com/v1/verify', false],
  ];

  test.each(testCases)('redirectUrl=(%s), expected value=(%s)', (redirectUrl, expectedValue) => {
    expect(requiresUserInput(redirectUrl)).toEqual(expectedValue);
  });
});

describe('getETLDPlusOneFromFrontendApi(frontendAp: string)', () => {
  const testCases: Array<[string, string]> = [
    ['clerk.foo.bar-53.lcl.dev', 'foo.bar-53.lcl.dev'],
    ['clerk.clerk.com', 'clerk.com'],
    ['clerk.foo.bar.co.uk', 'foo.bar.co.uk'],
  ];

  test.each(testCases)('frontendApi=(%s), expected value=(%s)', (frontendApi, expectedValue) => {
    expect(getETLDPlusOneFromFrontendApi(frontendApi)).toEqual(expectedValue);
  });
});

describe('isAllowedRedirectOrigin', () => {
  const cases: [string, Array<string | RegExp> | undefined, boolean][] = [
    // base cases
    ['https://clerk.com', ['https://www.clerk.com'], false],
    ['https://www.clerk.com', ['https://www.clerk.com'], true],
    // glob patterns
    ['https://clerk.com', ['https://*.clerk.com'], false],
    ['https://www.clerk.com', ['https://*.clerk.com'], true],
    // trailing slashes
    ['https://www.clerk.com/', ['https://www.clerk.com'], true],
    ['https://www.clerk.com', ['https://www.clerk.com'], true],
    ['https://www.clerk.com/test', ['https://www.clerk.com'], true],
    ['https://www.clerk.com/test', ['https://www.clerk.com/'], true],
    // multiple origins
    ['https://www.clerk.com', ['https://www.test.dev', 'https://www.clerk.com'], true],
    // relative urls
    ['/relative', ['https://www.clerk.com'], true],
    ['/relative/test', ['https://www.clerk.com'], true],
    ['/', ['https://www.clerk.com'], true],
    // empty origins list for relative routes
    ['/', [], true],
    // empty origins list for absolute routes
    ['https://www.clerk.com/', [], false],
    //undefined origins
    ['https://www.clerk.com/', undefined, true],
    // query params
    ['https://www.clerk.com/foo?hello=1', ['https://www.clerk.com'], true],
    ['https://www.clerk.com/foo?hello=1', ['https://www.clerk.com/'], true],
    // regexp
    ['https://www.clerk.com/foo?hello=1', [/https:\/\/www\.clerk\.com/], true],
    ['https://test.clerk.com/foo?hello=1', [/https:\/\/www\.clerk\.com/], false],
  ];

  const warnMock = jest.spyOn(global.console, 'warn').mockImplementation();

  beforeEach(() => warnMock.mockClear());
  afterAll(() => warnMock.mockRestore());

  test.each(cases)('isAllowedRedirectOrigin("%s","%s") === %s', (url, allowedOrigins, expected) => {
    expect(isAllowedRedirectOrigin(url, allowedOrigins)).toEqual(expected);
    expect(warnMock).toHaveBeenCalledTimes(Number(!expected)); // Number(boolean) evaluates to 0 or 1
  });
});
