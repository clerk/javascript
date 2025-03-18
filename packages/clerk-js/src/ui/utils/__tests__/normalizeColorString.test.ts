import { normalizeColorString } from '../normalizeColorString';

describe('normalizeColorString', () => {
  // Hex color tests
  test('should keep 3-char hex colors unchanged', () => {
    expect(normalizeColorString('#123')).toBe('#123');
  });

  test('should keep 6-char hex colors unchanged', () => {
    expect(normalizeColorString('#123456')).toBe('#123456');
  });

  test('should remove alpha from 4-char hex colors', () => {
    expect(normalizeColorString('#123F')).toBe('#123');
  });

  test('should remove alpha from 8-char hex colors', () => {
    expect(normalizeColorString('#12345678')).toBe('#123456');
  });

  // RGB color tests
  test('should keep rgb format unchanged', () => {
    expect(normalizeColorString('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
  });

  test('should convert rgba to rgb', () => {
    expect(normalizeColorString('rgba(255, 0, 0, 0.5)')).toBe('rgb(255, 0, 0)');
  });

  test('should handle rgb with whitespace variations', () => {
    expect(normalizeColorString('rgb(255,0,0)')).toBe('rgb(255, 0, 0)');
    expect(normalizeColorString('rgb( 255 , 0 , 0 )')).toBe('rgb(255, 0, 0)');
  });

  // HSL color tests
  test('should keep hsl format unchanged', () => {
    expect(normalizeColorString('hsl(120, 100%, 50%)')).toBe('hsl(120, 100%, 50%)');
  });

  test('should convert hsla to hsl', () => {
    expect(normalizeColorString('hsla(120, 100%, 50%, 0.8)')).toBe('hsl(120, 100%, 50%)');
  });

  // Error handling tests
  test('should throw error for invalid color formats', () => {
    expect(() => normalizeColorString('')).toThrow();
    expect(() => normalizeColorString('invalid')).toThrow();
    expect(() => normalizeColorString('rgb(255,0)')).toThrow();
  });

  test('should throw error for non-string inputs', () => {
    expect(() => normalizeColorString(null as any)).toThrow();
    expect(() => normalizeColorString(undefined as any)).toThrow();
    expect(() => normalizeColorString(123 as any)).toThrow();
  });

  // Edge cases
  test('should handle trimming whitespace', () => {
    expect(normalizeColorString('  #123  ')).toBe('#123');
    expect(normalizeColorString('\n rgb(255, 0, 0) \t')).toBe('rgb(255, 0, 0)');
  });
});
