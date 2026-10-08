import '../testing/git-env.ts';
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
    assert.deepEqual(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, ['-verifyAuthMode', 'signUp']), { kind: 'open-app', launchArguments: ['-verifyAuthMode', 'signUp'] });
  });

  it('prepends the dev-client arguments on iOS', () => {
    const entry: HostEntry = { ...devClient, launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES'], openLink: null };
    assert.deepEqual(appStart('ios', 'com.clerk.expo', entry, ['-verifyAuthMode', 'signUp']), {
      kind: 'open-app',
      launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES', '-verifyAuthMode', 'signUp'],
    });
  });

  it('force-stops and starts the activity with am on Android, where the launcher intent agent-device sends crashes expo-dev-launcher, quoting every token for the device shell', () => {
    const start = appStart('android', 'com.clerk.expo', devClient, ['--es', 'verifyInitialIdentifier', "it's me"]);
    assert.deepEqual(start, {
      kind: 'adb',
      commands: [
        ['shell', "am force-stop 'com.clerk.expo'"],
        [
          'shell',
          "'am' 'start' '-W' '-n' 'com.clerk.expo/.MainActivity' '-d' 'exp+app://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8082' '--ez' 'EXDevMenuIsOnboardingFinished' 'true' '--es' 'verifyInitialIdentifier' 'it'\\''s me'",
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
    await performAppStart(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, ['-verifyAuthMode', 'signUp']), 'com.clerk.E2EHost', driver);
    assert.deepEqual(calls, ['openApp com.clerk.E2EHost relaunch -verifyAuthMode signUp']);
  });

  it('opens the app once more when the device did not open it the first time, and fails when the second try fails too', async () => {
    const failing = (failures: number): { readonly opens: () => number; readonly driver: Parameters<typeof performAppStart>[2] } => {
      let opens = 0;
      return {
        opens: () => opens,
        driver: {
          openApp: async () => {
            opens += 1;
            if (opens <= failures) throw new Error('open com.clerk.E2EHost failed: xcrun timed out after 15000ms');
          },
          adb: async () => {},
        },
      };
    };
    const once = failing(1);
    await performAppStart(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, []), 'com.clerk.E2EHost', once.driver);
    assert.equal(once.opens(), 2);
    const twice = failing(2);
    await assert.rejects(performAppStart(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, []), 'com.clerk.E2EHost', twice.driver), /xcrun timed out/);
    assert.equal(twice.opens(), 2);
    const android = failing(1);
    await performAppStart(appStart('android', 'com.clerk.expo', devClient, []), 'com.clerk.expo', android.driver);
    assert.equal(android.opens(), 2);
  });
});
