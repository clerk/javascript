import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  closeSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  renameSync,
  rmSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, delimiter, dirname, join } from 'node:path';
import { run } from './core/exec.ts';
import { VerifyFailure, type Platform } from './core/types.ts';

export type Must = (
  what: string,
  command: string,
  args: readonly string[],
  cwd: string,
  env?: Readonly<Record<string, string>>,
) => Promise<void>;

export interface FingerprintInputs {
  readonly platform: Platform;
  readonly worktree: string;
  readonly inputs: readonly string[];
  readonly files: readonly string[];
  readonly toolchain: string;
  readonly installed: string;
}

export async function nativeFingerprint(spec: FingerprintInputs): Promise<string> {
  const listed = await run(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...spec.inputs],
    {
      cwd: spec.worktree,
    },
  );
  if (listed.code !== 0)
    throw new VerifyFailure(
      'NOT_READY',
      `git ls-files failed: ${listed.stderr.trim()}`,
      'run {cli} from inside a git worktree',
    );
  const hash = createHash('sha256');
  hash.update(spec.platform).update('\0').update(spec.toolchain).update('\0').update(spec.installed).update('\0');
  const tracked = [...new Set(listed.stdout.split('\0').filter(file => file.length > 0))].sort();
  for (const file of tracked) {
    const path = join(spec.worktree, file);
    hash.update(file).update('\0');
    hash.update(existsSync(path) ? readFileSync(path) : 'deleted').update('\0');
  }
  for (const file of spec.files) {
    hash.update(basename(file)).update('\0');
    hash.update(existsSync(file) ? readFileSync(file) : 'missing').update('\0');
  }
  return hash.digest('hex').slice(0, 16);
}

export type ExpoFingerprint = (fixture: string, platform: Platform) => Promise<unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const expoFingerprint: ExpoFingerprint = async (fixture, platform) => {
  const fromFixture = createRequire(join(fixture, 'package.json'));
  const fromExpo = createRequire(fromFixture.resolve('expo/package.json'));
  const tool: unknown = fromExpo('@expo/fingerprint');
  if (!isRecord(tool) || typeof tool.createFingerprintAsync !== 'function')
    throw new Error('it has no createFingerprintAsync');
  return tool.createFingerprintAsync(fixture, {
    platforms: [platform],
    ignorePaths: ['ios/**/*', 'android/**/*'],
    silent: true,
  });
};

type NativeSources = { readonly ok: true; readonly sources: string } | { readonly ok: false; readonly why: string };

const PNPM_PEERS = /(node_modules\/\.pnpm\/(?:@[^/+@]+\+)?[^/@]+@[^/_]+)_[^/]*(?=\/)/g;

function nativeSources(result: unknown, platform: Platform): NativeSources {
  if (!isRecord(result) || !Array.isArray(result.sources)) return { ok: false, why: 'it returned no sources' };
  const lines: string[] = [];
  const named = new Set<string>();
  for (const source of result.sources) {
    if (!isRecord(source)) return { ok: false, why: 'it returned a source that is not an object' };
    const { type, id, filePath, hash, contents } = source;
    if (type === 'contents' && typeof id === 'string' && (typeof contents === 'string' || Buffer.isBuffer(contents))) {
      named.add(id);
      lines.push(`contents ${id} ${contents.toString()}`);
    } else if (
      (type === 'file' || type === 'dir') &&
      typeof filePath === 'string' &&
      (typeof hash === 'string' || hash === null)
    ) {
      if (hash !== null) lines.push(`${type} ${filePath} ${hash}`);
    } else {
      return { ok: false, why: `it returned a ${String(type)} source this CLI cannot read` };
    }
  }
  for (const id of ['expoConfig', `expoAutolinkingConfig:${platform}`])
    if (!named.has(id)) return { ok: false, why: `it left out ${id}` };
  return {
    ok: true,
    sources: lines
      .map(line => line.replace(PNPM_PEERS, '$1'))
      .sort()
      .join('\n'),
  };
}

