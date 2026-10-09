import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { nativeInputs } from '../src/fixture.ts';
import { host, metroPort, withCleanup } from '../src/host.ts';
import { devClientEntry } from '../specs/app.ts';
import { selectBackend } from '../src/core/devices.ts';
import { resolveSpecs } from '../src/core/e2e.ts';
import { STANDARD, declaredIn, planGroups, readSpecText } from '../src/core/instances/settings.ts';
import { encodeLaunchArguments } from '../specs/support/launch.ts';
import { VerifyFailure, type LaunchId, type PublishableKey, type RunId, type StorageScope } from '../src/core/types.ts';
import { localAndroidBackend } from '../src/platform/android/local.ts';
import { localIosBackend } from '../src/platform/ios/local.ts';

const WORKTREE = join(import.meta.dirname, '..', '..', '..');

describe('nativeInputs', () => {
  it('rebuilds the dev client for the native code of its own platform and for the fixture config, and not for the other platform', () => {
    for (const input of [
      'packages/expo/ios',
      'packages/expo/app.plugin.js',
      'packages/expo/src/specs',
      'integration/templates/expo-native/app.json',
      'integration/templates/expo-native/modules',
    ]) {
      assert.ok(nativeInputs('ios').includes(input), input);
    }
    assert.ok(nativeInputs('android').includes('packages/expo/android'));
    assert.deepEqual(
      nativeInputs('ios').filter(input => input.endsWith('/android')),
      [],
    );
    assert.deepEqual(
      nativeInputs('android').filter(input => input.endsWith('/ios')),
      [],
    );
    assert.deepEqual(
      [...nativeInputs('ios'), ...nativeInputs('android')].filter(
        input => input.startsWith('packages/expo/src/') && input !== 'packages/expo/src/specs',
      ),
      [],
    );
  });

  it('names only paths this repository has, so a moved directory cannot stop triggering a rebuild unseen', () => {
    for (const input of new Set([...nativeInputs('ios'), ...nativeInputs('android')]))
      assert.ok(existsSync(join(WORKTREE, input)), input);
  });
});

