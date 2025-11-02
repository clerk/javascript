import { describe, expect, it } from 'vitest';

import { joinPaths } from '../path';

describe('joinPaths(a, b)', () => {
  const cases = [
    [null, null, ''],
    [undefined, undefined, ''],
    ['', '', ''],
    ['foo', 'bar', 'foo/bar'],
    ['/foo', '/bar', '/foo/bar'],
    ['/foo//', '/bar', '/foo/bar'],
    ['/foo///', '//bar//', '/foo/bar/'],
  ];

  // @ts-ignore
  it.each(cases)('given %p and %p as arguments, returns %p', (firstPath, secondPath, expectedPath) => {
    expect(joinPaths(firstPath, secondPath)).toBe(expectedPath);
  });
});
