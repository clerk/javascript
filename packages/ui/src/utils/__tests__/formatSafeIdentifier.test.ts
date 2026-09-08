import { describe, expect, it } from 'vitest';

import { formatSafeIdentifier, maskEmailAddress } from '../formatSafeIdentifier';

describe('formatSafeIdentifier', () => {
  const cases = [
    ['hello@example.com', 'hello@example.com'],
    ['h***@***.com', 'h***@***.com'],
    ['username', 'username'],
    ['u***e', 'u***e'],
    ['4245554242', '4245554242'],
    ['+71111111111', '+7 111 111-11-11'],
    ['+791*******1', '+791*******1'],
  ];

  it.each(cases)('formats the safe identifier', (str, expected) => {
    expect(formatSafeIdentifier(str)).toBe(expected);
  });
});

describe('maskEmailAddress', () => {
  const cases = [
    ['hello@example.com', 'h***@example.com'],
    ['h***@example.com', 'h***@example.com'],
    ['a@example.com', 'a***@example.com'],
    ['username', 'username'],
    ['@example.com', '@example.com'],
    ['', ''],
  ];

  it.each(cases)('masks the local part of %s', (str, expected) => {
    expect(maskEmailAddress(str)).toBe(expected);
  });
});
