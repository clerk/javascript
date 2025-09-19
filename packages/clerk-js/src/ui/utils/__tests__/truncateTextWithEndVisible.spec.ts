import { describe, expect, test } from 'vitest';

import { truncateWithEndVisible } from '../truncateTextWithEndVisible';

describe('truncateWithEndVisible', () => {
  test('should return empty string when input is empty', () => {
    expect(truncateWithEndVisible('')).toBe('');
  });

  test('should return original string when length is less than maxLength', () => {
    expect(truncateWithEndVisible('short')).toBe('short');
    expect(truncateWithEndVisible('123456789', 10)).toBe('123456789');
  });

  test('should truncate string with default parameters', () => {
    expect(truncateWithEndVisible('this is a very long string')).toBe('this is a ve...tring');
  });

  test('should truncate string with custom maxLength', () => {
    expect(truncateWithEndVisible('this is a very long string', 15)).toBe('this is...tring');
  });

  test('should truncate string with custom endChars', () => {
    expect(truncateWithEndVisible('this is a very long string', 20, 3)).toBe('this is a very...ing');
  });

  test('should handle edge case where maxLength is too small', () => {
    expect(truncateWithEndVisible('1234567890', 5, 3)).toBe('...890');
  });

  test('should handle email addresses', () => {
    expect(truncateWithEndVisible('test@example.com', 10)).toBe('te...e.com');
  });

  test('should handle very long strings', () => {
    const longString = 'a'.repeat(1000);
    expect(truncateWithEndVisible(longString, 20)).toBe('aaaaaaaaaaaa...aaaaa');
  });

  test('should handle strings with spaces', () => {
    expect(truncateWithEndVisible('hello world this is a test', 15)).toBe('hello w... test');
  });
});
