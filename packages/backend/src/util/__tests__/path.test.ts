import { describe, expect, it } from 'vitest';

import { joinPaths } from '../path';

describe('utils.joinPaths(...args)', () => {
  it('joins the provided paths safely', () => {
    expect(joinPaths('foo', '/bar', '/qux//')).toBe('foo/bar/qux/');
  });

  it('does not affect url scheme', () => {
    expect(joinPaths('https://api.clerk.com', 'v1', '/organizations/org_xxxxxxxxxxxxxxxxx')).toBe(
      'https://api.clerk.com/v1/organizations/org_xxxxxxxxxxxxxxxxx',
    );
  });

  it('does not affect url scheme and removes duplicate separators', () => {
    expect(joinPaths('https://api.clerk.com//', '/v1/', '//organizations/org_xxxxxxxxxxxxxxxxx//')).toBe(
      'https://api.clerk.com/v1/organizations/org_xxxxxxxxxxxxxxxxx/',
    );
  });

  it('handles null and undefined values', () => {
    expect(joinPaths('foo', null, undefined, 'bar')).toBe('foo/bar');
  });

  it('handles empty strings', () => {
    expect(joinPaths('foo', '', 'bar')).toBe('foo/bar');
  });

  it('returns an empty string when all inputs are null, undefined, or empty', () => {
    expect(joinPaths(null, undefined, '')).toBe('');
  });

  it('handles single path input', () => {
    expect(joinPaths('foo')).toBe('foo');
  });

  it('handles no input', () => {
    expect(joinPaths()).toBe('');
  });

  it('accepts "." and ".." within a segment (not entire segment)', () => {
    // Dot not as an isolated path segment
    expect(joinPaths('foo.bar', 'baz')).toBe('foo.bar/baz');
    expect(joinPaths('foo..bar', 'baz')).toBe('foo..bar/baz');
    expect(joinPaths('foo.', 'bar.')).toBe('foo./bar.');
    expect(joinPaths('foo..', '..bar')).toBe('foo../..bar');
    expect(joinPaths('foo..baz')).toBe('foo..baz');
    expect(joinPaths('fo.o', 'ba..z')).toBe('fo.o/ba..z');
  });

  it('accepts "." and ".." inside query parameter or as value', () => {
    // . and .. as values in query string should not be considered dot segments
    expect(joinPaths('/api', 'users?filter=..')).toBe('/api/users?filter=..');
    expect(joinPaths('/api', 'users?filter=.')).toBe('/api/users?filter=.');
    expect(joinPaths('/v1', 'search?q=foo.bar..baz')).toBe('/v1/search?q=foo.bar..baz');
    // . and .. within querystring, fragment, or a value
    expect(joinPaths('/foo', '?bar=..&baz=.')).toBe('/foo/?bar=..&baz=.');
    expect(joinPaths('/foo', '#frag..ment')).toBe('/foo/#frag..ment');
  });

  it('rejects literal ".." segments', () => {
    expect(() => joinPaths('/sessions', 'sess_abc', 'tokens', '../../../users')).toThrow();
    expect(() => joinPaths('/sessions', '..')).toThrow();
  });

  it('rejects "." segments', () => {
    expect(() => joinPaths('foo/./bar')).toThrow();
    expect(() => joinPaths('foo', '.', 'bar')).toThrow();
    expect(() => joinPaths('foo', './', 'bar')).toThrow();
  });

  it('rejects percent-encoded dot segments', () => {
    expect(() => joinPaths('/sessions', 'sess_abc', 'tokens', '%2e%2e/users')).toThrow();
    expect(() => joinPaths('/sessions', 'sess_abc', 'tokens', '%2E%2E/users')).toThrow();
    expect(() => joinPaths('/sessions', 'sess_abc', 'tokens', '.%2E/users')).toThrow();
    expect(() => joinPaths('/sessions', 'sess_abc', 'tokens', '%2e%2e%2fusers')).toThrow();
    expect(() => joinPaths('/sessions', 'sess_abc', 'tokens', '%2e%2e%252fusers')).toThrow();
    expect(() => joinPaths('foo', '%2e', 'bar')).toThrow();
  });

  it('allows legitimate URLs and ID-like segments', () => {
    expect(joinPaths('https://api.clerk.com', 'v1', '/sessions/sess_abc/tokens/supabase')).toBe(
      'https://api.clerk.com/v1/sessions/sess_abc/tokens/supabase',
    );
  });
});
