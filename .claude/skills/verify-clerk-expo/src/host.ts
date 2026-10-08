import { spawn } from 'node:child_process';
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRunning, run, sleep } from './core/exec.ts';
import {
  LOCAL_POOL,
  VerifyFailure,
  type BackendKind,
  type HostAdapter,
  type HostEntry,
  type Platform,
  type RuntimeProcess,
  type ScratchPath,
} from './core/types.ts';
import { takeSlotLock } from './core/workspace.ts';
import {
  APP_ID,
  FIXTURE,
  IOS_PRODUCT,
  WORKTREE,
  buildFixture,
  buildInputs,
  mustStep,
  nativeCacheDir,
  type BuildProduct,
} from './fixture.ts';
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
  type BuiltRecords,
  type BundleView,
  type Fetched,
  type Fingerprint,
  type GateMemory,
} from './freshness.ts';
import { localAndroidBackend } from './platform/android/local.ts';
import { sdkTool } from './platform/android/sdk.ts';
import { localIosBackend } from './platform/ios/local.ts';

const ANDROID_ACTIVITY = '.MainActivity';
const DEV_CLIENT_SCHEME = 'exp+clerk-expo-native-build-fixture';
const ANDROID_DEV_MENU_PREFS = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?><map><boolean name="isOnboardingFinished" value="true" /><boolean name="showsAtLaunch" value="false" /><boolean name="showFab" value="false" /></map>`;

const GITHUB_REPO = 'clerk/javascript';
const EXPO_PACKAGE = join(WORKTREE, 'packages', 'expo');
const RUNTIME_DIR = fileURLToPath(new URL('../.verify/runtime/', import.meta.url));

const FIXTURE_LOCK_MINUTES = 45;

export function metroPort(lease: { readonly platform: Platform; readonly slot: number }): number {
  return 8081 + (lease.platform === 'ios' ? 0 : 4) + lease.slot;
}

export function devClientEntry(platform: Platform, port: number): HostEntry {
  const url = `http://localhost:${port}`;
  return platform === 'ios'
    ? {
        kind: 'dev-client',
        launchArguments: [
          '--initialUrl',
          url,
          '-EXDevMenuShowsAtLaunch',
          'NO',
          '-EXDevMenuIsOnboardingFinished',
          'YES',
          '-EXDevMenuShowFloatingActionButton',
          'NO',
        ],
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

async function withFixtureLock<T>(progress: (line: string) => void, fn: () => Promise<T>): Promise<T> {
  mkdirSync(RUNTIME_DIR, { recursive: true });
  const release = await takeSlotLock(
    join(RUNTIME_DIR, 'fixture-lock'),
    FIXTURE_LOCK_MINUTES * 60_000,
    () =>
      new VerifyFailure(
        'NOT_READY',
        `another verify process in this worktree has been building the expo-native fixture for ${FIXTURE_LOCK_MINUTES} minutes`,
        '{cli} down, then {cli} up',
      ),
    owner =>
      progress(`build   waiting for pid ${owner.pid}, which is building the expo-native fixture in this worktree`),
  );
  try {
    return await fn();
  } finally {
    release();
  }
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
  ...(['ios', 'android'] as const).flatMap(platform =>
    Array.from({ length: LOCAL_POOL[platform] }, (_, i) => `metro-${metroPort({ platform, slot: i + 1 })}`),
  ),
];

function stopRuntime(names: readonly string[] = allRuntimeNames()): void {
  for (const name of names) {
    const ref = readRuntime(name);
    if (ref !== null) process.kill(ref.pid, 'SIGTERM');
    rmSync(pidFile(name), { force: true });
  }
}

function startDetached(
  name: string,
  owner: Pick<RuntimeProcess, 'what' | 'platform'>,
  args: readonly string[],
  cwd: string,
): RuntimeProcess {
  mkdirSync(RUNTIME_DIR, { recursive: true });
  const log = openSync(runtimeLog(name), 'a');
  appendFileSync(log, `\n==== ${name} started ${new Date().toISOString()}\n`);
  const { CI: _ci, ...env } = process.env;
  const child = spawn(process.execPath, [...args], {
    cwd,
    detached: true,
    stdio: ['ignore', log, log],
    env: { ...env, LANG: 'en_US.UTF-8', EXPO_NO_TELEMETRY: '1', EXPO_OFFLINE: '1' },
  });
  child.unref();
  const ref: RuntimeProcess = { ...owner, pid: child.pid ?? 0, startedAt: Date.now() };
  writeFileSync(pidFile(name), JSON.stringify(ref));
  return ref;
}

async function waitFor(
  what: string,
  ready: () => Promise<boolean>,
  timeoutMs: number,
  logName: string,
  fix?: string,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ready()) return;
    await sleep(500);
  }
  throw new VerifyFailure(
    'NOT_READY',
    `${what} was not ready within ${timeoutMs / 1000}s`,
    fix ?? `read ${runtimeLog(logName)}`,
  );
}

