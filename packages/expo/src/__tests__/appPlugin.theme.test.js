import { beforeEach, describe, expect, test, vi } from 'vitest';

const { validateThemeJson } = require('../../app.plugin.js')._testing;

describe('validateThemeJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('accepts a valid full theme', () => {
    expect(() =>
      validateThemeJson({
        colors: { primary: '#6C47FF', background: '#FFFFFF' },
        darkColors: { primary: '#8B6FFF' },
        design: { borderRadius: 12, fontFamily: 'Inter' },
      }),
    ).not.toThrow();
  });

  test('accepts an empty theme (no keys)', () => {
    expect(() => validateThemeJson({})).not.toThrow();
  });

  test('throws when theme is null', () => {
    expect(() => validateThemeJson(null)).toThrow('theme JSON must be a plain object');
  });

  test('throws when theme is a string', () => {
    expect(() => validateThemeJson('hello')).toThrow('theme JSON must be a plain object');
  });

  test('throws when theme is an array', () => {
    expect(() => validateThemeJson([])).toThrow('theme JSON must be a plain object');
  });

  test('accepts theme with only design', () => {
    expect(() => validateThemeJson({ design: { borderRadius: 8 } })).not.toThrow();
  });

  // --- colors / darkColors shape validation ---

  test('throws when colors is a string', () => {
    expect(() => validateThemeJson({ colors: 'red' })).toThrow('colors must be an object');
  });

  test('throws when colors is an array', () => {
    expect(() => validateThemeJson({ colors: ['#FF0000'] })).toThrow('colors must be an object');
  });

  test('accepts colors: null (treated as absent)', () => {
    expect(() => validateThemeJson({ colors: null })).not.toThrow();
  });

  test('throws when darkColors is a number', () => {
    expect(() => validateThemeJson({ darkColors: 42 })).toThrow('darkColors must be an object');
  });

  // --- design shape validation ---

  test('throws when design is a string', () => {
    expect(() => validateThemeJson({ design: 'round' })).toThrow('design must be an object');
  });

  test('throws when design is an array', () => {
    expect(() => validateThemeJson({ design: [12] })).toThrow('design must be an object');
  });

  test('accepts design: null (treated as absent)', () => {
    expect(() => validateThemeJson({ design: null })).not.toThrow();
  });

  // --- hex color validation ---

  test('throws for invalid hex color (no hash)', () => {
    expect(() => validateThemeJson({ colors: { primary: 'FF0000' } })).toThrow('invalid hex color');
  });

  test('throws for 3-digit hex color', () => {
    expect(() => validateThemeJson({ colors: { primary: '#FFF' } })).toThrow('invalid hex color');
  });

  test('accepts 6-digit hex', () => {
    expect(() => validateThemeJson({ colors: { primary: '#FF00AA' } })).not.toThrow();
  });

  test('accepts 8-digit hex (with alpha)', () => {
    expect(() => validateThemeJson({ colors: { shadow: '#00000080' } })).not.toThrow();
  });

  // --- unknown keys ---

  test('warns on unknown color keys but does not throw', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => validateThemeJson({ colors: { customColor: '#FF0000' } })).not.toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('unknown color key "customColor"'));
  });

  // --- design field types ---

  test('throws when fontFamily is a number', () => {
    expect(() => validateThemeJson({ design: { fontFamily: 42 } })).toThrow('design.fontFamily must be a string');
  });

  test('throws when borderRadius is a string', () => {
    expect(() => validateThemeJson({ design: { borderRadius: '12' } })).toThrow('design.borderRadius must be a number');
  });
});
