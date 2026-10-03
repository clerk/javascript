import { spawn } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAlive, isRunning, run, sleep, type ProcessRef } from './core/exec.ts';
import { LOCAL_POOL, VerifyFailure, type HostAdapter, type HostEntry, type Platform, type ScratchPath } from './core/types.ts';
import {
  confirmServed,
  fingerprint,
  isBundledOutput,
  isTsdownSource,
  listFiles,
  newest,
  staleInScope,
  staleOutOfScope,
  workspaceDependencies,
  type BundleView,
  type Fetched,
  type Fingerprint,
  type GateMemory,
} from './freshness.ts';
import { localAndroidBackend } from './platform/android/local.ts';
import { resolveJavaHome, sdkRoot, sdkTool } from './platform/android/sdk.ts';
import { localIosBackend } from './platform/ios/local.ts';

const APP_ID = 'com.clerk.exponativebuildfixture';
const ANDROID_ACTIVITY = '.MainActivity';
const DEV_CLIENT_SCHEME = 'exp+clerk-expo-native-build-fixture';
const IOS_PRODUCT = 'ClerkExpoNativeBuildFixture';
const ANDROID_DEV_MENU_PREFS = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?><map><boolean name="isOnboardingFinished" value="true" /><boolean name="showsAtLaunch" value="false" /><boolean name="showFab" value="false" /></map>`;

const WORKTREE = fileURLToPath(new URL('../../../../', import.meta.url));
const FIXTURE = join(WORKTREE, 'integration', 'templates', 'expo-native');
const EXPO_PACKAGE = join(WORKTREE, 'packages', 'expo');
const RUNTIME_DIR = fileURLToPath(new URL('../.verify/runtime/', import.meta.url));

type ExpoHostScreen = 'home' | 'auth' | 'nativeAuth' | 'userButton' | 'userProfile' | 'customSignIn' | 'customSignUp' | 'sso' | 'tokenCache';

const SHARED_NATIVE_INPUTS = [
  'packages/expo/app.plugin.js',
  'packages/expo/src/specs',
  'packages/expo/expo-module.config.json',
  'packages/expo/react-native.config.js',
  'packages/expo/package.json',
  'packages/expo-google-signin/app.plugin.js',
  'packages/expo-google-signin/expo-module.config.json',
  'packages/expo-google-signin/package.json',
  'packages/expo-biometrics/expo-module.config.json',
  'packages/expo-biometrics/package.json',
  'integration/templates/expo-native/app.json',
  'integration/templates/expo-native/app.config.js',
  'integration/templates/expo-native/package.sdk-57.json',
  'integration/templates/expo-native/pnpm-workspace.yaml',
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
  if (result.code !== 0) throw new VerifyFailure('BUILD_FAILED', `${what} exited ${result.code}:\n${result.tail}`, 'fix the error above, then rerun {cli} up');
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
const runtimeLog = (name: string) => join(RUNTIME_DIR, `${name}.log`);

function readRuntime(name: string): RuntimeProcess | null {
  if (!existsSync(pidFile(name))) return null;
  const ref = JSON.parse(readFileSync(pidFile(name), 'utf8')) as RuntimeProcess;
  return isRunning(ref) ? ref : null;
}

const allRuntimeNames = (): readonly string[] => [
  'watch',
  ...(['ios', 'android'] as const).flatMap((platform) => Array.from({ length: LOCAL_POOL[platform] }, (_, i) => `metro-${metroPort({ platform, slot: i + 1 })}`)),
];

function stopRuntime(names: readonly string[] = allRuntimeNames()): void {
  for (const name of names) {
    const ref = readRuntime(name);
    if (ref !== null) process.kill(ref.pid, 'SIGTERM');
    rmSync(pidFile(name), { force: true });
  }
}

function startDetached(name: string, what: RuntimeProcess['what'], args: readonly string[], cwd: string): RuntimeProcess {
  mkdirSync(RUNTIME_DIR, { recursive: true });
  const log = openSync(runtimeLog(name), 'a');
  appendFileSync(log, `\n==== ${name} started ${new Date().toISOString()}\n`);
  const { CI: _ci, ...env } = process.env;
  const child = spawn(process.execPath, [...args], { cwd, detached: true, stdio: ['ignore', log, log], env: { ...env, LANG: 'en_US.UTF-8', EXPO_NO_TELEMETRY: '1', EXPO_OFFLINE: '1' } });
  child.unref();
  const ref: RuntimeProcess = { what, pid: child.pid ?? 0, startedAt: Date.now() };
  writeFileSync(pidFile(name), JSON.stringify(ref));
  return ref;
}

async function waitFor(what: string, ready: () => Promise<boolean>, timeoutMs: number, logName: string, fix?: string): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ready()) return;
    await sleep(500);
  }
  throw new VerifyFailure('NOT_READY', `${what} was not ready within ${timeoutMs / 1000}s`, fix ?? `read ${runtimeLog(logName)}`);
}

export interface Started {
  readonly names: string[];
}

export async function withCleanup<T>(stop: (names: readonly string[]) => void, fn: (started: Started) => Promise<T>, progress: (line: string) => void): Promise<T> {
  const started: Started = { names: [] };
  try {
    return await fn(started);
  } catch (error) {
    if (started.names.length > 0) {
      progress(`stop    ${started.names.join(', ')} (started by this call, which failed)`);
      stop(started.names);
    }
    throw error;
  }
}

async function ensureWatch(started: Started, progress: (line: string) => void): Promise<RuntimeProcess> {
  const running = readRuntime('watch');
  if (running !== null) return running;
  const tsdown = createRequire(join(EXPO_PACKAGE, 'package.json')).resolve('tsdown/package.json');
  const offset = existsSync(runtimeLog('watch')) ? readFileSync(runtimeLog('watch')).length : 0;
  const ref = startDetached('watch', 'watch', [join(tsdown, '..', 'dist', 'run.mjs'), '--watch'], EXPO_PACKAGE);
  started.names.push('watch');
  progress(`watch   packages/expo  tsdown --watch (pid ${ref.pid})`);
  await waitFor('the @clerk/expo watch build', async () => /Build complete|built in|Rebuilt/i.test(readFileSync(runtimeLog('watch')).subarray(offset).toString()), 180_000, 'watch');
  return ref;
}

const expoOutputs = () => listFiles(join(EXPO_PACKAGE, 'dist'), 'packages/expo/dist/', isBundledOutput);

async function waitForWatchToCatchUp(): Promise<void> {
  let previous = '';
  await waitFor(
    'the @clerk/expo watch build to pick up the latest edit',
    async () => {
      const outputs = expoOutputs();
      const signature = outputs.map((f) => `${f.rel}:${f.mtime}`).join('|');
      const settled = signature === previous;
      previous = signature;
      return settled && newest(outputs) >= newest(listFiles(join(EXPO_PACKAGE, 'src'), 'packages/expo/src/', isTsdownSource));
    },
    60_000,
    'watch',
  );
}

function refuseOutOfScope(): void {
  const stale = staleOutOfScope(WORKTREE, EXPO_PACKAGE);
  if (stale.length === 0) return;
  const names = stale.map((pkg) => pkg.name).join(', ');
  throw new VerifyFailure(
    'NOT_READY',
    `${names} ${stale.length === 1 ? 'has' : 'have'} source newer than ${stale.length === 1 ? 'its dist' : 'their dist'}. This skill rebuilds only @clerk/expo and its Expo-module siblings; it verifies other workspace dependencies after you build them, and it will not launch on their stale dist`,
    '{cli} down, then pnpm turbo build --filter=@clerk/expo^..., then rerun',
  );
}

async function rebuildStaleSiblings(progress: (line: string) => void): Promise<void> {
  const stale = staleInScope(WORKTREE, EXPO_PACKAGE);
  if (stale.length === 0) return;
  const names = stale.map((pkg) => pkg.name);
  progress(`build   ${names.join(', ')} src is newer than dist; stopping this worktree's Metro and watch build, then pnpm turbo build ${names.map((n) => `--filter=${n}`).join(' ')}`);
  stopRuntime();
  await mustStep(`turbo build ${names.join(' ')}`, 'pnpm', ['turbo', 'build', ...names.map((n) => `--filter=${n}`)], WORKTREE);
}

