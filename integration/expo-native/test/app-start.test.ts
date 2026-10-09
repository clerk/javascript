import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { newTestEmail } from '../specs/support/clerk.ts';
import { appLauncher, appStart, performAppStart, type LaunchedApp } from '../specs/support/launch.ts';
import { Secret } from '../specs/support/secret.ts';
import type { AppEntry, SeededUser } from '../src/core/types.ts';
import { SAMPLE_PUBLISHABLE_KEY, SAMPLE_RUN } from '../testing/sample-inputs.ts';

const devClient: AppEntry = {
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
    const entry: AppEntry = { ...devClient, launchArguments: ['-EXDevMenuIsOnboardingFinished', 'YES'], openLink: null };
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
    assert.throws(() => appStart('ios', 'com.clerk.expo', devClient, []), /cannot use openLink yet/);
  });

  it('refuses an Android dev client with no activity', () => {
    assert.throws(() => appStart('android', 'com.clerk.expo', { ...devClient, androidActivity: null }, []), /needs androidActivity/);
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

  it('reports the errors of both tries when the second open fails too, the first being the one the device gave', async () => {
    const errors = ['open com.clerk.E2EHost failed: xcrun timed out after 15000ms', 'device.openApp exceeded its timeout of 30000ms'];
    let opens = 0;
    const driver = { openApp: async () => Promise.reject(new Error(errors[(opens += 1) - 1])), adb: async () => {} };
    await assert.rejects(performAppStart(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, []), 'com.clerk.E2EHost', driver), (error: Error) => {
      assert.equal(error.message, `the app did not open in two tries. The first failed with: ${errors[0]}. The second failed with: ${errors[1]}`);
      assert.equal((error.cause as Error).message, errors[1]);
      return true;
    });
    assert.equal(opens, 2);
  });

  it('keeps a sign-in ticket that a failed open echoes out of the error it reports', async () => {
    const ticket = new Secret('ticket', 'ticket_that_an_error_echoes');
    const echo = ticket.use('launch-argument', (plain) => `simctl launch -verifySignInTicket ${plain} failed`);
    const driver = { openApp: async () => Promise.reject(new Error(echo)), adb: async () => {} };
    await assert.rejects(performAppStart(appStart('ios', 'com.clerk.E2EHost', { kind: 'binary' }, []), 'com.clerk.E2EHost', driver), (error: Error) => {
      assert.equal(error.message, 'the app did not open in two tries. The first failed with: simctl launch -verifySignInTicket <redacted> failed. The second failed with: simctl launch -verifySignInTicket <redacted> failed');
      return true;
    });
  });
});

describe('a launch the host fixture starts', () => {
  const E2E_HOST: LaunchedApp = { platform: 'ios', id: 'com.clerk.E2EHost', entry: { kind: 'binary' }, buildPath: null, publishableKey: SAMPLE_PUBLISHABLE_KEY, run: SAMPLE_RUN };
  const user: SeededUser = { id: 'user_1', email: newTestEmail(SAMPLE_RUN), phone: null, password: null };

  function device(app: LaunchedApp = E2E_HOST, installedBuilds = new Set<string>()) {
    const calls: string[] = [];
    let ids = 0;
    const launch = appLauncher(
      app,
      {
        installApp: async (path) => void calls.push(`install ${path}`),
        signInTicket: async (who) => (calls.push(`ticket for ${who.id}`), new Secret('ticket', `ticket_of_${who.id}`)),
        openApp: async (appId, options) => void calls.push(options === undefined ? `open ${appId}` : `open ${appId} ${options.launchArguments.join(' ')}`),
        adb: async (args) => void calls.push(`adb ${args.join(' ')}`),
      },
      installedBuilds,
      () => `id${(ids += 1)}`,
    );
    return { calls, launch };
  }

  const always = `-verifyPublishableKey ${SAMPLE_PUBLISHABLE_KEY} -verifyRunId ${SAMPLE_RUN}`;

  it('relaunches the app with the instance, the run, a new storage scope, and a launch id that it returns', async () => {
    const { calls, launch } = device();
    assert.equal(await launch({}), 'id2');
    assert.equal(await launch({}), 'id4');
    assert.deepEqual(calls, [`open com.clerk.E2EHost ${always} -verifyStorageScope id1 -verifyLaunchId id2`, `open com.clerk.E2EHost ${always} -verifyStorageScope id3 -verifyLaunchId id4`]);
  });

  it('hands the app the mode, the identifier, and the log level a launch names', async () => {
    const { calls, launch } = device();
    await launch({ authMode: 'signUp', initialIdentifier: 'someone+clerk_test@example.com', debugLogs: true });
    assert.deepEqual(calls, [`open com.clerk.E2EHost ${always} -verifyStorageScope id1 -verifyLaunchId id2 -verifyAuthMode signUp -verifyInitialIdentifier someone+clerk_test@example.com -verifyLogLevel debug`]);
  });

  it('keeps the storage of the launch before it only when the launch asks to', async () => {
    const { calls, launch } = device();
    await launch({});
    await launch({ keepStorage: true });
    await launch({});
    assert.deepEqual(calls.map((call) => /-verifyStorageScope (\S+)/.exec(call)?.[1]), ['id1', 'id1', 'id4']);
    const first = device();
    await first.launch({ keepStorage: true });
    assert.match(first.calls[0]!, /-verifyStorageScope id1 /, 'a first launch has no storage to keep');
  });

  it('mints a sign-in ticket for the user a launch starts signed in as, and hands it to the app', async () => {
    const { calls, launch } = device();
    await launch({ signedInAs: user });
    assert.deepEqual(calls, ['ticket for user_1', `open com.clerk.E2EHost ${always} -verifyStorageScope id1 -verifyLaunchId id2 -verifySignInTicket ticket_of_user_1`]);
  });

  it('installs the build the settings name before the first launch of a worker, and not again', async () => {
    const installedBuilds = new Set<string>();
    const named = { ...E2E_HOST, buildPath: '/builds/E2EHost.app' };
    const firstTest = device(named, installedBuilds);
    await firstTest.launch({});
    await firstTest.launch({});
    assert.deepEqual(firstTest.calls.map((call) => call.split(' ')[0]), ['install', 'open', 'open']);
    assert.equal(firstTest.calls[0], 'install /builds/E2EHost.app');
    const nextTest = device(named, installedBuilds);
    await nextTest.launch({});
    assert.deepEqual(nextTest.calls.map((call) => call.split(' ')[0]), ['open']);
    const afterAFailure = new Set<string>();
    const failing = appLauncher(named, { installApp: async () => Promise.reject(new Error('install failed')), signInTicket: async () => assert.fail('no ticket'), openApp: async () => assert.fail('opened'), adb: async () => {} }, afterAFailure, () => 'id');
    await assert.rejects(failing({}), /install failed/);
    const retry = device(named, afterAFailure);
    await retry.launch({});
    assert.deepEqual(retry.calls.map((call) => call.split(' ')[0]), ['install', 'open'], 'a build that failed to install is installed at the next launch');
  });

  it('starts a dev client through adb on Android with the same launch inputs', async () => {
    const { calls, launch } = device({ ...E2E_HOST, platform: 'android', id: 'com.clerk.expo', entry: devClient });
    await launch({ authMode: 'signIn' });
    assert.equal(calls.length, 3);
    assert.match(calls[1]!, /^adb shell 'am' 'start' .*'--es' 'verifyStorageScope' 'id1' '--es' 'verifyLaunchId' 'id2' '--es' 'verifyAuthMode' 'signIn'$/);
    assert.equal(calls[2], 'open com.clerk.expo');
  });
});
