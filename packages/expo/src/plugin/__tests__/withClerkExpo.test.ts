/**
 * Tests for the combined withClerkExpo plugin and its smaller sub-plugins:
 * withClerkAppleSignIn, withClerkGoogleSignIn, withClerkKeychainService.
 *
 * Like withClerkAndroid.test.ts, we invoke the queued mod functions directly
 * with a fake mod context (the standard expo plugin testing pattern), since
 * vitest cannot intercept transitive CommonJS requires from app.plugin.js.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const plugin = require('../../../app.plugin.js') as {
  withClerkExpo: (config: any, props?: any) => any;
  withClerkAppleSignIn: (config: any) => any;
  withClerkGoogleSignIn: (config: any) => any;
  withClerkKeychainService: (config: any, props?: any) => any;
};

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('withClerkAppleSignIn', () => {
  test('queues an iOS entitlements mod that adds com.apple.developer.applesignin', async () => {
    const out = plugin.withClerkAppleSignIn({});
    const mod = out.mods.ios.entitlements;
    expect(typeof mod).toBe('function');

    const result = await mod({ modResults: {} });
    expect(result.modResults['com.apple.developer.applesignin']).toEqual(['Default']);
  });

  test('does not overwrite an existing entitlement', async () => {
    const out = plugin.withClerkAppleSignIn({});
    const mod = out.mods.ios.entitlements;
    const existing = ['Custom'];
    const result = await mod({ modResults: { 'com.apple.developer.applesignin': existing } });
    expect(result.modResults['com.apple.developer.applesignin']).toBe(existing);
  });
});

describe('withClerkGoogleSignIn', () => {
  test('returns the config unchanged when no scheme is provided', () => {
    delete process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME;
    const out = plugin.withClerkGoogleSignIn({});
    expect(out.mods?.ios?.infoPlist).toBeUndefined();
  });

  test('reads the scheme from process.env and queues an Info.plist mod', async () => {
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME = 'com.googleusercontent.apps.test';
    const out = plugin.withClerkGoogleSignIn({});
    const mod = out.mods.ios.infoPlist;
    expect(typeof mod).toBe('function');

    const result = await mod({ modResults: {} });
    expect(result.modResults.CFBundleURLTypes).toEqual([{ CFBundleURLSchemes: ['com.googleusercontent.apps.test'] }]);
  });

  test('falls back to config.extra.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME', async () => {
    delete process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME;
    const out = plugin.withClerkGoogleSignIn({
      extra: { EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME: 'com.googleusercontent.apps.fromExtra' },
    });
    const mod = out.mods.ios.infoPlist;
    const result = await mod({ modResults: {} });
    expect(result.modResults.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: ['com.googleusercontent.apps.fromExtra'] },
    ]);
  });

  test('does not duplicate an existing scheme', async () => {
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME = 'com.googleusercontent.apps.test';
    const out = plugin.withClerkGoogleSignIn({});
    const mod = out.mods.ios.infoPlist;
    const result = await mod({
      modResults: {
        CFBundleURLTypes: [{ CFBundleURLSchemes: ['com.googleusercontent.apps.test'] }],
      },
    });
    expect(result.modResults.CFBundleURLTypes.length).toBe(1);
  });
});

describe('withClerkKeychainService', () => {
  test('returns the config unchanged when no keychainService is provided', () => {
    const out = plugin.withClerkKeychainService({}, {});
    expect(out.mods?.ios?.infoPlist).toBeUndefined();
  });

  test('queues an Info.plist mod that writes ClerkKeychainService', async () => {
    const out = plugin.withClerkKeychainService({}, { keychainService: 'group.x.y' });
    const mod = out.mods.ios.infoPlist;
    expect(typeof mod).toBe('function');
    const result = await mod({ modResults: {} });
    expect(result.modResults.ClerkKeychainService).toBe('group.x.y');
  });
});

describe('withClerkExpo (combined)', () => {
  test('default: applies iOS, Apple, Google, Android, and Keychain in order', () => {
    process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_URL_SCHEME = 'com.googleusercontent.apps.test';
    const out = plugin.withClerkExpo({}, { keychainService: 'group.x.y' });
    expect(out.mods?.ios).toBeDefined();
    expect(out.mods?.android).toBeDefined();
    // The combined output should include both ios and android mods
    expect(out.mods.android.appBuildGradle).toBeDefined();
  });

  test('appleSignIn=false skips the Apple entitlement step', () => {
    const out = plugin.withClerkExpo({}, { appleSignIn: false });
    // Apple entitlement is the only mod that touches ios.entitlements; with
    // appleSignIn=false the entitlements mod should NOT be queued.
    expect(out.mods?.ios?.entitlements).toBeUndefined();
  });

  test('appleSignIn defaults to true', () => {
    const out = plugin.withClerkExpo({});
    expect(out.mods?.ios?.entitlements).toBeDefined();
  });
});