describe('the clerk-expo host', () => {
  it('says what a machine without the device would need', () => {
    const empty = mkdtempSync(join(tmpdir(), 'verify-expo-host-'));
    const elsewhere = {
      ...host,
      backends: [
        localIosBackend({ os: 'linux' }),
        localAndroidBackend({ machine: { os: 'linux', arch: 'x64', home: empty, env: {}, kvm: join(empty, 'kvm') } }),
      ],
    };
    assert.throws(
      () => selectBackend(elsewhere, 'ios', undefined, null),
      (error: VerifyFailure) =>
        error.code === 'UNSUPPORTED' &&
        /^no ios backend runs on this machine \(local: the iOS simulator needs macOS and this machine runs linux/.test(
          error.message,
        ) &&
        error.fix === 'run on a Mac with Xcode',
    );
    assert.throws(
      () => selectBackend(elsewhere, 'android', undefined, null),
      (error: VerifyFailure) =>
        error.code === 'UNSUPPORTED' &&
        /^no android backend runs on this machine \(local: there is no .*kvm/.test(error.message),
    );
  });

  it('names the home links the fixture shows, and no other', () => {
    const screens = join(WORKTREE, 'integration', 'templates', 'expo-native', 'screens');
    const homeLinkIds = (text: string): string[] =>
      [...text.matchAll(/'(e2e\.home\.[A-Za-z]+)'/g)].map(match => match[1] ?? '').sort();
    const shown = homeLinkIds(
      ['Home.tsx', 'destinations.ts'].map(file => readFileSync(join(screens, file), 'utf8')).join('\n'),
    );
    assert.ok(shown.length > 0);
    assert.deepEqual(homeLinkIds(readFileSync(join(import.meta.dirname, '..', 'specs', 'native.ts'), 'utf8')), shown);
  });
});

describe('the golden specs of this repository', () => {
  const dir = join(import.meta.dirname, '..');
  const golden = resolveSpecs(dir, { all: true }).map(spec => ({ spec, ...readSpecText(dir, spec.path) }));

  it('declare settings in one spec file, so a run of all of them is the standard group and then the biometric sign-in group', () => {
    const declaring = golden
      .filter(({ spec, ...text }) => declaredIn(text, spec.path) !== null)
      .map(({ spec }) => spec.path);
    assert.deepEqual(declaring, ['specs/golden/native-modules/biometric-availability.e2e.ts']);
    const plan = planGroups(golden, STANDARD.key);
    assert.equal(plan.length, 2);
    assert.equal(plan[0]!.settings, STANDARD);
    assert.equal(plan[0]!.specs.length, golden.length - 1);
    assert.deepEqual(
      plan[1]!.specs.map(spec => spec.path),
      declaring,
    );
  });
});

describe('metroPort', () => {
  it('gives every lane on the Mac its own port', () => {
    const ports = [
      ...[1, 2, 3, 4].map(slot => metroPort({ platform: 'ios', slot })),
      ...[1, 2].map(slot => metroPort({ platform: 'android', slot })),
    ];
    assert.deepEqual(ports, [8082, 8083, 8084, 8085, 8086, 8087]);
  });
});

describe('devClientEntry', () => {
  it('opens the iOS dev client on the lane Metro with the dev menu out of the way', () => {
    const entry = devClientEntry('ios', 'http://localhost:8083');
    assert.equal(entry.kind, 'dev-client');
    if (entry.kind !== 'dev-client') return;
    assert.deepEqual(entry.launchArguments.slice(0, 2), ['--initialUrl', 'http://localhost:8083']);
    assert.ok(entry.launchArguments.includes('-EXDevMenuIsOnboardingFinished'));
    assert.equal(entry.openLink, null);
  });

  it('opens the Android dev client through the exp+ link to the lane Metro', () => {
    const entry = devClientEntry('android', 'http://localhost:8086');
    assert.equal(entry.kind, 'dev-client');
    if (entry.kind !== 'dev-client') return;
    assert.equal(
      entry.openLink,
      'exp+clerk-expo-native-build-fixture://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8086',
    );
    assert.deepEqual(entry.launchArguments, []);
  });

  it('keeps the iOS dev-client arguments compatible with the verify launch arguments', () => {
    const verify = encodeLaunchArguments('ios', {
      verifyPublishableKey: 'pk_test_x' as PublishableKey,
      verifyRunId: 'r20261003-000000-abcd' as RunId,
      verifyStorageScope: 'aa' as StorageScope,
      verifyLaunchId: 'bb' as LaunchId,
    });
    const entry = devClientEntry('ios', 'http://localhost:8082');
    if (entry.kind !== 'dev-client') return assert.fail('not a dev client');
    const keys = new Set([...entry.launchArguments, ...verify].filter(arg => arg.startsWith('-')));
    assert.equal(
      keys.size,
      entry.launchArguments.filter(a => a.startsWith('-')).length + verify.filter(a => a.startsWith('-')).length,
    );
  });
});

describe('withCleanup', () => {
  it('stops exactly what the failed call started, then rethrows', async () => {
    const stopped: string[][] = [];
    await assert.rejects(
      withCleanup(
        names => stopped.push([...names]),
        async started => {
          started.names.push('watch', 'metro-8082');
          throw new Error('warm-up failed');
        },
        () => undefined,
      ),
      /warm-up failed/,
    );
    assert.deepEqual(stopped, [['watch', 'metro-8082']]);
  });

  it('stops nothing when the call succeeds or started nothing', async () => {
    const stopped: string[][] = [];
    assert.equal(
      await withCleanup(
        names => stopped.push([...names]),
        async started => {
          started.names.push('watch');
          return 7;
        },
        () => undefined,
      ),
      7,
    );
    await assert.rejects(
      withCleanup(
        names => stopped.push([...names]),
        async () => {
          throw new Error('refused');
        },
        () => undefined,
      ),
    );
    assert.deepEqual(stopped, []);
  });
});