const LOCKED_PACKAGE = /^ {2}'?((?:@[^/@\s]+\/)?[^@\s'/]+)@([^:'(\s]+)/gm;
const BUILDS_THE_NATIVE_PROJECT = /^(?:@expo\/|@react-native[^/]*\/|expo(?:-|$)|react-native(?:-|$)|hermes-)/;

function nativeToolVersions(lockfile: string): readonly string[] {
  const versions = new Set<string>();
  for (const [, name = '', version = ''] of lockfile.matchAll(LOCKED_PACKAGE))
    if (BUILDS_THE_NATIVE_PROJECT.test(name)) versions.add(`${name}@${version}`);
  return [...versions].sort();
}

export interface InstalledNativeInputs {
  readonly installed: string;
  readonly wholeLockfile: string | null;
}

export async function installedNativeInputs(
  fixture: string,
  platform: Platform,
  expo: ExpoFingerprint,
): Promise<InstalledNativeInputs> {
  const file = join(fixture, 'pnpm-lock.yaml');
  if (!existsSync(file))
    throw new VerifyFailure(
      'NOT_READY',
      `${file} is missing, so nothing says which packages the fixture installed`,
      'delete integration/templates/expo-native/node_modules, then rerun {cli} up',
    );
  const lockfile = readFileSync(file, 'utf8');
  const tools = nativeToolVersions(lockfile);
  const read: NativeSources =
    tools.length === 0
      ? { ok: false, why: 'pnpm-lock.yaml names no Expo or React Native package' }
      : await expo(fixture, platform).then(
          result => {
            const sources = nativeSources(result, platform);
            return sources.ok ? sources : { ok: false, why: `@expo/fingerprint cannot be relied on: ${sources.why}` };
          },
          (error: unknown) => ({
            ok: false,
            why: `@expo/fingerprint did not run: ${error instanceof Error ? error.message : String(error)}`,
          }),
        );
  return read.ok
    ? { installed: ['native packages', ...tools, read.sources].join('\n'), wholeLockfile: null }
    : { installed: `whole lockfile\n${lockfile}`, wholeLockfile: read.why };
}

export interface KeptNativeBuild {
  readonly id: string;
  readonly dir: string;
  readonly app: string;
}

export function keptNativeBuild(
  cache: string,
  platform: Platform,
  fingerprint: string,
  appName: string,
): KeptNativeBuild {
  const id = `${platform}-${fingerprint}`;
  return { id, dir: join(cache, id), app: join(cache, id, appName) };
}

export function keepNativeBuild(kept: KeptNativeBuild, built: string): void {
  const incoming = `${kept.dir}.incoming`;
  rmSync(incoming, { recursive: true, force: true });
  mkdirSync(incoming, { recursive: true });
  cpSync(built, join(incoming, basename(kept.app)), { recursive: true, verbatimSymlinks: true });
  rmSync(kept.dir, { recursive: true, force: true });
  renameSync(incoming, kept.dir);
}

const HERMES_MAGIC = 'c61fbc03c103191f';

function hermesVersion(bundle: Buffer): number | null {
  if (bundle.length < 12 || bundle.subarray(0, 8).toString('hex') !== HERMES_MAGIC) return null;
  return bundle.readUInt32LE(8);
}

function head(file: string, bytes: number): Buffer {
  const buffer = Buffer.alloc(bytes);
  const fd = openSync(file, 'r');
  try {
    return buffer.subarray(0, readSync(fd, buffer, 0, bytes, 0));
  } finally {
    closeSync(fd);
  }
}

const ANDROID_BUNDLE = 'assets/index.android.bundle';
const IOS_BUNDLE = 'main.jsbundle';

function apkEntry(apk: string, entry: string): Buffer | null {
  try {
    return execFileSync('unzip', ['-p', apk, entry], {
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function embeddedBundle(platform: Platform, app: string): Buffer | null {
  if (platform === 'android') return apkEntry(app, ANDROID_BUNDLE);
  const file = join(app, IOS_BUNDLE);
  return existsSync(file) ? readFileSync(file) : null;
}

function filesUnder(dir: string): readonly string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath, entry.name));
}

function hermesc(fixture: string): string {
  const fromFixture = createRequire(join(fixture, 'package.json'));
  const fromReactNative = createRequire(fromFixture.resolve('react-native/package.json'));
  const os = process.platform === 'darwin' ? 'osx-bin' : process.platform === 'win32' ? 'win64-bin' : 'linux64-bin';
  return join(dirname(fromReactNative.resolve('hermes-compiler/package.json')), 'hermesc', os, 'hermesc');
}

const PAGE_ALIGNING_BUILD_TOOLS = 35;

function pageAligningBuildTools(sdk: string): string | null {
  const root = join(sdk, 'build-tools');
  const versions = existsSync(root)
    ? readdirSync(root).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    : [];
  const found = versions.find(
    version => Number.parseInt(version, 10) >= PAGE_ALIGNING_BUILD_TOOLS && existsSync(join(root, version, 'zipalign')),
  );
  return found === undefined ? null : join(root, found);
}

interface ApkTools {
  readonly buildTools: string;
  readonly javaHome: string;
}

export interface Embed {
  readonly platform: Platform;
  readonly fixture: string;
  readonly from: string;
  readonly into: string;
  readonly iosExecutable: string;
  readonly android: { readonly sdk: string; readonly javaHome: string } | null;
  readonly must: Must;
}

export type Embedded = { readonly ok: true; readonly bundle: string } | { readonly ok: false; readonly why: string };

async function signApk(embed: Embed, apk: ApkTools, work: string, bundle: string): Promise<void> {
  const tools = apk.buildTools;
  const env = {
    JAVA_HOME: apk.javaHome,
    PATH: `${join(apk.javaHome, 'bin')}${delimiter}${process.env.PATH ?? ''}`,
  };
  const stage = join(work, 'stage');
  mkdirSync(join(stage, 'assets'), { recursive: true });
  copyFileSync(bundle, join(stage, ANDROID_BUNDLE));
  const edited = join(work, 'edited.apk');
  const aligned = join(work, 'aligned.apk');
  copyFileSync(embed.from, edited);
  await embed.must('zip -d', 'zip', ['-q', '-d', edited, ANDROID_BUNDLE], work);
  await embed.must('zip', 'zip', ['-q', '-0', '-X', edited, ANDROID_BUNDLE], stage);
  await embed.must('zipalign', join(tools, 'zipalign'), ['-f', '-P', '16', '4', edited, aligned], work);
  let keystore = join(embed.fixture, 'android', 'app', 'debug.keystore');
  if (!existsSync(keystore)) {
    keystore = join(work, 'debug.keystore');
    await embed.must(
      'keytool',
      join(apk.javaHome, 'bin', 'keytool'),
      [
        '-genkeypair',
        '-keystore',
        keystore,
        '-storepass',
        'android',
        '-keypass',
        'android',
        '-alias',
        'androiddebugkey',
        '-keyalg',
        'RSA',
        '-keysize',
        '2048',
        '-validity',
        '30',
        '-dname',
        'CN=Android Debug,O=Android,C=US',
      ],
      work,
      env,
    );
  }
  mkdirSync(dirname(embed.into), { recursive: true });
  rmSync(embed.into, { force: true });
  await embed.must(
    'apksigner',
    join(tools, 'apksigner'),
    [
      'sign',
      '--ks',
      keystore,
      '--ks-pass',
      'pass:android',
      '--ks-key-alias',
      'androiddebugkey',
      '--key-pass',
      'pass:android',
      '--out',
      embed.into,
      aligned,
    ],
    work,
    env,
  );
}

function placeInApp(embed: Embed, bundle: string, assets: string): void {
  rmSync(embed.into, { recursive: true, force: true });
  mkdirSync(dirname(embed.into), { recursive: true });
  cpSync(embed.from, embed.into, { recursive: true, verbatimSymlinks: true });
  copyFileSync(bundle, join(embed.into, IOS_BUNDLE));
  rmSync(join(embed.into, 'assets'), { recursive: true, force: true });
  if (existsSync(join(assets, 'assets')))
    cpSync(join(assets, 'assets'), join(embed.into, 'assets'), { recursive: true });
  const executables = [
    join(embed.into, embed.iosExecutable),
    ...filesUnder(join(embed.into, 'Frameworks')).filter(
      file => basename(dirname(file)) === `${basename(file)}.framework`,
    ),
  ];
  for (const file of executables) if (existsSync(file)) chmodSync(file, 0o755);
}

export async function embedJavaScript(embed: Embed): Promise<Embedded> {
  const before = embeddedBundle(embed.platform, embed.from);
  const wanted = before === null ? null : hermesVersion(before);
  if (wanted === null) return { ok: false, why: 'it holds no Hermes bundle to replace' };
  const buildTools = embed.android === null ? null : pageAligningBuildTools(embed.android.sdk);
  const apk = embed.android === null || buildTools === null ? null : { buildTools, javaHome: embed.android.javaHome };
  if (embed.platform === 'android' && apk === null)
    return {
      ok: false,
      why: `the Android SDK has no build-tools ${PAGE_ALIGNING_BUILD_TOOLS} or newer, which aligning the APK again needs`,
    };
  const work = mkdtempSync(join(tmpdir(), 'verify-expo-embed-'));
  try {
    const manifest = JSON.parse(readFileSync(join(embed.fixture, 'package.json'), 'utf8')) as { main?: string };
    const source = join(work, 'bundle.js');
    const assets = join(work, 'assets');
    const compiled = join(work, 'bundle.hbc');
    mkdirSync(assets);
    await embed.must(
      'expo export:embed',
      'pnpm',
      [
        'expo',
        'export:embed',
        '--platform',
        embed.platform,
        '--dev',
        'false',
        '--reset-cache',
        '--entry-file',
        join(embed.fixture, manifest.main ?? 'index.js'),
        '--bundle-output',
        source,
        '--assets-dest',
        assets,
        '--minify',
        'false',
      ],
      embed.fixture,
    );
    await embed.must(
      'hermesc',
      hermesc(embed.fixture),
      ['-w', '-emit-binary', '-max-diagnostic-width=80', '-O', '-out', compiled, source],
      work,
    );
    const made = hermesVersion(head(compiled, 12));
    if (made !== wanted)
      return { ok: false, why: `it runs Hermes bytecode ${wanted}, and this checkout compiles ${made ?? 'none'}` };
    if (apk !== null && embed.platform === 'android') {
      if (filesUnder(assets).length > 0)
        return { ok: false, why: 'this checkout bundles image assets, which an APK takes only from a resource build' };
      await signApk(embed, apk, work, compiled);
    } else {
      placeInApp(embed, compiled, assets);
    }
    const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
    const after = embeddedBundle(embed.platform, embed.into);
    const expected = sha(readFileSync(compiled));
    if (after === null || sha(after) !== expected)
      throw new VerifyFailure(
        'BUILD_FAILED',
        `${embed.into} does not hold the bundle that was just made from this checkout`,
        'unset VERIFY_NATIVE_CACHE, then rerun {cli} up',
      );
    return { ok: true, bundle: expected.slice(0, 12) };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
