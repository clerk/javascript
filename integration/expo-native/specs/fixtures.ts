import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { test as base } from '@e2e-dev/mobile';
import { expect, type Locator } from 'e2e';
import { app as testApp } from './app.ts';
import { busyWaits, onceTheRunnerIsFree, type BusyWait } from './support/busy-runner.ts';
import { testUsers } from './support/clerk.ts';
import { ASSERTION_TIMEOUT_MS, PACKAGE_DIR } from './support/config.ts';
import { agentDevice, deviceCommand } from './support/device.ts';
import { fillField } from './support/fill.ts';
import { readClerk, readRun, readTarget, type Target } from './support/inputs.ts';
import { appLauncher } from './support/launch.ts';
import { redact } from './support/secret.ts';
import { tapOnceUncovered } from './support/tapping.ts';
import {
  APP_ELEMENT_IDS,
  CLERK_TEST_CODE,
  signedInText,
  type AppLocators,
  type HostFixture,
  type LaunchOptions,
  type SeededUser,
  type TestEmail,
} from './support/types.ts';
import { errorScreenElseSavePasswordPrompt, onScreen, signedInAs, signedOut, until, type Sight, type WaitScreen } from './support/waiting.ts';

export { expect, CLERK_TEST_CODE };

const LAUNCH_TIMEOUT_MS = 60_000;
const POLL_MS = 400;
const TYPING_DELAY_MS = 40;
const CONFIRM_READS = 5;
const ONLY_E2E_WORKER_SLOT = 0;

const RUN = readRun(process.env);

const AGENT_DEVICE = join(PACKAGE_DIR, 'node_modules', '.bin', 'agent-device');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runnerBusy = (): BusyWait => busyWaits(6, () => sleep(5_000));

const randomId = (): string => randomBytes(8).toString('hex');

const BUILDS_THIS_WORKER_INSTALLED = new Set<string>();

async function adb(target: Target, args: readonly string[]): Promise<void> {
  const result = await deviceCommand(target.device, target.platform, args);
  if (result.code !== 0) throw new Error(`adb ${args[0]} failed: ${result.stderr.trim() || result.stdout.trim() || `exit ${result.code}`}`);
}

function typeOnDevice(target: Target, [command, ...operands]: readonly [string, ...string[]]): Promise<void> {
  const device = agentDevice(target.device, target.platform);
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ...device.env };
    execFile(AGENT_DEVICE, [command, '--delay-ms', String(TYPING_DELAY_MS), '--session', `${target.session}-${ONLY_E2E_WORKER_SLOT}`, ...device.selector, '--', ...operands], { env }, (error, _stdout, stderr) => {
      if (error === null) resolve();
      else reject(new Error(redact(`agent-device ${command} failed: ${stderr.trim() || error.message}`)));
    });
  });
}

export const test = base.extend<{ host: HostFixture }>({
  host: async ({ app: e2eApp, device, screen, platform }, use) => {
    const target = readTarget(testApp, process.env);
    if (target.platform !== platform) throw new Error(`e2e runs the ${platform} target and the inputs name ${target.platform}; pass --target ${target.platform}`);
    const clerk = readClerk(process.env);
    const users = testUsers(clerk, RUN);
    const appId = testApp.id(platform);
    const app = Object.fromEntries(Object.entries(APP_ELEMENT_IDS).map(([name, id]) => [name, screen.getByTestId(id)])) as AppLocators;
    const launchApp = appLauncher(
      { platform, id: appId, entry: testApp.entry(platform, target.build.devServer), buildPath: target.build.path, publishableKey: clerk.publishableKey, run: RUN },
      {
        installApp: (path) => device.installApp(path),
        signInTicket: users.signInTicket,
        openApp: (id, options) => (options === undefined ? device.openApp(id) : device.openApp(id, { relaunch: true, launchArguments: [...options.launchArguments] })),
        adb: (args) => adb(target, args),
      },
      BUILDS_THIS_WORKER_INSTALLED,
      randomId,
    );

    const waitScreen: WaitScreen = {
      home: app,
      errorScreenElsePrompt: device.locator(errorScreenElseSavePasswordPrompt(APP_ELEMENT_IDS.error)),
      dismissPrompt: () => screen.getByRole('button', { name: 'Not Now' }).tap({ timeout: ASSERTION_TIMEOUT_MS }),
    };
    const waitFor = (sight: Sight, what: string, timeoutMs: number): Promise<void> => until(sight, what, waitScreen, { timeoutMs, now: Date.now, wait: () => sleep(POLL_MS) });

    const describeSignedIn = (who: SeededUser | TestEmail): string =>
      typeof who === 'string' ? `"${signedInText(who)}" with a user ID and a session ID on the home` : `"${signedInText(who.email)}" with user ID ${who.id} and a session ID on the home`;

    function landing(options: LaunchOptions): { readonly sight: Sight; readonly what: string } {
      const on = (locator: Locator, what: string) => ({ sight: onScreen(locator, what), what });
      if (options.landsOn !== undefined) return on(options.landsOn, 'the screen the spec names in landsOn');
      const user = options.signedInAs ?? null;
      if (user !== null) return { sight: signedInAs(app, user), what: describeSignedIn(user) };
      if (options.keepStorage === true) {
        throw new Error('a launch with keepStorage and no signedInAs has no landing the fixture can know; pass landsOn with the locator the launch should show');
      }
      return on(app.signIn, 'the "Sign in" button on the home');
    }

    const tap = (control: Locator, busy: BusyWait): Promise<void> =>
      tapOnceUncovered(() => control.tap({ timeout: ASSERTION_TIMEOUT_MS }), { timeoutMs: ASSERTION_TIMEOUT_MS, now: Date.now, wait: () => sleep(POLL_MS) }, busy);

    const host: HostFixture = {
      runId: RUN,
      app,
      newEmail: async () => users.newEmail(),
      newPhone: users.newPhone,
      seedUser: users.seed,
      async launch(options = {}) {
        const lands = landing(options);
        const launchId = await launchApp(options);
        await waitFor(lands.sight, `${lands.what} after launch ${launchId}`, LAUNCH_TIMEOUT_MS);
      },
      expectSignedInAs: (who, timeoutMs = ASSERTION_TIMEOUT_MS) => waitFor(signedInAs(app, who), describeSignedIn(who), timeoutMs),
      expectSignedOut: (timeoutMs = ASSERTION_TIMEOUT_MS) => waitFor(signedOut(app), '"Signed out" and no user ID or session ID on the home', timeoutMs),
      async screenshot(label) {
        await onceTheRunnerIsFree(() => e2eApp.screenshot(label), runnerBusy());
      },
      tap: (control) => tap(control, runnerBusy()),
      fill: async (field, text) =>
        fillField(
          field,
          typeof text === 'string' ? text : text.use('device-input', (value) => value),
          { platform, focused: device.locator('role=textbox focused'), texts: device.locator('role=text'), type: (command) => typeOnDevice(target, command) },
          { tapTimeoutMs: ASSERTION_TIMEOUT_MS, reads: CONFIRM_READS, now: Date.now, wait: () => sleep(POLL_MS) },
          runnerBusy(),
        ),
    };
    await use(host);
  },
});