interface Started {
  readonly names: string[];
}

export async function withCleanup<T>(
  stop: (names: readonly string[]) => void,
  fn: (started: Started) => Promise<T>,
  progress: (line: string) => void,
): Promise<T> {
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
  const ref = startDetached(
    'watch',
    { what: 'watch' },
    [join(tsdown, '..', 'dist', 'run.mjs'), '--watch'],
    EXPO_PACKAGE,
  );
  started.names.push('watch');
  progress(`watch   packages/expo  tsdown --watch (pid ${ref.pid})`);
  await waitFor(
    'the @clerk/expo watch build',
    async () => /Build complete|built in|Rebuilt/i.test(readFileSync(runtimeLog('watch')).subarray(offset).toString()),
    180_000,
    'watch',
  );
  return ref;
}

const expoOutputs = () => listFiles(join(EXPO_PACKAGE, 'dist'), 'packages/expo/dist/', isBundledOutput);

async function waitForWatchToCatchUp(): Promise<void> {
  let previous = '';
  await waitFor(
    'the @clerk/expo watch build to pick up the latest edit',
    async () => {
      const outputs = expoOutputs();
      const signature = outputs.map(f => `${f.rel}:${f.mtime}`).join('|');
      const settled = signature === previous;
      previous = signature;
      return (
        settled && newest(outputs) >= newest(listFiles(join(EXPO_PACKAGE, 'src'), 'packages/expo/src/', isTsdownSource))
      );
    },
    60_000,
    'watch',
  );
}

const recordsFile = () => join(RUNTIME_DIR, 'built-dependencies.json');

function readRecords(): BuiltRecords {
  return existsSync(recordsFile()) ? (JSON.parse(readFileSync(recordsFile(), 'utf8')) as BuiltRecords) : {};
}

function writeRecords(records: BuiltRecords): void {
  mkdirSync(RUNTIME_DIR, { recursive: true });
  writeFileSync(recordsFile(), JSON.stringify(records));
}

function refuseOutOfScope(): void {
  const { stale, records } = staleOutOfScope(WORKTREE, EXPO_PACKAGE, readRecords());
  writeRecords(records);
  if (stale.length === 0) return;
  const names = stale.map(pkg => pkg.name);
  throw new VerifyFailure(
    'NOT_READY',
    `${names.join(', ')} ${stale.length === 1 ? 'has' : 'have'} source newer than ${stale.length === 1 ? 'its dist' : 'their dist'}, with content that dist was not built from. This skill rebuilds only @clerk/expo and its Expo-module siblings; it verifies other workspace dependencies after you build them, and it will not launch on their stale dist`,
    `{cli} down, then pnpm turbo build --force ${names.map(n => `--filter=${n}`).join(' ')}, then rerun`,
  );
}

async function rebuildStaleSiblings(progress: (line: string) => void): Promise<void> {
  const { stale, records } = staleInScope(WORKTREE, EXPO_PACKAGE, readRecords());
  writeRecords(records);
  if (stale.length === 0) return;
  const names = stale.map(pkg => pkg.name);
  progress(
    `build   ${names.join(', ')} src changed since dist was built; stopping this worktree's Metro and watch build, then pnpm turbo build --force ${names.map(n => `--filter=${n}`).join(' ')}`,
  );
  stopRuntime();
  await mustStep(
    `turbo build ${names.join(' ')}`,
    'pnpm',
    ['turbo', 'build', '--force', ...names.map(n => `--filter=${n}`)],
    WORKTREE,
  );
  writeRecords(staleInScope(WORKTREE, EXPO_PACKAGE, readRecords()).records);
}

