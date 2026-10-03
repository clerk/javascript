import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { isAlive, isRunning, run, sleep, type ProcessRef } from './core/exec.ts';
import { LOCAL_POOL, VerifyFailure, type HostAdapter, type HostEntry, type Platform, type ScratchPath } from './core/types.ts';
import { localAndroidBackend } from './platform/android/local.ts';
import { resolveJavaHome, sdkRoot, sdkTool } from './platform/android/sdk.ts';
import { localIosBackend } from './platform/ios/local.ts';

const APP_ID = 'com.clerk.exponativebuildfixture';
const ANDROID_ACTIVITY = '.MainActivity';
const DEV_CLIENT_SCHEME = 'exp+clerk-expo-native-build-fixture';
const IOS_PRODUCT = 'ClerkExpoNativeBuildFixture';
const ANDROID_DEV_MENU_PREFS = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?><map><boolean name="isOnboardingFinished" value="true" /><boolean name="showsAtLaunch" value="false" /><boolean name="showFab" value="false" /></map>`;

const WORKTREE = new URL('../../../../../../', import.meta.url).pathname;
const FIXTURE = join(WORKTREE, 'integration', 'templates', 'expo-native');
const EXPO_PACKAGE = join(WORKTREE, 'packages', 'expo');
const RUNTIME_DIR = new URL('../.verify/runtime/', import.meta.url).pathname;

type ExpoHostScreen = 'home' | 'auth' | 'nativeAuth' | 'userButton' | 'userProfile' | 'customSignIn' | 'customSignUp' | 'sso' | 'tokenCache';

const SHARED_NATIVE_INPUTS = [
  'packages/expo/app.plugin.js',
  'packages/expo/src/specs',
  'packages/expo/expo-module.config.json',
  'packages/expo/react-native.config.js',
  'packages/expo/package.json',
  'packages/expo-google-signin/app.plugin.js',
  'packages/expo-google-signin/expo-module.config.json',
  'packages/expo-biometrics/expo-module.config.json',
  'integration/templates/expo-native/app.json',
  'integration/templates/expo-native/app.config.js',
  'integration/templates/expo-native/package.sdk-57.json',
  'integration/templates/expo-native/modules',
] as const;

const PLATFORM_NATIVE_INPUTS: Readonly<Record<Platform, readonly string[]>> = {
  ios: ['packages/expo/ios', 'packages/expo-google-signin/ios', 'packages/expo-biometrics/ios'],
  android: ['packages/expo/android', 'packages/expo-google-signin/android', 'packages/expo-biometrics/android'],
};

export function nativeInputs(platform: Platform): readonly string[] {
  return [...PLATFORM_NATIVE_INPUTS[platform], ...SHARED_NATIVE_INPUTS];
}

export function needsNativeRebuild(platform: Platform, path: string): boolean {
  return nativeInputs(platform).some((input) => path === input || path.startsWith(`${input}/`));
}

export function metroPort(lease: { readonly platform: Platform; readonly slot: number }): number {
  return 8081 + (lease.platform === 'ios' ? 0 : 4) + lease.slot;
}

export function devClientEntry(platform: Platform, port: number): HostEntry {
  const url = `http://localhost:${port}`;
  return platform === 'ios'
    ? {
        kind: 'dev-client',
        launchArguments: ['--initialUrl', url, '-EXDevMenuShowsAtLaunch', 'NO', '-EXDevMenuIsOnboardingFinished', 'YES', '-EXDevMenuShowFloatingActionButton', 'NO'],
        openLink: null,
        androidActivity: null,
      }
    : {
        kind: 'dev-client',
        launchArguments: [],
        openLink: `${DEV_CLIENT_SCHEME}://expo-development-client/?url=${encodeURIComponent(url)}`,
        androidActivity: ANDROID_ACTIVITY,
      };
}

