import { afterEach, describe, expect, test, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- CJS plugin, no ESM export
const { withClerkExpoNative, withClerkFaceIDPermission } = require('../../app.plugin.js')._testing;

function applyInfoPlistMod(config, modResults) {
  return config.mods.ios.infoPlist({
    ...config,
    modRequest: {},
    modResults,
  });
}

describe('withClerkFaceIDPermission', () => {
  test('adds the configured Face ID usage description', async () => {
    const config = withClerkFaceIDPermission(
      { name: 'test', slug: 'test' },
      { faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID for secure sign-in.' },
    );

    const result = await applyInfoPlistMod(config, {});

    expect(result.modResults.NSFaceIDUsageDescription).toBe('Allow $(PRODUCT_NAME) to use Face ID for secure sign-in.');
  });

  test('preserves an app-provided Face ID usage description', async () => {
    const config = withClerkFaceIDPermission(
      { name: 'test', slug: 'test' },
      { faceIDPermission: 'Clerk-provided description' },
    );

    const result = await applyInfoPlistMod(config, {
      NSFaceIDUsageDescription: 'App-provided description',
    });

    expect(result.modResults.NSFaceIDUsageDescription).toBe('App-provided description');
  });

  test('does not configure the Info.plist without an explicit permission description', () => {
    const config = { name: 'test', slug: 'test' };

    expect(withClerkFaceIDPermission(config)).toBe(config);
    expect(config).not.toHaveProperty('mods');
  });

  test.each([null, '', '   ', true])('rejects an invalid permission description: %j', faceIDPermission => {
    expect(() => withClerkFaceIDPermission({ name: 'test', slug: 'test' }, { faceIDPermission })).toThrow(
      'faceIDPermission must be a non-empty string',
    );
  });
});

describe('withClerkExpoNative', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('applies the @clerk/expo-native plugin with its options when it is installed', () => {
    const nativePlugin = vi.fn(config => ({ ...config, applied: true }));
    const config = { name: 'test', slug: 'test' };

    const result = withClerkExpoNative(
      config,
      { keychainService: 'com.example.shared', theme: './theme.json', appleSignIn: false },
      () => nativePlugin,
    );

    expect(result.applied).toBe(true);
    expect(nativePlugin).toHaveBeenCalledWith(config, { keychainService: 'com.example.shared', theme: './theme.json' });
  });

  test('prefers options passed to an explicitly listed @clerk/expo-native plugin', () => {
    const nativePlugin = vi.fn(config => config);
    const config = {
      name: 'test',
      slug: 'test',
      plugins: ['@clerk/expo', ['@clerk/expo-native', { theme: './native-theme.json' }]],
    };

    withClerkExpoNative(config, { keychainService: 'com.example.shared', theme: './theme.json' }, () => nativePlugin);

    expect(nativePlugin).toHaveBeenCalledWith(config, {
      keychainService: 'com.example.shared',
      theme: './native-theme.json',
    });
  });

  test('does not apply the @clerk/expo-native plugin twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const nativePlugin = vi.fn(config => config);
    const config = {
      name: 'test',
      slug: 'test',
      _internal: { pluginHistory: { '@clerk/expo-native': { name: '@clerk/expo-native', version: '0.0.1' } } },
    };

    expect(withClerkExpoNative(config, {}, () => nativePlugin)).toBe(config);
    expect(nativePlugin).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();

    withClerkExpoNative(config, { theme: './theme.json' }, () => nativePlugin);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Pass them to the "@clerk/expo-native" plugin instead'));
  });

  test('leaves the config untouched when @clerk/expo-native is not installed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = { name: 'test', slug: 'test' };

    expect(withClerkExpoNative(config, {}, () => null)).toBe(config);
    expect(warn).not.toHaveBeenCalled();
  });

  test('warns with install instructions when native-only options are passed without @clerk/expo-native', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = { name: 'test', slug: 'test' };

    expect(withClerkExpoNative(config, { keychainService: 'com.example.shared' }, () => null)).toBe(config);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('npx expo install @clerk/expo-native'));
  });
});
