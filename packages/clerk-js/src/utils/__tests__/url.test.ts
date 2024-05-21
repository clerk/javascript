import type { SignUpResource } from '@clerk/types';

import {
  buildURL,
  createAllowedRedirectOrigins,
  getETLDPlusOneFromFrontendApi,
  getSearchParameterFromHash,
  hasBannedProtocol,
  hasExternalAccountSignUpError,
  isAllowedRedirectOrigin,
  isDataUri,
  isDevAccountPortalOrigin,
  isRedirectForFAPIInitiatedFlow,
  isRelativeUrl,
  isValidUrl,
  mergeFragmentIntoUrl,
  relativeToAbsoluteUrl,
  requiresUserInput,
  trimLeadingSlash,
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
    ['', false],
    ['/', false],
    ['/test', false],
    ['/test?clerk=false', false],
    ['/?clerk=false', false],
    ['https://www.clerk.com/', true],
    ['https://www.clerk.com/?test=clerk', true],
    ['https://www.clerk.com', true],
    ['https://clerk.com', true],
    ['https://clerk.com#test', true],
    ['www.clerk.com/', false],
    ['www.clerk.com', false],
    ['www.clerk', false],
    ['clerk.com', false],
    ['clerk.com?clerk=yes', false],
    ['clerk.com#/?clerk=yes', false],
  ];

  test.each(cases)('.isValidUrl(%s,%s)', (a, expected) => {
    expect(isValidUrl(a)).toBe(expected);
  });
});

describe('isRelativeUrl(url,base)', () => {
  const cases: Array<[string, boolean]> = [
    ['', true],
    ['/', true],
    ['/test', true],
    ['/test?clerk=true', true],
    ['/?clerk=true', true],
    ['https://www.clerk.com/', false],
  ];

  test.each(cases)('.isRelativeUrl(%s,%s)', (a, expected) => {
    expect(isRelativeUrl(a)).toBe(expected);
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

  it('appends search params passed to hashSearchParams in the URL fragment', () => {
    const base = 'https://clerk.com/';
    const params = new URLSearchParams({ test1: '1', test2: '2' });
    const url = buildURL({ base, hashSearchParams: params }, { stringify: true });
    expect(url).toBe('https://clerk.com/#/?test1=1&test2=2');
  });

  it('does not append a URL fragment if nothing was passed', () => {
    const base = 'https://clerk.com/';
    const url = buildURL({ base }, { stringify: true });
    expect(url).toBe('https://clerk.com/');
  });

  it('does not append a URL fragment if search params were passed but were empty', () => {
    const base = 'https://clerk.com/';
    const params = new URLSearchParams({});
    const url = buildURL({ base, hashSearchParams: params }, { stringify: true });
    expect(url).toBe('https://clerk.com/');
  });

  it('appends search params to the fragment if search params is a plain object', () => {
    const base = 'https://clerk.com';
    const params = { test1: '1', test2: '2' };
    const url = buildURL({ base, hashSearchParams: params }, { stringify: true });
    expect(url).toBe('https://clerk.com/#/?test1=1&test2=2');
  });

  it('appends search params to the fragment by merging all passed in params', () => {
    const base = 'https://clerk.com';
    const url = buildURL(
      { base, hashSearchParams: [new URLSearchParams({ test1: '1', test2: '2' }), { test3: '3' }] },
      { stringify: true },
    );
    expect(url).toBe('https://clerk.com/#/?test1=1&test2=2&test3=3');
  });

  it('overrides duplicate search params, giving priority to objects passed last', () => {
    const base = 'https://clerk.com';
    const url = buildURL(
      { base, hashSearchParams: [new URLSearchParams({ test1: '1', test2: '2' }), { test2: '3' }] },
      { stringify: true },
    );
    expect(url).toBe('https://clerk.com/#/?test1=1&test2=3');
  });

  it('snake_cases all params', () => {
    const base = 'https://clerk.com';
    const params = { redirectUrl: '1', test2: '2' };
    const url = buildURL({ base, hashSearchParams: params }, { stringify: true });
    expect(url).toBe('https://clerk.com/#/?redirect_url=1&test2=2');
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

describe('trimLeadingSlash(string)', () => {
  it('trims all the leading slashes', () => {
    expect(trimLeadingSlash('')).toBe('');
    expect(trimLeadingSlash('/foo')).toBe('foo');
    expect(trimLeadingSlash('/foo/')).toBe('foo/');
    expect(trimLeadingSlash('//foo//bar///')).toBe('foo//bar///');
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
    ['https://test.test/en-US/sign-in?a=c#/?a=b', new URL('https://test.test/en-US/sign-in?a=b')],
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
    expect(isAllowedRedirectOrigin(allowedOrigins)(url)).toEqual(expected);
    expect(warnMock).toHaveBeenCalledTimes(Number(!expected)); // Number(boolean) evaluates to 0 or 1
  });
});

describe('createAllowedRedirectOrigins', () => {
  it('contains the default allowed origin values if no value is provided', async () => {
    const frontendApi = 'https://somename.clerk.accounts.dev';
    const allowedRedirectOriginsValuesUndefined = createAllowedRedirectOrigins(undefined, frontendApi);
    const allowedRedirectOriginsValuesEmptyArray = createAllowedRedirectOrigins([], frontendApi);

    expect(allowedRedirectOriginsValuesUndefined).toEqual([
      'http://localhost',
      `https://${getETLDPlusOneFromFrontendApi(frontendApi)}`,
      `https://*.${getETLDPlusOneFromFrontendApi(frontendApi)}`,
    ]);

    expect(allowedRedirectOriginsValuesEmptyArray).toEqual([
      'http://localhost',
      `https://${getETLDPlusOneFromFrontendApi(frontendApi)}`,
      `https://*.${getETLDPlusOneFromFrontendApi(frontendApi)}`,
    ]);
  });

  it('contains only the allowedRedirectOrigins options given', async () => {
    const frontendApi = 'https://somename.clerk.accounts.dev';
    const allowedRedirectOriginsValues = createAllowedRedirectOrigins(
      ['https://test.host', 'https://*.test.host'],
      frontendApi,
    );

    expect(allowedRedirectOriginsValues).toEqual(['https://test.host', 'https://*.test.host']);
  });
});

describe('relativeToAbsoluteUrl', () => {
  const cases: [string, string, string][] = [
    ['https://www.clerk.com', '/test', 'https://www.clerk.com/test'],
    ['https://www.clerk.com', 'test', 'https://www.clerk.com/test'],
    ['https://www.clerk.com/', '/test', 'https://www.clerk.com/test'],
    ['https://www.clerk.com/', 'test', 'https://www.clerk.com/test'],
    ['https://www.clerk.com', 'https://www.clerk.com/test', 'https://www.clerk.com/test'],
    ['https://www.clerk.com', 'https://www.google.com/test', 'https://www.google.com/test'],
  ];

  test.each(cases)('relativeToAbsoluteUrl(%s, %s) === %s', (origin, relative, expected) => {
    expect(relativeToAbsoluteUrl(relative, origin)).toEqual(expected);
  });
});
