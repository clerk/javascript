import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appStart, performAppStart } from '../src/core/state.ts';
import type { HostEntry } from '../src/core/types.ts';

const devClient: HostEntry = {
  kind: 'dev-client',
  launchArguments: ['--ez', 'EXDevMenuIsOnboardingFinished', 'true'],
  openLink: 'exp+app://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8082',
  androidActivity: '.MainActivity',
};

describe('appStart', () => {
  it('opens a binary host with only the launch arguments', () => {
    assert.deepEqual(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, ['-verifyScreen', 'auth']), { kind: 'open-app', launchArguments: ['-verifyScreen', 'auth'] });
  });

  it('prepends the dev-client arguments on iOS', () => {
    const entry: HostEntry = { ...devClient, launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES'], openLink: null };
    assert.deepEqual(appStart('ios', 'com.clerk.expo', entry, ['-verifyScreen', 'auth']), {
      kind: 'open-app',
      launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES', '-verifyScreen', 'auth'],
    });
  });

  it('force-stops and starts the activity with am on Android, where the launcher intent agent-device sends crashes expo-dev-launcher, quoting every token for the device shell', () => {
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

  it('refuses an iOS dev client with an openLink, which it could not pass', () => {
    assert.throws(() => appStart('ios', 'com.clerk.expo', devClient, []), { code: 'NOT_READY' });
  });

  it('refuses an Android dev client with no activity', () => {
    assert.throws(() => appStart('android', 'com.clerk.expo', { ...devClient, androidActivity: null }, []), { code: 'NOT_READY' });
  });

  it('after the adb commands, opens the app with no options so the agent-device session binds without a relaunch', async () => {
    const calls: string[] = [];
    const driver = {
      openApp: async (appId: string, options?: { readonly relaunch: true; readonly launchArguments: readonly string[] }) =>
        void calls.push(options === undefined ? `openApp ${appId}` : `openApp ${appId} relaunch ${options.launchArguments.join(' ')}`),
      adb: async (args: readonly string[]) => void calls.push(`adb ${args.join(' ')}`),
    };
    await performAppStart(appStart('android', 'com.clerk.expo', devClient, []), 'com.clerk.expo', driver);
    assert.equal(calls.length, 3);
    assert.match(calls[0]!, /^adb shell am force-stop/);
    assert.match(calls[1]!, /^adb shell 'am' 'start'/);
    assert.equal(calls[2], 'openApp com.clerk.expo');
    calls.length = 0;
    await performAppStart(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, ['-verifyScreen', 'auth']), 'com.clerk.E2EHost', driver);
    assert.deepEqual(calls, ['openApp com.clerk.E2EHost relaunch -verifyScreen auth']);
  });
});
