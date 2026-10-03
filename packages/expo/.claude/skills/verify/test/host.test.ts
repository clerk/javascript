import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { devClientEntry, metroPort, nativeInputs, needsNativeRebuild } from '../src/host.ts';
import { encodeLaunchArguments } from '../src/core/state.ts';
import type { LaunchId, PublishableKey, RunId, StorageScope } from '../src/core/types.ts';

describe('needsNativeRebuild', () => {
  it('rebuilds the dev client for native SDK, plugin, codegen spec, and fixture config changes', () => {
    for (const path of [
      'packages/expo/ios/ClerkExpoModule.swift',
      'packages/expo/ios/ClerkExpo.podspec',
      'packages/expo/app.plugin.js',
      'packages/expo/src/specs/NativeClerkModule.ts',
      'packages/expo/package.json',
      'integration/templates/expo-native/app.json',
      'integration/templates/expo-native/pnpm-workspace.yaml',
      'packages/expo-google-signin/package.json',
      'packages/expo-biometrics/package.json',
      'integration/templates/expo-native/modules/verify-launch-config/ios/VerifyLaunchConfigModule.swift',
    ]) {
      assert.equal(needsNativeRebuild('ios', path), true, path);
    }
    assert.equal(needsNativeRebuild('android', 'packages/expo/android/build.gradle'), true);
    assert.equal(needsNativeRebuild('android', 'packages/expo/android/src/main/java/expo/modules/clerk/ClerkExpoModule.kt'), true);
  });

  it('serves JS-only changes through the watch build and Metro', () => {
    for (const path of [
      'packages/expo/src/hooks/useSSO.ts',
      'packages/expo/src/provider/ClerkProvider.tsx',
      'packages/expo/src/specsfoo.ts',
      'integration/templates/expo-native/App.tsx',
      'integration/templates/expo-native/screens/CustomSignIn.tsx',
      'packages/expo/.claude/skills/verify/src/host.ts',
    ]) {
      assert.equal(needsNativeRebuild('ios', path), false, path);
      assert.equal(needsNativeRebuild('android', path), false, path);
    }
  });

  it('keeps each platform build independent of the other platform native code', () => {
    assert.equal(needsNativeRebuild('android', 'packages/expo/ios/ClerkExpoModule.swift'), false);
    assert.equal(needsNativeRebuild('ios', 'packages/expo/android/build.gradle'), false);
    assert.equal(nativeInputs('ios').includes('packages/expo/android'), false);
  });
});

describe('metroPort', () => {
  it('gives every lane on the Mac its own port', () => {
    const ports = [
      ...[1, 2, 3, 4].map((slot) => metroPort({ platform: 'ios', slot })),
      ...[1, 2].map((slot) => metroPort({ platform: 'android', slot })),
    ];
    assert.deepEqual(ports, [8082, 8083, 8084, 8085, 8086, 8087]);
  });
});

describe('devClientEntry', () => {
  it('opens the iOS dev client on the lane Metro with the dev menu out of the way', () => {
    const entry = devClientEntry('ios', 8083);
    assert.equal(entry.kind, 'dev-client');
    if (entry.kind !== 'dev-client') return;
    assert.deepEqual(entry.launchArguments.slice(0, 2), ['--initialUrl', 'http://localhost:8083']);
    assert.ok(entry.launchArguments.includes('-EXDevMenuIsOnboardingFinished'));
    assert.equal(entry.openLink, null);
  });

  it('opens the Android dev client through the exp+ link to the lane Metro', () => {
    const entry = devClientEntry('android', 8086);
    assert.equal(entry.kind, 'dev-client');
    if (entry.kind !== 'dev-client') return;
    assert.equal(entry.openLink, 'exp+clerk-expo-native-build-fixture://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8086');
    assert.deepEqual(entry.launchArguments, []);
  });

  it('keeps the iOS dev-client arguments compatible with the verify launch arguments', () => {
    const verify = encodeLaunchArguments('ios', {
      verifyPublishableKey: 'pk_test_x' as PublishableKey,
      verifyRunId: 'r20261003-000000-abcd' as RunId,
      verifyStorageScope: 'aa' as StorageScope,
      verifyLaunchId: 'bb' as LaunchId,
    });
    const entry = devClientEntry('ios', 8082);
    if (entry.kind !== 'dev-client') return assert.fail('not a dev client');
    const keys = new Set([...entry.launchArguments, ...verify].filter((arg) => arg.startsWith('-')));
    assert.equal(keys.size, entry.launchArguments.filter((a) => a.startsWith('-')).length + verify.filter((a) => a.startsWith('-')).length);
  });
});
