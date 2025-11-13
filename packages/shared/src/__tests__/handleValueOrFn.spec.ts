import { describe, expect, it } from 'vitest';

import { handleValueOrFn } from '../utils/handleValueOrFn';

const url = new URL('https://example.com');

describe('handleValueOrFn(opts)', () => {
  it.each([
    [undefined, undefined],
    [true, true],
    [false, false],
    [() => true, true],
    [() => false, false],
    ['', ''],
    ['some-domain', 'some-domain'],
    ['clerk.com', 'clerk.com'],
    [url => url.host, 'example.com'],
    [() => 'some-other-domain', 'some-other-domain'],
  ])('.handleValueOrFn(%s)', (key, expected) => {
    expect(handleValueOrFn(key, url)).toBe(expected);
  });
});

describe('handleValueOrFn(opts) with defaults', () => {
  it.each([
    [undefined, undefined, undefined],
    [undefined, true, true],
    [true, true, false],
    [undefined, false, false],
    [false, false, undefined],
    [undefined, 'some-domain', 'some-domain'],
  ])('.handleValueOrFn(%s)', (key, expected, defaultValue) => {
    expect(handleValueOrFn(key, url, defaultValue)).toBe(expected);
  });
});