function servedOutputs(): readonly string[] {
  const roots = [{ name: '@clerk/expo', dir: EXPO_PACKAGE }, ...workspaceDependencies(WORKTREE, EXPO_PACKAGE)];
  return roots.flatMap((pkg) => {
    const prefix = `${relative(WORKTREE, pkg.dir)}/dist/`;
    return listFiles(join(pkg.dir, 'dist'), prefix, isBundledOutput).map((f) => f.rel);
  });
}

async function metroAnswers(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/status`, { signal: AbortSignal.timeout(2000) });
    return (await response.text()).includes('packager-status:running');
  } catch {
    return false;
  }
}

interface Metro {
  readonly ref: RuntimeProcess;
  readonly spawnOutputs: Fingerprint | null;
  readonly started: Started;
}

const metroCli = () => join(FIXTURE, 'node_modules', 'expo', 'bin', 'cli');

async function ensureMetro(started: Started, port: number, progress: (line: string) => void): Promise<Metro> {
  const name = `metro-${port}`;
  const running = readRuntime(name);
  if (running !== null) {
    await waitFor(`Metro pid ${running.pid} on port ${port} to answer`, () => metroAnswers(port), 120_000, name, `{cli} down, then retry; read ${runtimeLog(name)}`);
    return { ref: running, spawnOutputs: null, started };
  }
  if (await metroAnswers(port)) {
    throw new VerifyFailure('NOT_READY', `port ${port} already serves a Metro that this worktree did not start`, `stop the process listening on ${port} (lsof -nP -iTCP:${port} -sTCP:LISTEN)`);
  }
  if (!existsSync(metroCli())) throw new VerifyFailure('NOT_READY', 'the expo-native fixture has no node_modules', '{cli} up');
  const spawnOutputs = fingerprint(WORKTREE, servedOutputs(), null);
  const ref = startDetached(name, 'metro', [metroCli(), 'start', '--port', String(port), '--dev-client'], FIXTURE);
  started.names.push(name);
  progress(`metro   :${port}  expo start (pid ${ref.pid})`);
  await waitFor(`Metro on port ${port}`, () => metroAnswers(port), 120_000, name);
  return { ref, spawnOutputs, started };
}

async function fetchManifest(port: number, platform: Platform): Promise<Fetched<string>> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`, {
      headers: { 'expo-platform': platform, accept: 'application/expo+json,application/json' },
      signal: AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    const url = response.ok ? (JSON.parse(text) as { launchAsset?: { url?: string } }).launchAsset?.url : undefined;
    return url === undefined ? { ok: false, transient: true, message: `manifest ${response.status}: ${text.slice(0, 200)}` } : { ok: true, value: url };
  } catch (error) {
    return { ok: false, transient: true, message: (error as Error).message };
  }
}

