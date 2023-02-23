import { parseSearchParams, stripScheme } from './url';

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
