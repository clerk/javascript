import { addClerkPrefix, parseSearchParams, stripScheme } from './url';

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
