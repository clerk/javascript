import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appStart } from '../src/core/state.ts';
import type { HostEntry } from '../src/core/types.ts';

const devClient: HostEntry = {
  kind: 'dev-client',
  launchArguments: ['--ez', 'EXDevMenuIsOnboardingFinished', 'true'],
  openLink: 'exp+app://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8082',
  androidActivity: '.MainActivity',
};

describe('appStart', () => {
  it('opens a binary host with only the launch arguments, as before', () => {
    assert.deepEqual(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, ['-verifyScreen', 'auth']), { kind: 'open-app', launchArguments: ['-verifyScreen', 'auth'] });
  });

  it('prepends the dev-client arguments on iOS', () => {
    const entry: HostEntry = { ...devClient, launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES'] };
    assert.deepEqual(appStart('ios', 'com.clerk.expo', entry, ['-verifyScreen', 'auth']), {
      kind: 'open-app',
      launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES', '-verifyScreen', 'auth'],
    });
  });

  it('force-stops and starts the activity with am on Android, quoting every token for the device shell', () => {
    const start = appStart('android', 'com.clerk.expo', devClient, ['--es', 'verifyScreen', "it's auth"]);
    assert.deepEqual(start, {
      kind: 'adb',
      commands: [
        ['shell', "am force-stop 'com.clerk.expo'"],
        [
          'shell',
          "'am' 'start' '-W' '-n' 'com.clerk.expo/.MainActivity' '-d' 'exp+app://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8082' '--ez' 'EXDevMenuIsOnboardingFinished' 'true' '--es' 'verifyScreen' 'it'\\''s auth'",
        ],
      ],
    });
  });

  it('refuses an Android dev client with no activity', () => {
    assert.throws(() => appStart('android', 'com.clerk.expo', { ...devClient, androidActivity: null }, []), { code: 'NOT_READY' });
  });
});
