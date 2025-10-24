import { describe, expect, test, vi } from 'vitest';

import { createPathMatcher } from '../pathMatcher';

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
});
