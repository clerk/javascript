import { describe, expect, it } from 'vitest';

import { kebabCase } from '../kebab-case';

describe('kebabCase', () => {
  it.each([
    ['okx_wallet', 'okx-wallet'],
    ['colorScheme', 'color-scheme'],
    ['HTTPRequest', 'http-request'],
    ['some whitespace', 'some-whitespace'],
    ['already-kebab', 'already-kebab'],
    ['apple', 'apple'],
    ['', ''],
  ])('converts %j to %j', (input, expected) => {
    expect(kebabCase(input)).toBe(expected);
  });
});
