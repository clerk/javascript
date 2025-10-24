import { describe, expect, it } from 'vitest';

import { formatToCompactNumber } from '../intl';

describe('formatToCompactNumber()', function () {
  it('formats number to en-US', function () {
    expect(formatToCompactNumber(1000, 'en-US')).toBe('1K');
    expect(formatToCompactNumber(5698, 'en-US')).toBe('5.7K');
    expect(formatToCompactNumber(5610, 'en-US')).toBe('5.6K');
  });

  it('formats big number correctly to en-US', function () {
    expect(formatToCompactNumber(1_000_000, 'en-US')).toBe('1M');
    expect(formatToCompactNumber(1_000_000_000, 'en-US')).toBe('1B');
    expect(formatToCompactNumber(1_000_900_000, 'en-US')).toBe('1B');
    expect(formatToCompactNumber(1_099_999_999, 'en-US')).toBe('1.1B');
    expect(formatToCompactNumber(1_999_000_000, 'en-US')).toBe('2B');
  });

  it('returns the same value is less than 100', function () {
    expect(formatToCompactNumber(100, 'en-US')).toBe('100');
    expect(formatToCompactNumber(1, 'en-US')).toBe('1');
    expect(formatToCompactNumber(999, 'en-US')).toBe('999');
  });
});
