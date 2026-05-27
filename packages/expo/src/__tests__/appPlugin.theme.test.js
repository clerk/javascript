import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const plugin = require('../../app.plugin.js');
const { validateThemeJson } = plugin._testing;
const { withClerkTheme } = plugin;

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

// Deterministic delivery check: proves the config plugin actually wires the
// theme into the native build (iOS Info.plist + Android assets) when a `theme`
// prop is provided — and is a no-op when it isn't. This replaces a fragile
// Maestro screenshot/pixel check: the color *render* is clerk-android /
// clerk-ios's responsibility; @clerk/expo's job is to *deliver* the theme.
describe('withClerkTheme — delivery', () => {
  let themeDir;
  let themePath;

  beforeEach(() => {
    vi.restoreAllMocks();
    themeDir = mkdtempSync(join(tmpdir(), 'clerk-theme-test-'));
    themePath = join(themeDir, 'clerk-theme.json');
    writeFileSync(
      themePath,
      JSON.stringify({
        colors: { primary: '#6C47FF', background: '#FFFFFF' },
        darkColors: { primary: '#8B6FFF' },
        design: { borderRadius: 12 },
      }),
    );
  });

  afterEach(() => {
    rmSync(themeDir, { recursive: true, force: true });
  });

  test('queues the iOS Info.plist mod and the Android assets mod when a theme is provided', () => {
    const out = withClerkTheme({}, { theme: themePath });
    expect(typeof out.mods?.ios?.infoPlist).toBe('function');
    expect(typeof out.mods?.android?.dangerous).toBe('function');
  });

  test('embeds the parsed theme into Info.plist under "ClerkTheme"', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const out = withClerkTheme({}, { theme: themePath });
    const result = await out.mods.ios.infoPlist({ modResults: {} });
    expect(result.modResults.ClerkTheme.colors.primary).toBe('#6C47FF');
    expect(result.modResults.ClerkTheme.darkColors.primary).toBe('#8B6FFF');
    expect(result.modResults.ClerkTheme.design.borderRadius).toBe(12);
  });

  test('is a no-op when no theme prop is provided (regression: bare "@clerk/expo" plugin string)', () => {
    const out = withClerkTheme({}, {});
    expect(out.mods?.ios?.infoPlist).toBeUndefined();
    expect(out.mods?.android?.dangerous).toBeUndefined();
  });

  test('warns and is a no-op when the theme file does not exist', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const out = withClerkTheme({}, { theme: join(themeDir, 'missing.json') });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Clerk theme file not found'));
    expect(out.mods?.ios?.infoPlist).toBeUndefined();
  });
});
