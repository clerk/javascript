import { beforeEach, describe, expect, test, vi } from 'vitest';

// The plugin is plain CJS — load the validation function by evaluating
// just the relevant pieces.  We re-declare the constants and function
// exactly as they appear in app.plugin.js so the test stays in sync.
// ------------------------------------------------------------------

const VALID_COLOR_KEYS = [
  'primary',
  'background',
  'input',
  'danger',
  'success',
  'warning',
  'foreground',
  'mutedForeground',
  'primaryForeground',
  'inputForeground',
  'neutral',
  'border',
  'ring',
  'muted',
  'shadow',
];

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateThemeJson(theme) {
  const validateColors = (colors, label) => {
    if (!isPlainObject(colors)) {
      throw new Error(`Clerk theme: ${label} must be an object`);
    }
    for (const [key, value] of Object.entries(colors)) {
      if (!VALID_COLOR_KEYS.includes(key)) {
        console.warn(`⚠️  Clerk theme: unknown color key "${key}" in ${label}, ignoring`);
        continue;
      }
      if (typeof value !== 'string' || !HEX_COLOR_REGEX.test(value)) {
        throw new Error(`Clerk theme: invalid hex color for ${label}.${key}: "${value}"`);
      }
    }
  };

  if (theme.colors != null) validateColors(theme.colors, 'colors');
  if (theme.darkColors != null) validateColors(theme.darkColors, 'darkColors');

  if (theme.design != null) {
    if (!isPlainObject(theme.design)) {
      throw new Error(`Clerk theme: design must be an object`);
    }
    if (theme.design.fontFamily != null && typeof theme.design.fontFamily !== 'string') {
      throw new Error(`Clerk theme: design.fontFamily must be a string`);
    }
    if (theme.design.borderRadius != null && typeof theme.design.borderRadius !== 'number') {
      throw new Error(`Clerk theme: design.borderRadius must be a number`);
    }
  }
}

// ------------------------------------------------------------------

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
