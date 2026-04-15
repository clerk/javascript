/**
 * Smoke tests for withClerkIOS in app.plugin.js.
 *
 * The iOS plugin is heavy: it touches Podfile.properties.json, the Xcode
 * pbxproj, AppDelegate.swift, and copies ClerkViewFactory.swift into the
 * project. The mod functions use synchronous `require('fs')` which vitest
 * cannot intercept (same limitation as @expo/config-plugins).
 *
 * Rather than mocking fs (which would require a heavy fs mock), these tests
 * verify the plugin's static structure: that it queues every expected mod
 * onto config.mods.ios without throwing. The full plugin behavior is
 * exercised end-to-end by the Maestro test app, which runs `expo prebuild`
 * on every CI cycle.
 */
import { describe, expect, test } from 'vitest';

const plugin = require('../../../app.plugin.js') as {
  withClerkIOS: (config: any) => any;
};

describe('withClerkIOS', () => {
  test('runs without throwing on an empty config', () => {
    expect(() => plugin.withClerkIOS({})).not.toThrow();
  });

  test('queues an iOS dangerous mod for Podfile.properties.json', () => {
    const out = plugin.withClerkIOS({});
    // The dangerous mod is queued at config.mods.ios.dangerous
    expect(out.mods?.ios?.dangerous).toBeDefined();
    expect(typeof out.mods.ios.dangerous).toBe('function');
  });

  test('queues an Xcode project mod', () => {
    const out = plugin.withClerkIOS({});
    expect(out.mods?.ios?.xcodeproj).toBeDefined();
    expect(typeof out.mods.ios.xcodeproj).toBe('function');
  });

  test('subsequent withClerkIOS calls compose: each adds mods without clobbering prior ones', () => {
    const first = plugin.withClerkIOS({});
    const second = plugin.withClerkIOS(first);

    expect(second.mods?.ios?.dangerous).toBeDefined();
    expect(second.mods?.ios?.xcodeproj).toBeDefined();
  });

  test('returns a config object (not undefined)', () => {
    const out = plugin.withClerkIOS({});
    expect(out).toBeDefined();
    expect(typeof out).toBe('object');
  });

  test('preserves existing mods on the input config', () => {
    const sentinel = () => null;
    const input = {
      mods: { ios: { someOtherMod: sentinel } },
    };
    const out = plugin.withClerkIOS(input as any);
    // The existing mod should still be present alongside the new ones
    expect(out.mods.ios.someOtherMod).toBe(sentinel);
  });
});
