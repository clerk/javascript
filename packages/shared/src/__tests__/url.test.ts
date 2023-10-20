import { addClerkPrefix, getClerkJsMajorVersionOrTag, getScriptUrl, parseSearchParams, stripScheme } from '../url';

describe('parseSearchParams(queryString)', () => {
  it('parses query string and returns a URLSearchParams object', () => {
    let searchParams = parseSearchParams('');
    expect(searchParams.get('foo')).toBeNull();

    searchParams = parseSearchParams('foo=42&bar=43');
    expect(searchParams.get('foo')).toBe('42');
    expect(searchParams.get('bar')).toBe('43');

    searchParams = parseSearchParams('?foo=42&bar=43');
    expect(searchParams.get('foo')).toBe('42');
    expect(searchParams.get('bar')).toBe('43');
  });
});

describe('stripScheme(url)', () => {
  const cases = [
    ['', ''],
    ['example.com', 'example.com'],
    ['example.com//', 'example.com//'],
    ['http://example.com', 'example.com'],
    ['https://example.com', 'example.com'],
    ['ftp://example.com', 'example.com'],
    ['custom-scheme://example.com', 'example.com'],
  ];

  it.each(cases)('removes scheme from url: %p', (urlInput, urlOutput) => {
    expect(stripScheme(urlInput)).toBe(urlOutput);
  });
});

describe('addClerkPrefix(str)', () => {
  const undefinedCase = [[undefined, '']];

  it.each(undefinedCase)('attempts to add the prefix clerk. to %p', (urlInput, urlOutput) => {
    expect(addClerkPrefix(urlInput)).toBe(urlOutput);
  });

  const cases = [
    ['', ''],
    ['example.com', 'clerk.example.com'],
    ['clerk.example.com', 'clerk.example.com'],
    ['clerk.clerk.example.com', 'clerk.example.com'],
    ['clerk.abc', 'clerk.clerk.abc'],
    ['clerk.com', 'clerk.clerk.com'],
    ['clerk.clerk.com', 'clerk.clerk.com'],
    ['clerk.clerk.clerk.com', 'clerk.clerk.com'],
    ['satellite.dev', 'clerk.satellite.dev'],
    ['clerk.satellite.dev', 'clerk.satellite.dev'],
    ['quick-marten-1.clerk.accounts.lclclerk.com', 'quick-marten-1.clerk.accounts.lclclerk.com'],
    ['noble-fox-4.clerk.accounts.dev', 'noble-fox-4.clerk.accounts.dev'],
  ];
  it.each(cases)('attempts to add the prefix clerk. to %p', (urlInput, urlOutput) => {
    expect(addClerkPrefix(urlInput)).toBe(urlOutput);
  });
});

describe('getClerkJsMajorVersionOrTag', () => {
  const stagingFrontendApi = 'foobar.lclstage.dev';

  it('returns staging if pkgVersion is not provided and frontendApi is staging', () => {
    expect(getClerkJsMajorVersionOrTag(stagingFrontendApi)).toBe('staging');
  });

  it('returns latest if pkgVersion is not provided and frontendApi is not staging', () => {
    expect(getClerkJsMajorVersionOrTag('foobar.dev')).toBe('latest');
  });

  it('returns next if pkgVersion contains next', () => {
    expect(getClerkJsMajorVersionOrTag('foobar.dev', '1.2.3-next.4')).toBe('next');
  });

  it('returns the major version if pkgVersion is provided', () => {
    expect(getClerkJsMajorVersionOrTag('foobar.dev', '1.2.3')).toBe('1');
  });

  it('returns latest if pkgVersion is empty string', () => {
    expect(getClerkJsMajorVersionOrTag('foobar.dev', '')).toBe('latest');
  });
});

describe('getScriptUrl', () => {
  const frontendApi = 'https://foobar.dev';

  it('returns URL using the clerkJSVersion if provided', () => {
    expect(getScriptUrl(frontendApi, { clerkJSVersion: '1.2.3' })).toBe(
      'https://foobar.dev/npm/@clerk/clerk-js@1.2.3/dist/clerk.browser.js',
    );
  });

  it('returns URL using the latest version if clerkJSVersion & pkgVersion is not provided + frontendApi is not staging', () => {
    expect(getScriptUrl(frontendApi, {})).toBe('https://foobar.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js');
  });

  it('returns URL using the major version if only pkgVersion is provided', () => {
    expect(getScriptUrl(frontendApi, { pkgVersion: '1.2.3' })).toBe(
      'https://foobar.dev/npm/@clerk/clerk-js@1/dist/clerk.browser.js',
    );
  });

  it('returns URL using the major version if only pkgVersion contains next', () => {
    expect(getScriptUrl(frontendApi, { pkgVersion: '1.2.3-next.4' })).toBe(
      'https://foobar.dev/npm/@clerk/clerk-js@next/dist/clerk.browser.js',
    );
  });

  it('returns URL using the staging tag if frontendApi is staging', () => {
    expect(getScriptUrl('https://foobar.lclstage.dev', {})).toBe(
      'https://foobar.lclstage.dev/npm/@clerk/clerk-js@staging/dist/clerk.browser.js',
    );
  });
});
