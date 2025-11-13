import { describe, expect, it, test } from 'vitest';

import {
  addClerkPrefix,
  cleanDoubleSlashes,
  getClerkJsMajorVersionOrTag,
  getScriptUrl,
  joinURL,
  parseSearchParams,
  stripScheme,
  withoutTrailingSlash,
  withTrailingSlash,
} from '../url';

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

  it('returns canary if pkgVersion is not provided and frontendApi is staging', () => {
    expect(getClerkJsMajorVersionOrTag(stagingFrontendApi)).toBe('canary');
  });

  it('returns latest if pkgVersion is not provided and frontendApi is not staging', () => {
    expect(getClerkJsMajorVersionOrTag('foobar.dev')).toBe('latest');
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

  it('returns URL using the latest version if clerkJSVersion is not provided + frontendApi is not staging', () => {
    expect(getScriptUrl(frontendApi, {})).toBe('https://foobar.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js');
  });

  it('returns URL using the canary tag if frontendApi is staging', () => {
    expect(getScriptUrl('https://foobar.lclstage.dev', {})).toBe(
      'https://foobar.lclstage.dev/npm/@clerk/clerk-js@canary/dist/clerk.browser.js',
    );
  });
});

describe('joinURL', () => {
  const tests = [
    { input: [], out: '' },
    { input: ['/'], out: '/' },
    { input: [null, './'], out: './' },
    { input: ['/a'], out: '/a' },
    { input: ['a', 'b'], out: 'a/b' },
    { input: ['/a', 'b'], out: '/a/b' },
    { input: ['/', '/b'], out: '/b' },
    { input: ['a', 'b/', 'c'], out: 'a/b/c' },
    { input: ['a', 'b/', '/c'], out: 'a/b/c' },
    { input: ['/', './'], out: '/' },
    { input: ['/', './foo'], out: '/foo' },
    { input: ['/', './foo/'], out: '/foo/' },
    { input: ['/', './foo', 'bar'], out: '/foo/bar' },
  ];

  for (const t of tests) {
    test(JSON.stringify(t.input), () => {
      // @ts-expect-error - Tests
      expect(joinURL(...t.input)).toBe(t.out);
    });
  }

  test('no arguments', () => {
    // @ts-expect-error - Tests
    expect(joinURL()).toBe('');
  });
});

describe('withTrailingSlash, queryParams: false', () => {
  const tests = {
    '': '/',
    bar: 'bar/',
    'bar#abc': 'bar#abc/',
    'bar/': 'bar/',
    'foo?123': 'foo?123/',
    'foo/?123': 'foo/?123/',
    'foo/?123#abc': 'foo/?123#abc/',
  };

  for (const input in tests) {
    test(input, () => {
      expect(withTrailingSlash(input)).toBe(tests[input]);
    });
  }

  test('falsy value', () => {
    expect(withTrailingSlash()).toBe('/');
  });
});

describe('withTrailingSlash, queryParams: true', () => {
  const tests = {
    '': '/',
    bar: 'bar/',
    'bar/': 'bar/',
    'foo?123': 'foo/?123',
    'foo/?123': 'foo/?123',
    'foo?123#abc': 'foo/?123#abc',
    '/#abc': '/#abc',
    '#abc': '#abc',
    '#': '#',
  };

  for (const input in tests) {
    test(input, () => {
      expect(withTrailingSlash(input, true)).toBe(tests[input]);
    });
  }

  test('falsy value', () => {
    expect(withTrailingSlash()).toBe('/');
  });
});

describe('withoutTrailingSlash, queryParams: false', () => {
  const tests = {
    '': '/',
    '/': '/',
    bar: 'bar',
    'bar#abc': 'bar#abc',
    'bar/#abc': 'bar/#abc',
    'foo?123': 'foo?123',
    'foo/?123': 'foo/?123',
    'foo/?123#abc': 'foo/?123#abc',
  };

  for (const input in tests) {
    test(input, () => {
      expect(withoutTrailingSlash(input)).toBe(tests[input]);
    });
  }

  test('falsy value', () => {
    expect(withoutTrailingSlash()).toBe('/');
  });
});

describe('withoutTrailingSlash, queryParams: true', () => {
  const tests = {
    '': '/',
    '/': '/',
    bar: 'bar',
    'bar/': 'bar',
    'bar#abc': 'bar#abc',
    'bar/#abc': 'bar#abc',
    'foo?123': 'foo?123',
    'foo/?123': 'foo?123',
    'foo/?123#abc': 'foo?123#abc',
    '/a/#abc': '/a#abc',
    '/#abc': '/#abc',
  };

  for (const input in tests) {
    test(input, () => {
      expect(withoutTrailingSlash(input, true)).toBe(tests[input]);
    });
  }

  test('falsy value', () => {
    expect(withoutTrailingSlash()).toBe('/');
  });
});

describe('cleanDoubleSlashes', () => {
  const tests = {
    '//foo//bar//': '/foo/bar/',
    'http://foo.com//': 'http://foo.com/',
    'http://foo.com/bar//foo/': 'http://foo.com/bar/foo/',
    'http://example.com/analyze//http://localhost:3000//': 'http://example.com/analyze/http://localhost:3000/',
  };

  for (const input in tests) {
    test(input, () => {
      expect(cleanDoubleSlashes(input)).toBe(tests[input]);
    });
  }

  test('no input', () => {
    expect(cleanDoubleSlashes()).toBe('');
  });
});
