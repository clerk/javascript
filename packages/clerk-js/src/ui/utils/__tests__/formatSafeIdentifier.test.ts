import { describe, expect, it } from 'vitest';

import { formatSafeIdentifier } from '../formatSafeIdentifier';

describe('formatSafeIdentifier', () => {
  const cases = [
    ['hello@example.com', 'hello@example.com'],
    ['h***@***.com', 'h***@***.com'],
    ['username', 'username'],
    ['u***e', 'u***e'],
    ['+71111111111', '+7 111 111-11-11'],
    ['+791*******1', '+791*******1'],
  ];

  it.each(cases)('formats the safe identifier', (str, expected) => {
    expect(formatSafeIdentifier(str)).toBe(expected);
  });
});