function step(command: string, args: readonly string[], cwd: string, env: Readonly<Record<string, string>> = {}): Promise<{ code: number; tail: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, [...args], { cwd, env: { ...process.env, LANG: 'en_US.UTF-8', CI: '1', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    const lines: string[] = [];
    const collect = (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n')) {
        if (line.trim().length === 0) continue;
        lines.push(line);
        if (lines.length > 40) lines.shift();
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', () => resolve({ code: 127, tail: `${command} could not start` }));
    child.on('close', (code) => resolve({ code: code ?? 1, tail: lines.slice(-15).join('\n') }));
  });
}

async function mustStep(what: string, command: string, args: readonly string[], cwd: string, env?: Readonly<Record<string, string>>): Promise<void> {
  const result = await step(command, args, cwd, env);
  if (result.code !== 0) throw new VerifyFailure('BUILD_FAILED', `${what} exited ${result.code}:\n${result.tail}`, 'fix the error above, then rerun bin/verify up');
}

async function withFixtureLock<T>(fn: () => Promise<T>): Promise<T> {
  mkdirSync(RUNTIME_DIR, { recursive: true });
  const lock = join(RUNTIME_DIR, 'fixture.lock');
  for (;;) {
    try {
      writeFileSync(lock, String(process.pid), { flag: 'wx' });
      break;
    } catch {
      const holder = Number(readFileSync(lock, 'utf8'));
      if (!Number.isInteger(holder) || holder <= 0 || !isAlive(holder)) rmSync(lock, { force: true });
      else await sleep(1000);
    }
  }
  try {
    return await fn();
  } finally {
    rmSync(lock, { force: true });
  }
}

interface RuntimeProcess extends ProcessRef {
  readonly what: 'metro' | 'watch';
}

const pidFile = (name: string) => join(RUNTIME_DIR, `${name}.json`);

function readRuntime(name: string): RuntimeProcess | null {
  if (!existsSync(pidFile(name))) return null;
  const ref = JSON.parse(readFileSync(pidFile(name), 'utf8')) as RuntimeProcess;
  return isRunning(ref) ? ref : null;
}

function stopRuntime(): void {
  const lanes = (['ios', 'android'] as const).flatMap((platform) => Array.from({ length: LOCAL_POOL[platform] }, (_, i) => metroPort({ platform, slot: i + 1 })));
  for (const name of ['watch', ...lanes.map((port) => `metro-${port}`)]) {
    const ref = readRuntime(name);
    if (ref !== null) process.kill(ref.pid, 'SIGTERM');
    rmSync(pidFile(name), { force: true });
  }
}

function startDetached(name: string, what: RuntimeProcess['what'], args: readonly string[], cwd: string): RuntimeProcess {
  mkdirSync(RUNTIME_DIR, { recursive: true });
  const log = openSync(join(RUNTIME_DIR, `${name}.log`), 'w');
  const { CI: _ci, ...env } = process.env;
  const child = spawn(process.execPath, [...args], { cwd, detached: true, stdio: ['ignore', log, log], env: { ...env, LANG: 'en_US.UTF-8', EXPO_NO_TELEMETRY: '1' } });
  child.unref();
  const ref: RuntimeProcess = { what, pid: child.pid ?? 0, startedAt: Date.now() };
  writeFileSync(pidFile(name), JSON.stringify(ref));
  return ref;
}

async function waitFor(what: string, ready: () => Promise<boolean>, timeoutMs: number, logName: string): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ready()) return;
    await sleep(500);
  }
  throw new VerifyFailure('NOT_READY', `${what} was not ready within ${timeoutMs / 1000}s`, `read ${join(RUNTIME_DIR, `${logName}.log`)}`);
}

