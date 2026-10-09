import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';
import { PACKAGE_DIR } from '../specs/support/config.ts';
import { agentDevice } from '../specs/support/device.ts';
import { INPUT_VARIABLES, inputsEnv, readClerk, readRun, readTarget, type Inputs } from '../specs/support/inputs.ts';
import { Secret } from '../specs/support/secret.ts';
import { BOTH_PLATFORMS_APP, IOS_APP, SAMPLE_INPUTS, SAMPLE_PUBLISHABLE_KEY, SAMPLE_RUN } from '../testing/sample-inputs.ts';

const UDID = 'FDF0CD9E-CF9E-42B6-AE3A-116A665F7EF3';
const SECRET_KEY = 'sk_test_inputsUnitTestOnly';

describe('the device and app a run is told to use', () => {
  it('needs only a device id in a repository with one platform', () => {
    assert.deepEqual(readTarget(IOS_APP, { CLERK_E2E_DEVICE: UDID }), {
      platform: 'ios',
      device: { kind: 'local', id: UDID },
      session: 'clerk-e2e-ios',
      build: { path: null, devServer: null },
    });
  });

  it('asks which platform when the test app has two, and refuses one it does not have', () => {
    assert.throws(() => readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_DEVICE: UDID }), /CLERK_E2E_PLATFORM is not set, and this test app runs on ios and android/);
    assert.equal(readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_PLATFORM: 'android', CLERK_E2E_DEVICE: 'emulator-5554' }).platform, 'android');
    assert.throws(() => readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_PLATFORM: 'web', CLERK_E2E_DEVICE: UDID }), /CLERK_E2E_PLATFORM is web/);
    assert.throws(() => readTarget(IOS_APP, { CLERK_E2E_PLATFORM: 'android', CLERK_E2E_DEVICE: 'emulator-5554' }), /this test app runs on ios$/);
  });

  it('names the command that prints device ids when none is given, and does not take a device name', () => {
    assert.throws(() => readTarget(IOS_APP, {}), /CLERK_E2E_DEVICE is not set; .*`xcrun simctl list devices booted` prints/);
    assert.throws(() => readTarget(IOS_APP, { CLERK_E2E_DEVICE: '  ' }), /CLERK_E2E_DEVICE is not set/);
    assert.throws(() => readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_PLATFORM: 'android' }), /`adb devices` prints/);
    assert.throws(() => readTarget(IOS_APP, { CLERK_E2E_DEVICE: 'iPhone 17 Pro' }), /a name is not accepted/);
    assert.throws(() => readTarget(IOS_APP, { CLERK_E2E_DEVICE: 'booted' }), /a name is not accepted/);
    for (const notASerial of ['Pixel 9', 'Pixel_9', 'Clerk_Verify_Pixel', '127.0.0.1:5555', 'R58M12ABCDE']) {
      assert.throws(() => readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_PLATFORM: 'android', CLERK_E2E_DEVICE: notASerial }), /is not the emulator-<port> serial of an emulator; an AVD name, a host:port address, and the serial of a phone are not accepted, so copy the id that `adb devices` prints/, notASerial);
    }
    assert.throws(() => readTarget(IOS_APP, { CLERK_E2E_DEVICE: '00008030-001A2B3C4D5E6F78' }), /is not the UDID of a simulator/, 'the id of a phone');
  });

  it('takes an id only when the engine that drives the device reads it as that id, as the command that types on the device does', async () => {
    const pool = (await import(pathToFileURL(join(PACKAGE_DIR, 'node_modules', '@e2e-dev', 'mobile', 'dist', 'pool.js')).href)) as { deviceSelection(platform: string, binding: { device: string }): Record<string, string> };
    const typingSelects = (platform: 'ios' | 'android', id: string): Record<string, string> => {
      const [, , flag, value] = agentDevice({ kind: 'local', id }, platform).selector;
      return { platform, [flag!.replace(/^--/, '')]: value! };
    };
    const ids = { ios: [UDID, UDID.toLowerCase(), '00008030-001A2B3C4D5E6F78', 'iPhone 17 Pro'], android: ['emulator-5554', 'emulator-5560', 'Pixel_9', 'Clerk_Verify_Pixel', '127.0.0.1:5555', 'R58M12ABCDE'] } as const;
    for (const platform of ['ios', 'android'] as const) {
      for (const id of ids[platform]) {
        const sameDevice = JSON.stringify(pool.deviceSelection(platform, { device: id })) === JSON.stringify(typingSelects(platform, id));
        const accepted = ((): boolean => {
          try {
            return readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_PLATFORM: platform, CLERK_E2E_DEVICE: id }).device.id === id;
          } catch {
            return false;
          }
        })();
        assert.equal(accepted, sameDevice, `${id} on ${platform}: the engine selects ${JSON.stringify(pool.deviceSelection(platform, { device: id }))}`);
      }
    }
  });

  it('takes a build to install, a dev server, and a session name when they are given', () => {
    const target = readTarget(BOTH_PLATFORMS_APP, { CLERK_E2E_PLATFORM: 'ios', CLERK_E2E_DEVICE: UDID, CLERK_E2E_APP_PATH: '/tmp/E2EHost.app', CLERK_E2E_DEV_SERVER: 'http://localhost:8081', CLERK_E2E_DEVICE_SESSION: 'mine' });
    assert.deepEqual([target.build, target.session], [{ path: '/tmp/E2EHost.app', devServer: 'http://localhost:8081' }, 'mine']);
  });
});

