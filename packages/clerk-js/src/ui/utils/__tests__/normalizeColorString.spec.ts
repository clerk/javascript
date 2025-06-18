import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { normalizeColorString } from '../normalizeColorString';

describe('normalizeColorString', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {}) as vi.Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Hex color tests
  test('should keep 3-char hex colors unchanged', () => {
    expect(normalizeColorString('#123')).toBe('#123');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should keep 6-char hex colors unchanged', () => {
    expect(normalizeColorString('#123456')).toBe('#123456');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should remove alpha from 4-char hex colors', () => {
    expect(normalizeColorString('#123F')).toBe('#123');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should remove alpha from 8-char hex colors', () => {
    expect(normalizeColorString('#12345678')).toBe('#123456');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should warn for invalid hex formats but return the original', () => {
    expect(normalizeColorString('#12')).toBe('#12');
    expect(console.warn).toHaveBeenCalledTimes(1);

    (console.warn as vi.Mock).mockClear();
    expect(normalizeColorString('#12345')).toBe('#12345');
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  // RGB color tests
  test('should keep rgb format unchanged but normalize whitespace', () => {
    expect(normalizeColorString('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should convert rgba to rgb', () => {
    expect(normalizeColorString('rgba(255, 0, 0, 0.5)')).toBe('rgb(255, 0, 0)');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should handle rgb with whitespace variations', () => {
    expect(normalizeColorString('rgb(255,0,0)')).toBe('rgb(255, 0, 0)');
    expect(normalizeColorString('rgb( 255 , 0 , 0 )')).toBe('rgb(255, 0, 0)');
    expect(console.warn).not.toHaveBeenCalled();
  });

  // HSL color tests
  test('should keep hsl format unchanged but normalize whitespace', () => {
    expect(normalizeColorString('hsl(120, 100%, 50%)')).toBe('hsl(120, 100%, 50%)');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should convert hsla to hsl', () => {
    expect(normalizeColorString('hsla(120, 100%, 50%, 0.8)')).toBe('hsl(120, 100%, 50%)');
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should handle hsl with whitespace variations', () => {
    expect(normalizeColorString('hsl(120,100%,50%)')).toBe('hsl(120, 100%, 50%)');
    expect(normalizeColorString('hsl( 120 , 100% , 50% )')).toBe('hsl(120, 100%, 50%)');
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Warning tests for invalid inputs
  test('should warn for invalid color formats but return the original', () => {
    expect(normalizeColorString('')).toBe('');
    expect(console.warn).toHaveBeenCalledTimes(1);

    (console.warn as vi.Mock).mockClear();
    expect(normalizeColorString('invalid')).toBe('invalid');
    expect(console.warn).toHaveBeenCalledTimes(1);

    (console.warn as vi.Mock).mockClear();
    expect(normalizeColorString('rgb(255,0)')).toBe('rgb(255,0)');
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test('should warn for non-string inputs but return the original or empty string', () => {
    expect(normalizeColorString(null as any)).toBe('');
    expect(console.warn).toHaveBeenCalledTimes(1);

    (console.warn as vi.Mock).mockClear();
    expect(normalizeColorString(123 as any)).toBe(123 as any);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  // Edge cases
  test('should handle trimming whitespace', () => {
    expect(normalizeColorString('  #123  ')).toBe('#123');
    expect(normalizeColorString('\n rgb(255, 0, 0) \t')).toBe('rgb(255, 0, 0)');
    expect(console.warn).not.toHaveBeenCalled();
  });
});