async function ensureWatch(progress: (line: string) => void): Promise<RuntimeProcess> {
  const running = readRuntime('watch');
  if (running !== null) return running;
  const tsdown = createRequire(join(EXPO_PACKAGE, 'package.json')).resolve('tsdown/package.json');
  const started = startDetached('watch', 'watch', [join(tsdown, '..', 'dist', 'run.mjs'), '--watch'], EXPO_PACKAGE);
  progress(`watch   packages/expo  tsdown --watch (pid ${started.pid})`);
  const log = join(RUNTIME_DIR, 'watch.log');
  await waitFor('the @clerk/expo watch build', async () => existsSync(log) && /Build complete|built in|Rebuilt/i.test(readFileSync(log, 'utf8')), 180_000, 'watch');
  return started;
}

async function metroAnswers(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/status`, { signal: AbortSignal.timeout(2000) });
    return (await response.text()).includes('packager-status:running');
  } catch {
    return false;
  }
}

async function ensureMetro(port: number, progress: (line: string) => void): Promise<RuntimeProcess> {
  const name = `metro-${port}`;
  const running = readRuntime(name);
  if (running !== null && (await metroAnswers(port))) return running;
  if (running === null && (await metroAnswers(port))) {
    throw new VerifyFailure('NOT_READY', `port ${port} already serves a Metro that this worktree did not start`, `stop the process listening on ${port} (lsof -nP -iTCP:${port} -sTCP:LISTEN)`);
  }
  const cli = join(FIXTURE, 'node_modules', 'expo', 'bin', 'cli');
  if (!existsSync(cli)) throw new VerifyFailure('NOT_READY', 'the expo-native fixture has no node_modules', 'bin/verify up');
  const started = startDetached(name, 'metro', [cli, 'start', '--port', String(port), '--dev-client'], FIXTURE);
  progress(`metro   :${port}  expo start (pid ${started.pid})`);
  await waitFor(`Metro on port ${port}`, () => metroAnswers(port), 120_000, name);
  return started;
}

async function prepareFixture(progress: (line: string) => void): Promise<void> {
  if (!existsSync(join(WORKTREE, 'node_modules'))) {
    throw new VerifyFailure('NOT_READY', 'the monorepo has no node_modules', `cd ${WORKTREE} && pnpm install`);
  }
  if (readRuntime('watch') === null) {
    stopRuntime();
    await mustStep('turbo build', 'pnpm', ['turbo', 'build', '--filter=@clerk/expo...', '--filter=@clerk/expo-biometrics...', '--filter=@clerk/expo-google-signin...'], WORKTREE);
  } else {
    progress('build   the running watch build keeps packages/expo/dist current, so turbo build is skipped');
  }
  cpSync(join(FIXTURE, 'package.sdk-57.json'), join(FIXTURE, 'package.json'));
  await mustStep(
    'pnpm add the workspace packages',
    'pnpm',
    ['add', 'link:../../../packages/expo', 'link:../../../packages/expo-google-signin', 'link:../../../packages/expo-biometrics'],
    FIXTURE,
  );
  await mustStep(
    'expo install',
    'pnpm',
    ['expo', 'install', 'expo-auth-session', 'expo-constants', 'expo-crypto', 'expo-dev-client', 'expo-secure-store', 'expo-web-browser'],
    FIXTURE,
  );
}

async function buildIos(into: string): Promise<string> {
  const derived = join(FIXTURE, 'ios', 'build');
  await mustStep(
    'xcodebuild',
    'xcodebuild',
    ['build', '-quiet', '-workspace', `ios/${IOS_PRODUCT}.xcworkspace`, '-scheme', IOS_PRODUCT, '-configuration', 'Debug', '-sdk', 'iphonesimulator', '-derivedDataPath', derived, 'CODE_SIGN_IDENTITY=-'],
    FIXTURE,
  );
  const path = join(into, `${IOS_PRODUCT}.app`);
  rmSync(path, { recursive: true, force: true });
  cpSync(join(derived, 'Build', 'Products', 'Debug-iphonesimulator', `${IOS_PRODUCT}.app`), path, { recursive: true, verbatimSymlinks: true });
  return path;
}

async function buildAndroid(into: string): Promise<string> {
  const java = resolveJavaHome();
  if (!java.ok) throw new VerifyFailure('NOT_READY', java.detail, java.fix);
  await mustStep('gradlew assembleDebug', './gradlew', ['assembleDebug', '-q'], join(FIXTURE, 'android'), { JAVA_HOME: java.home, ANDROID_HOME: sdkRoot() });
  const path = join(into, 'app-debug.apk');
  mkdirSync(into, { recursive: true });
  cpSync(join(FIXTURE, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'), path);
  return path;
}

export const host: HostAdapter<ExpoHostScreen> = {
  repo: 'clerk-expo',
  platforms: ['ios', 'android'],
  screens: ['home', 'auth', 'nativeAuth', 'userButton', 'userProfile', 'customSignIn', 'customSignUp', 'sso', 'tokenCache'],
  keysFile: 'integration/.keys.json',
  githubRepo: 'clerk/javascript',
  appId: () => APP_ID,
  buildInputs: nativeInputs,
  buildSources: (_platform, os) => (os === 'darwin' ? ['local'] : ['eas-build']),
  async build(platform, source, key, into, progress) {
    if (source !== 'local') throw new VerifyFailure('UNSUPPORTED', `the Expo host builds only locally for now (asked for ${source})`, 'run bin/verify up on a Mac with Xcode and Android Studio');
    const path = await withFixtureLock(async () => {
      await prepareFixture(progress);
      progress(`build   expo prebuild --clean --platform ${platform}`);
      await mustStep('expo prebuild', 'pnpm', ['expo', 'prebuild', '--clean', '--platform', platform], FIXTURE);
      progress(`build   ${platform === 'ios' ? 'xcodebuild Debug' : 'gradlew assembleDebug'} (dev client)`);
      return platform === 'ios' ? buildIos(into) : buildAndroid(into);
    });
    return { platform, key, appId: APP_ID, path: path as ScratchPath, source, sourceSha: null };
  },
  async runtime(lease) {
    if (lease.backend !== 'local') throw new VerifyFailure('UNSUPPORTED', 'the Expo host serves JS from local Metro only', 'run locally; EAS arrives with CLOUD-EXPO');
    const progress = (line: string) => process.stderr.write(`${line}\n`);
    const port = metroPort(lease);
    const watch = await ensureWatch(progress);
    const metro = await ensureMetro(port, progress);
    if (lease.platform === 'android') {
      const adb = sdkTool('adb');
      const reverse = await run(adb, ['-s', lease.deviceId, 'reverse', `tcp:${port}`, `tcp:${port}`]);
      if (reverse.code !== 0) throw new VerifyFailure('NOT_READY', `adb reverse tcp:${port} failed: ${reverse.stderr.trim()}`, 'bin/verify down --platform android, then bin/verify up --platform android');
      await run(adb, ['-s', lease.deviceId, 'shell', 'am', 'force-stop', APP_ID]);
      const prefs = await run(adb, ['-s', lease.deviceId, 'shell', `run-as ${APP_ID} sh -c 'mkdir -p shared_prefs && cat > shared_prefs/expo.modules.devmenu.sharedpreferences.xml'`], { input: ANDROID_DEV_MENU_PREFS });
      if (prefs.code !== 0) throw new VerifyFailure('NOT_READY', `could not turn off the dev menu onboarding: ${prefs.stderr.trim()}`, 'bin/verify down --platform android, then bin/verify up --platform android');
    }
    return { entry: devClientEntry(lease.platform, port), processes: [watch, metro] };
  },
  entry: (platform) => devClientEntry(platform, 8081),
  features: ['native-auth-view', 'user-button-and-profile', 'custom-flow-sign-in', 'custom-flow-sign-up', 'token-cache-persistence', 'native-js-sync'],
  backends: [localIosBackend(), localAndroidBackend()],
};