describe('the Clerk instance a run is told to use', () => {
  const pk = { CLERK_PUBLISHABLE_KEY: SAMPLE_PUBLISHABLE_KEY };

  it('reaches Clerk with the secret key of a development instance', () => {
    const clerk = readClerk({ ...pk, CLERK_SECRET_KEY: SECRET_KEY });
    assert.equal(clerk.publishableKey, SAMPLE_PUBLISHABLE_KEY);
    assert.equal(clerk.access.kind === 'secret-key' && clerk.access.key.use('bapi-authorization', (plain) => plain), SECRET_KEY);
    assert.equal(JSON.stringify(clerk).includes(SECRET_KEY), false, 'the key does not print');
  });

  it('or with a stand-in on this machine and its token file', () => {
    assert.deepEqual(readClerk({ ...pk, CLERK_E2E_API_URL: 'http://127.0.0.1:4010/v1', CLERK_E2E_API_TOKEN_FILE: '/tmp/token' }).access, { kind: 'stand-in', url: 'http://127.0.0.1:4010/v1', tokenFile: '/tmp/token' });
  });

  it('refuses a production instance, since the tests create and sign in users', () => {
    assert.throws(() => readClerk({ CLERK_PUBLISHABLE_KEY: 'pk_live_abc', CLERK_SECRET_KEY: SECRET_KEY }), /CLERK_PUBLISHABLE_KEY is not a pk_test_ key/);
    assert.throws(() => readClerk({ ...pk, CLERK_SECRET_KEY: 'sk_live_abc' }), /CLERK_SECRET_KEY is not an sk_test_ key/);
  });

  it('refuses a missing key, and two ways to reach Clerk at once', () => {
    assert.throws(() => readClerk({ CLERK_SECRET_KEY: SECRET_KEY }), /CLERK_PUBLISHABLE_KEY is not set/);
    assert.throws(() => readClerk(pk), /CLERK_SECRET_KEY is not set/);
    assert.throws(() => readClerk({ ...pk, CLERK_SECRET_KEY: SECRET_KEY, CLERK_E2E_API_URL: 'http://127.0.0.1:4010/v1', CLERK_E2E_API_TOKEN_FILE: '/tmp/token' }), /are both set/);
  });

  it('sends its requests to no stand-in that is off this machine, and to none without a token', () => {
    for (const url of ['https://api.example.com/v1', 'http://localhost:4010/v1', 'https://127.0.0.1:4010/v1', 'http://127.0.0.1.example.com:4010/v1', 'http://127.0.0.1/v1', 'http://user@127.0.0.1:4010/v1', 'http://127.0.0.1:1@evil.example/v1', 'http://127.0.0.1:4010.evil.example/v1', 'http://127.0.0.1:4010evil.example/v1']) {
      assert.throws(() => readClerk({ ...pk, CLERK_E2E_API_URL: url, CLERK_E2E_API_TOKEN_FILE: '/tmp/token' }), /is not an http:\/\/127\.0\.0\.1:<port> address/, url);
    }
    assert.throws(() => readClerk({ ...pk, CLERK_E2E_API_URL: 'http://127.0.0.1:4010/v1' }), /CLERK_E2E_API_TOKEN_FILE is not/);
  });
});

describe('the id of a run', () => {
  it('is the one given, or a new one, and never something that is not a run id', () => {
    assert.equal(readRun({ CLERK_E2E_RUN_ID: SAMPLE_RUN }), SAMPLE_RUN);
    assert.match(readRun({}), /^r\d{8}-\d{6}-[0-9a-f]{4}$/);
    assert.throws(() => readRun({ CLERK_E2E_RUN_ID: '../../etc' }), /is not a run id/);
  });
});

describe('the settings the CLI hands to e2e', () => {
  const byHand: Inputs = {
    target: { platform: 'android', device: { kind: 'local', id: 'emulator-5554' }, session: 'verify-android-abc', build: { path: '/builds/e2e-debug.apk', devServer: 'http://localhost:8085' } },
    clerk: { publishableKey: SAMPLE_PUBLISHABLE_KEY, access: { kind: 'secret-key', key: new Secret('clerk-secret-key', SECRET_KEY) } },
    run: SAMPLE_RUN,
  };

  it('read back as the same device, app build, instance and run', () => {
    const env = inputsEnv(SAMPLE_INPUTS);
    assert.deepEqual(readTarget(IOS_APP, env), SAMPLE_INPUTS.target);
    assert.deepEqual(readClerk(env), SAMPLE_INPUTS.clerk);
    assert.equal(readRun(env), SAMPLE_INPUTS.run);

    const handEnv = inputsEnv(byHand);
    assert.deepEqual(readTarget(BOTH_PLATFORMS_APP, handEnv), byHand.target);
    const clerk = readClerk(handEnv);
    assert.equal(clerk.access.kind === 'secret-key' && clerk.access.key.use('bapi-authorization', (plain) => plain), SECRET_KEY);
  });

  it('carry no secret key when the CLI stands in for Clerk, and no app path the CLI did not name', () => {
    const env = inputsEnv(SAMPLE_INPUTS);
    assert.deepEqual(Object.keys(env).sort(), ['CLERK_E2E_API_TOKEN_FILE', 'CLERK_E2E_API_URL', 'CLERK_E2E_DEVICE', 'CLERK_E2E_DEVICE_SESSION', 'CLERK_E2E_PLATFORM', 'CLERK_E2E_RUN_ID', 'CLERK_PUBLISHABLE_KEY']);
  });

  it('are all named in the list the CLI clears from the environment it inherits', () => {
    for (const name of [...Object.keys(inputsEnv(SAMPLE_INPUTS)), ...Object.keys(inputsEnv(byHand))]) assert.ok(INPUT_VARIABLES.includes(name), name);
  });
});
