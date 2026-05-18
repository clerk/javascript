import { describe, expect, test, vi } from 'vitest';

import { createPathMatcher, isMalformedURLError, MalformedURLError, normalizePath } from '../pathMatcher';

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

    test('does not match when reserved delimiters keep segments apart', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      // %2F is an encoded slash — preserved by decodeURI, so the path stays as one segment
      expect(matcher('/api%2Fadmin/users')).toBe(false);
    });

    test('throws MalformedURLError on malformed percent-encoding', () => {
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(() => matcher('/api/%zz/users')).toThrow(MalformedURLError);
      expect(() => matcher('/%')).toThrow(MalformedURLError);
    });

    test('does not resolve dot-segments — `..` is treated as literal text', () => {
      // Pinning current behavior: createPathMatcher does not perform RFC 3986
      // §5.2.4 dot-segment removal. Callers are responsible for passing a
      // pathname that has already had `..` resolved (frameworks built on the
      // WHATWG URL parser do this automatically). If anyone later teaches
      // normalizePath to resolve `..`, that's a behavior change that should
      // be deliberate and update this test.
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/public/%2E%2E/api/admin')).toBe(false);
      expect(matcher('/public/../api/admin')).toBe(false);
    });

    test('decodes exactly once — does not collapse double-percent encoding', () => {
      // Pinning current behavior: normalizePath calls decodeURI a single
      // time. `%2561dmin` decodes to `%61dmin` (literal `%` + `61dmin`),
      // not `admin`. A two-pass decode would change matching semantics for
      // any pattern containing literal `%` and is intentionally not done.
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/%2561dmin/users')).toBe(false);
      expect(normalizePath('/api/%2561dmin')).toBe('/api/%61dmin');
    });

    test('decodes UTF-8 multi-byte sequences', () => {
      // Decoded codepoint must round-trip cleanly through the matcher.
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/admin/%E6%97%A5%E6%9C%AC')).toBe(true); // 日本
      expect(matcher('/api/admin/%F0%9F%92%A9')).toBe(true); // 💩 (surrogate pair)
      expect(normalizePath('/api/%E6%97%A5')).toBe('/api/日');
    });

    test('decodes backslash to a literal backslash, not a slash', () => {
      // %5C is not in decodeURI's reservedURISet and not a path delimiter,
      // so it decodes to `\` and stays as one character. Some servers
      // (notably IIS) historically aliased `\` to `/`; that aliasing is the
      // upstream router's job, not the matcher's, and the WHATWG URL parser
      // handles it before pathname is ever seen here.
      expect(normalizePath('/api/admin%5Cfoo')).toBe('/api/admin\\foo');
      const matcher = createPathMatcher('/api/admin(.*)');
      expect(matcher('/api/admin%5Cfoo')).toBe(true);
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

describe('normalizePath', () => {
  describe('percent-encoding', () => {
    test('decodes unreserved percent-encoded characters', () => {
      expect(normalizePath('/api/%61dmin')).toBe('/api/admin');
      expect(normalizePath('/api/a%64min')).toBe('/api/admin');
      expect(normalizePath('/%66oo/bar')).toBe('/foo/bar');
    });

    test('preserves path-reserved delimiters (%2F, %3F, %23)', () => {
      expect(normalizePath('/api%2Fadmin')).toBe('/api%2Fadmin');
      expect(normalizePath('/api/admin%3Fusers')).toBe('/api/admin%3Fusers');
      expect(normalizePath('/api/admin%23section')).toBe('/api/admin%23section');
    });

    test('returns already-decoded paths unchanged', () => {
      expect(normalizePath('/api/admin/users')).toBe('/api/admin/users');
    });

    test('throws MalformedURLError on invalid percent-encoding', () => {
      expect(() => normalizePath('/api/%zz/users')).toThrow(MalformedURLError);
      expect(() => normalizePath('/%')).toThrow(MalformedURLError);
    });
  });

  describe('slash normalization', () => {
    test('collapses double slashes', () => {
      expect(normalizePath('//api/admin')).toBe('/api/admin');
      expect(normalizePath('/api//admin')).toBe('/api/admin');
      expect(normalizePath('/api/admin//users')).toBe('/api/admin/users');
    });

    test('collapses triple and more slashes', () => {
      expect(normalizePath('///api/admin')).toBe('/api/admin');
      expect(normalizePath('/api///admin')).toBe('/api/admin');
    });

    test('leaves single slashes unchanged', () => {
      expect(normalizePath('/api/admin/users')).toBe('/api/admin/users');
    });
  });

  describe('combined normalization', () => {
    test('decodes percent-encoding and collapses slashes together', () => {
      expect(normalizePath('//api/%61dmin/users')).toBe('/api/admin/users');
      expect(normalizePath('/api//%61dmin')).toBe('/api/admin');
    });
  });
});

describe('MalformedURLError', () => {
  // Public contract: callers like clerkMiddleware fail closed on this exception
  // class. The shape (name, statusCode, instanceof Error) and the cross-bundle
  // detection helper are part of that contract — pin them so they can't drift
  // silently across releases.

  test('has the documented public shape', () => {
    const err = new MalformedURLError('/foo');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('MalformedURLError');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('/foo');
  });

  test('preserves the cause when one is provided', () => {
    const cause = new URIError('boom');
    const err = new MalformedURLError('/foo', cause);
    expect(err.cause).toBe(cause);
  });

  test('isMalformedURLError detects instances by name (not by class identity)', () => {
    // The string-based check exists so callers in other bundles can detect
    // MalformedURLError thrown by a different copy of @clerk/shared. Pin
    // both halves: the positive case and the negative cases.
    expect(isMalformedURLError(new MalformedURLError('/x'))).toBe(true);

    const lookalike = new Error('not us');
    lookalike.name = 'MalformedURLError';
    expect(isMalformedURLError(lookalike)).toBe(true);

    expect(isMalformedURLError(new Error('plain'))).toBe(false);
    expect(isMalformedURLError(new URIError('uri'))).toBe(false);
    expect(isMalformedURLError(undefined)).toBe(false);
    expect(isMalformedURLError(null)).toBe(false);
    expect(isMalformedURLError('MalformedURLError')).toBe(false);
    expect(isMalformedURLError({ name: 'MalformedURLError' })).toBe(false);
  });
});