function servedOutputs(): readonly string[] {
  const roots = [{ name: '@clerk/expo', dir: EXPO_PACKAGE }, ...workspaceDependencies(WORKTREE, EXPO_PACKAGE)];
  return roots.flatMap(pkg => {
    const prefix = `${relative(WORKTREE, pkg.dir)}/dist/`;
    return listFiles(join(pkg.dir, 'dist'), prefix, isBundledOutput).map(f => f.rel);
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

const startMetro = (port: number, platform: Platform): RuntimeProcess =>
  startDetached(
    `metro-${port}`,
    { what: 'metro', platform },
    [metroCli(), 'start', '--port', String(port), '--dev-client'],
    FIXTURE,
  );

async function ensureMetro(
  started: Started,
  port: number,
  platform: Platform,
  progress: (line: string) => void,
): Promise<Metro> {
  const name = `metro-${port}`;
  const running = readRuntime(name);
  if (running !== null) {
    await waitFor(
      `Metro pid ${running.pid} on port ${port} to answer`,
      () => metroAnswers(port),
      120_000,
      name,
      `{cli} down, then retry; read ${runtimeLog(name)}`,
    );
    return { ref: running, spawnOutputs: null, started };
  }
  if (await metroAnswers(port)) {
    throw new VerifyFailure(
      'NOT_READY',
      `port ${port} already serves a Metro that this worktree did not start`,
      `stop the process listening on ${port} (lsof -nP -iTCP:${port} -sTCP:LISTEN)`,
    );
  }
  if (!existsSync(metroCli()))
    throw new VerifyFailure('NOT_READY', 'the expo-native fixture has no node_modules', '{cli} up');
  const spawnOutputs = fingerprint(WORKTREE, servedOutputs(), null);
  const ref = startMetro(port, platform);
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
    return url === undefined
      ? { ok: false, transient: true, message: `manifest ${response.status}: ${text.slice(0, 200)}` }
      : { ok: true, value: url };
  } catch (error) {
    return { ok: false, transient: true, message: (error as Error).message };
  }
}

async function fetchBundle(url: string): Promise<Fetched<BundleView>> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(300_000) });
    const body = await response.text();
    if (response.status === 200)
      return {
        ok: true,
        value: {
          revId: response.headers.get('x-metro-delta-id') ?? '',
          lastModified: Date.parse(response.headers.get('last-modified') ?? '') || 0,
          body,
        },
      };
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

async function ensureServed(
  metro: Metro,
  port: number,
  platform: Platform,
  progress: (line: string) => void,
): Promise<RuntimeProcess> {
  const name = `metro-${port}`;
  const stateFile = join(RUNTIME_DIR, `served-${port}-${platform}.json`);
  const saved = existsSync(stateFile) ? (JSON.parse(readFileSync(stateFile, 'utf8')) as Partial<GateMemory>) : null;
  let current = metro.ref;
  const memory: GateMemory =
    saved !== null && saved.metroPid === current.pid && saved.seen !== undefined && saved.outputs !== undefined
      ? (saved as GateMemory)
      : { metroPid: current.pid, spawn: metro.spawnOutputs, seen: {}, outputs: metro.spawnOutputs ?? {} };
  const pending =
    Object.keys(memory.seen).length === 0
      ? []
      : servedOutputs().filter(
          rel => fingerprint(WORKTREE, [rel], memory.outputs)[rel]?.hash !== memory.outputs[rel]?.hash,
        );
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
    throw new VerifyFailure(
      'NOT_READY',
      `Metro on port ${port} returned no ${platform} launch asset within 120s (${last})`,
      fix,
    );
  })();
  const result = await confirmServed(
    {
      list: servedOutputs,
      fingerprint: (rels, previous) => fingerprint(WORKTREE, rels, previous),
      fetch: () => fetchBundle(url),
      touch: rels => {
        const now = new Date();
        for (const rel of rels) utimesSync(join(WORKTREE, rel), now, now);
      },
      restart: async () => {
        if (isRunning(current)) process.kill(current.pid, 'SIGTERM');
        await waitFor(`Metro pid ${current.pid} to exit`, async () => !(await metroAnswers(port)), 30_000, name);
        current = startMetro(port, platform);
        metro.started.names.includes(name) || metro.started.names.push(name);
        progress(`metro   :${port}  expo start (pid ${current.pid})`);
        await waitFor(`Metro on port ${port}`, () => metroAnswers(port), 120_000, name);
        return current.pid;
      },
      now: Date.now,
      sleep,
      progress: line => progress(line.replace(/^metro {3}/, `metro   :${port}  `)),
    },
    memory,
    { timeoutMs: 300_000, nudgeAfterMs: 5_000, maxRestarts: 2, settledFailureMs: 3_000 },
  );
  if (!result.ok) {
    if (result.kind === 'bundle-error') {
      throw new VerifyFailure(
        'NOT_READY',
        `Metro on port ${port} could not bundle ${platform}: ${result.message}`,
        `fix the bundling error, then rerun; read ${runtimeLog(name)}`,
      );
    }
    throw new VerifyFailure(
      'NOT_READY',
      `Metro on port ${port} did not serve the latest ${platform} bundle within 300s${result.message === '' ? '' : ` (${result.message})`}`,
      fix,
    );
  }
  writeFileSync(stateFile, JSON.stringify(result.memory));
  return current;
}