async function fetchBundle(url: string): Promise<Fetched<BundleView>> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(300_000) });
    const body = await response.text();
    if (response.status === 200) return { ok: true, value: { revId: response.headers.get('x-metro-delta-id') ?? '', lastModified: Date.parse(response.headers.get('last-modified') ?? '') || 0, body } };
    let message = body.slice(0, 300);
    try {
      const parsed = JSON.parse(body) as { type?: string; message?: string };
      message = `${parsed.type ?? 'error'}: ${(parsed.message ?? '').split('\n')[0]}`;
    } catch {}
    return { ok: false, transient: response.status !== 500, message: `bundle ${response.status}: ${message}` };
  } catch (error) {
    return { ok: false, transient: true, message: (error as Error).message };
  }
}

async function ensureServed(metro: Metro, port: number, platform: Platform, progress: (line: string) => void): Promise<RuntimeProcess> {
  const name = `metro-${port}`;
  const stateFile = join(RUNTIME_DIR, `served-${port}-${platform}.json`);
  const saved = existsSync(stateFile) ? (JSON.parse(readFileSync(stateFile, 'utf8')) as Partial<GateMemory>) : null;
  let current = metro.ref;
  const memory: GateMemory =
    saved !== null && saved.metroPid === current.pid && saved.seen !== undefined && saved.outputs !== undefined
      ? (saved as GateMemory)
      : { metroPid: current.pid, spawn: metro.spawnOutputs, seen: {}, outputs: metro.spawnOutputs ?? {} };
  const pending = Object.keys(memory.seen).length === 0 ? [] : servedOutputs().filter((rel) => fingerprint(WORKTREE, [rel], memory.outputs)[rel]?.hash !== memory.outputs[rel]?.hash);
  progress(
    Object.keys(memory.seen).length === 0
      ? `metro   :${port}  bundling ${platform} once so the first launch does not wait on Metro`
      : pending.length > 0
        ? `metro   :${port}  ${pending.length} served file(s) changed since the last launch; waiting until Metro's ${platform} bundle has the new code`
        : `metro   :${port}  no served file changed since the last launch`,
  );
  const fix = `retry {cli} up --platform ${platform}; if it fails again, read ${runtimeLog(name)}`;
  const url = await (async () => {
    let last = '';
    let delay = 500;
    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      const manifest = await fetchManifest(port, platform);
      if (manifest.ok) return manifest.value;
      last = manifest.message;
      await sleep(delay);
      delay = Math.min(delay * 2, 8_000);
    }
    throw new VerifyFailure('NOT_READY', `Metro on port ${port} returned no ${platform} launch asset within 120s (${last})`, fix);
  })();
  const result = await confirmServed(
    {
      list: servedOutputs,
      fingerprint: (rels, previous) => fingerprint(WORKTREE, rels, previous),
      fetch: () => fetchBundle(url),
      touch: (rels) => {
        const now = new Date();
        for (const rel of rels) utimesSync(join(WORKTREE, rel), now, now);
      },
      restart: async () => {
        if (isRunning(current)) process.kill(current.pid, 'SIGTERM');
        await waitFor(`Metro pid ${current.pid} to exit`, async () => !(await metroAnswers(port)), 30_000, name);
        current = startDetached(name, 'metro', [metroCli(), 'start', '--port', String(port), '--dev-client'], FIXTURE);
        metro.started.names.includes(name) || metro.started.names.push(name);
        progress(`metro   :${port}  expo start (pid ${current.pid})`);
        await waitFor(`Metro on port ${port}`, () => metroAnswers(port), 120_000, name);
        return current.pid;
      },
      now: Date.now,
      sleep,
      progress: (line) => progress(line.replace(/^metro {3}/, `metro   :${port}  `)),
    },
    memory,
    { timeoutMs: 300_000, nudgeAfterMs: 5_000, maxRestarts: 2 },
  );
  if (!result.ok) {
    if (result.kind === 'bundle-error') {
      throw new VerifyFailure('NOT_READY', `Metro on port ${port} could not bundle ${platform}: ${result.message}`, `fix the bundling error, then rerun; read ${runtimeLog(name)}`);
    }
    throw new VerifyFailure('NOT_READY', `Metro on port ${port} did not serve the latest ${platform} bundle within 300s${result.message === '' ? '' : ` (${result.message})`}`, fix);
  }
  writeFileSync(stateFile, JSON.stringify(result.memory));
  return current;
}

