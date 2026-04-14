import { describe, expect, test, vi } from 'vitest';

import { createPathMatcher, MalformedURLError } from '../pathMatcher';

vi.mock('../pathToRegexp', () => ({
  pathToRegexp: (pattern: string) => new RegExp(`^${pattern.replace('(.*)', '.*')}$`),
}));

describe('createPathMatcher', () => {
  test('matches exact paths', () => {
    const matcher = createPathMatcher('/foo');
    expect(matcher('/foo')).toBe(true);
    expect(matcher('/bar')).toBe(false);
  });

  test('matches wildcard patterns', () => {
    const matcher = createPathMatcher('/foo(.*)');
    expect(matcher('/foo')).toBe(true);
    expect(matcher('/foo/bar')).toBe(true);
    expect(matcher('/foo/bar/baz')).toBe(true);
    expect(matcher('/bar')).toBe(false);
  });

  test('matches array of patterns', () => {
    const matcher = createPathMatcher(['/foo', '/bar(.*)']);
    expect(matcher('/foo')).toBe(true);
    expect(matcher('/bar')).toBe(true);
    expect(matcher('/bar/baz')).toBe(true);
    expect(matcher('/baz')).toBe(false);
    expect(matcher('/foo/bar')).toBe(false);
  });

  test('matches RegExp patterns', () => {
    const matcher = createPathMatcher(/^\/foo\/.*$/);
    expect(matcher('/foo/bar')).toBe(true);
    expect(matcher('/foo/baz')).toBe(true);
    expect(matcher('/bar/foo')).toBe(false);
  });

  test('handles empty or falsy inputs', () => {
    const matcher = createPathMatcher('');
    expect(matcher('/any/path')).toBe(false);

    const nullMatcher = createPathMatcher(null as any);
    expect(nullMatcher('/any/path')).toBe(false);
  });

  test('handles mixed pattern types', () => {
    const matcher = createPathMatcher(['/foo(.*)', /^\/bar\/.*$/, '/baz']);
    expect(matcher('/foo/anything')).toBe(true);
    expect(matcher('/bar/anything')).toBe(true);
    expect(matcher('/baz')).toBe(true);
    expect(matcher('/qux')).toBe(false);
  });

  describe('percent-encoded paths', () => {
    test('matches percent-encoded characters in path segments', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/%61dmin/users')).toBe(true);
      expect(matcher('/api/a%64min/users')).toBe(true);
      expect(matcher('/api/adm%69n/users')).toBe(true);
    });

    test('matches fully percent-encoded path', () => {
      const matcher = createPathMatcher('/foo/bar');
      expect(matcher('/%66oo/bar')).toBe(true);
      expect(matcher('/f%6fo/bar')).toBe(true);
    });

    test('matches percent-encoded paths with wildcard patterns', () => {
      const matcher = createPathMatcher(['/api/admin(.*)']);
      expect(matcher('/api/%61dmin/users')).toBe(true);
      expect(matcher('/api/%61dmin')).toBe(true);
    });

    test('matches percent-encoded paths with array of patterns', () => {
      const matcher = createPathMatcher(['/api/invoices(.*)', '/api/admin(.*)']);
      expect(matcher('/api/%61dmin/users')).toBe(true);
      expect(matcher('/api/inv%6fices/123')).toBe(true);
    });

    test('does not match unrelated percent-encoded paths', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/%62dmin/users')).toBe(false);
    });

    test('handles already-decoded paths unchanged', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/admin/users')).toBe(true);
    });

    test('throws MalformedURLError on malformed percent-encoding', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(() => matcher('/api/%zz/users')).toThrow(MalformedURLError);
      expect(() => matcher('/%')).toThrow(MalformedURLError);
    });
  });

  describe('double-slash normalization', () => {
    test('matches paths with double slashes before the protected segment', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('//api/admin/users')).toBe(true);
      expect(matcher('///api/admin/users')).toBe(true);
    });

    test('matches paths with double slashes in the middle', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api//admin/users')).toBe(true);
      expect(matcher('/api///admin/users')).toBe(true);
    });

    test('matches paths with double slashes after the protected segment', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/admin//users')).toBe(true);
    });

    test('does not match unrelated paths with double slashes', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('//api/other/users')).toBe(false);
      expect(matcher('/other//api/admin')).toBe(false);
    });

    test('handles combined percent-encoding and double slashes', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('//api/%61dmin/users')).toBe(true);
      expect(matcher('/api//%61dmin/users')).toBe(true);
    });
  });
});