export function productFor(backend: BackendKind, env: NodeJS.ProcessEnv = process.env): BuildProduct {
  const asked = env.VERIFY_LOCAL_BUILD;
  if (asked === undefined || asked === '' || asked === 'dev-client') return 'dev-client';
  if (asked === 'standalone') return 'standalone';
  throw new VerifyFailure(
    'USAGE',
    `VERIFY_LOCAL_BUILD=${asked} is not dev-client or standalone`,
    'unset VERIFY_LOCAL_BUILD or set it to standalone',
  );
}

function keepBuild(built: string, into: string): string {
  mkdirSync(into, { recursive: true });
  const path = join(into, basename(built));
  rmSync(path, { recursive: true, force: true });
  cpSync(built, path, { recursive: true, verbatimSymlinks: true });
  return path;
}

export const host: HostAdapter = {
  repo: 'clerk-expo',
  cli: '.claude/skills/verify-clerk-expo/bin/control-clerk-expo',
  platforms: ['ios', 'android'],
  githubRepo: GITHUB_REPO,
  appId: () => APP_ID,
  buildInputs: (platform, backend) => buildInputs(platform, productFor(backend)),
  async build(platform, key, into, progress) {
    const product = productFor('local');
    const path = await withFixtureLock(progress, async () => {
      const watching = product === 'dev-client' && readRuntime('watch') !== null;
      if (watching)
        progress('build   the running watch build keeps packages/expo/dist current, so turbo build is skipped');
      else stopRuntime();
      const built = await buildFixture({
        platform,
        product,
        nativeKey: key,
        buildPackages: !watching,
        nativeCache: nativeCacheDir(),
        progress,
      });
      return keepBuild(built, into);
    });
    return { platform, key, appId: APP_ID, path: path as ScratchPath, source: 'local' };
  },
  async runtime(lease, progress) {
    if (productFor(lease.backend) === 'standalone') return { entry: { kind: 'binary' }, processes: [] };
    const port = metroPort(lease);
    return withCleanup(
      stopRuntime,
      async started => {
        refuseOutOfScope();
        await rebuildStaleSiblings(progress);
        const watch = await ensureWatch(started, progress);
        await waitForWatchToCatchUp();
        const metro = await ensureServed(
          await ensureMetro(started, port, lease.platform, progress),
          port,
          lease.platform,
          progress,
        );
        if (lease.platform === 'android') {
          const adb = sdkTool('adb');
          const reverse = await run(adb, ['-s', lease.deviceId, 'reverse', `tcp:${port}`, `tcp:${port}`]);
          if (reverse.code !== 0)
            throw new VerifyFailure(
              'NOT_READY',
              `adb reverse tcp:${port} failed: ${reverse.stderr.trim()}`,
              '{cli} down --platform android, then {cli} up --platform android',
            );
          await run(adb, ['-s', lease.deviceId, 'shell', 'am', 'force-stop', APP_ID]);
          const prefs = await run(
            adb,
            [
              '-s',
              lease.deviceId,
              'shell',
              `run-as ${APP_ID} sh -c 'mkdir -p shared_prefs && cat > shared_prefs/expo.modules.devmenu.sharedpreferences.xml'`,
            ],
            { input: ANDROID_DEV_MENU_PREFS },
          );
          if (prefs.code !== 0)
            throw new VerifyFailure(
              'NOT_READY',
              `could not turn off the dev menu onboarding: ${prefs.stderr.trim()}`,
              '{cli} down --platform android, then {cli} up --platform android',
            );
        }
        return { entry: devClientEntry(lease.platform, port), processes: [watch, metro] };
      },
      progress,
    );
  },
  logPredicates: { ios: `process == "${IOS_PRODUCT}" AND senderImagePath CONTAINS "${IOS_PRODUCT}"` },
  backends: [localIosBackend(), localAndroidBackend()],
};