async function prepareFixture(progress: (line: string) => void): Promise<void> {
  if (!existsSync(join(WORKTREE, 'node_modules'))) {
    throw new VerifyFailure('NOT_READY', 'the monorepo has no node_modules', `cd ${WORKTREE} && pnpm install`);
  }
  if (readRuntime('watch') === null) {
    stopRuntime();
    progress('build   turbo build @clerk/expo, @clerk/expo-biometrics, @clerk/expo-google-signin');
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
  cli: '.claude/skills/verify-clerk-expo/bin/control-clerk-expo',
  platforms: ['ios', 'android'],
  screens: ['home', 'auth', 'nativeAuth', 'userButton', 'userProfile', 'customSignIn', 'customSignUp', 'sso', 'tokenCache'],
  keysFile: 'integration/.keys.json',
  githubRepo: 'clerk/javascript',
  appId: () => APP_ID,
  buildInputs: nativeInputs,
  buildSources: (_platform, os) => (os === 'darwin' ? ['local'] : ['eas-build']),
  async build(platform, source, key, into, progress) {
    if (source !== 'local') throw new VerifyFailure('UNSUPPORTED', `the Expo host builds only locally for now (asked for ${source})`, 'run {cli} up on a Mac with Xcode and Android Studio');
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
    return withCleanup(stopRuntime, async (started) => {
      refuseOutOfScope();
      await rebuildStaleSiblings(progress);
      const watch = await ensureWatch(started, progress);
      await waitForWatchToCatchUp();
      const metro = await ensureServed(await ensureMetro(started, port, progress), port, lease.platform, progress);
      if (lease.platform === 'android') {
        const adb = sdkTool('adb');
        const reverse = await run(adb, ['-s', lease.deviceId, 'reverse', `tcp:${port}`, `tcp:${port}`]);
        if (reverse.code !== 0) throw new VerifyFailure('NOT_READY', `adb reverse tcp:${port} failed: ${reverse.stderr.trim()}`, '{cli} down --platform android, then {cli} up --platform android');
        await run(adb, ['-s', lease.deviceId, 'shell', 'am', 'force-stop', APP_ID]);
        const prefs = await run(adb, ['-s', lease.deviceId, 'shell', `run-as ${APP_ID} sh -c 'mkdir -p shared_prefs && cat > shared_prefs/expo.modules.devmenu.sharedpreferences.xml'`], { input: ANDROID_DEV_MENU_PREFS });
        if (prefs.code !== 0) throw new VerifyFailure('NOT_READY', `could not turn off the dev menu onboarding: ${prefs.stderr.trim()}`, '{cli} down --platform android, then {cli} up --platform android');
      }
      return { entry: devClientEntry(lease.platform, port), processes: [watch, metro] };
    }, progress);
  },
  entry: (platform) => devClientEntry(platform, 8081),
  logPredicates: { ios: `process == "${IOS_PRODUCT}" AND senderImagePath CONTAINS "${IOS_PRODUCT}"` },
  features: ['native-auth-view', 'user-button-and-profile', 'custom-flow-sign-in', 'custom-flow-sign-up', 'token-cache-persistence', 'native-js-sync'],
  backends: [localIosBackend(), localAndroidBackend()],
};
