import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './core/exec.ts';
import { VerifyFailure, type Platform } from './core/types.ts';
import {
  embedJavaScript,
  expoFingerprint,
  installedNativeInputs,
  keepNativeBuild,
  keptNativeBuild,
  nativeFingerprint,
  type ExpoFingerprint,
  type KeptNativeBuild,
} from './native-build.ts';
import { resolveJavaHome, sdkRoot } from './platform/android/sdk.ts';

export const IOS_PRODUCT = 'ClerkExpoNativeBuildFixture';
export const WORKTREE = fileURLToPath(new URL('../../../', import.meta.url));
export const FIXTURE = join(WORKTREE, 'integration', 'templates', 'expo-native');

export type BuildProduct = 'dev-client' | 'standalone';

interface Recipe {
  readonly configuration: 'Debug' | 'Release';
  readonly gradle: readonly string[];
  readonly apk: string;
  readonly expoPackages: readonly string[];
  readonly label: string;
}

const EXPO_PACKAGES = ['expo-auth-session', 'expo-constants', 'expo-crypto', 'expo-secure-store', 'expo-web-browser'];

const RECIPES: Readonly<Record<BuildProduct, Recipe>> = {
  'dev-client': {
    configuration: 'Debug',
    gradle: ['assembleDebug'],
    apk: join('debug', 'app-debug.apk'),
    expoPackages: [...EXPO_PACKAGES, 'expo-dev-client'],
    label: 'dev client',
  },
  standalone: {
    configuration: 'Release',
    gradle: [':app:createBundleReleaseJsAndAssets', '--rerun', 'assembleRelease'],
    apk: join('release', 'app-release.apk'),
    expoPackages: EXPO_PACKAGES,
    label: 'JS embedded',
  },
};

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

const BUNDLE_INPUTS = [
  '.npmrc',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'turbo.json',
  'packages/clerk-js',
  'packages/expo',
  'packages/expo-biometrics',
  'packages/expo-google-signin',
  'packages/react',
  'packages/shared',
  'integration/templates/expo-native',
] as const;

export function nativeInputs(platform: Platform): readonly string[] {
  return [...PLATFORM_NATIVE_INPUTS[platform], ...SHARED_NATIVE_INPUTS];
}

export function buildInputs(platform: Platform, product: BuildProduct): readonly string[] {
  return product === 'standalone' ? [...nativeInputs(platform), ...BUNDLE_INPUTS] : nativeInputs(platform);
}

export function artifact(platform: Platform, product: BuildProduct, fixture: string = FIXTURE): string {
  const recipe = RECIPES[product];
  return platform === 'ios'
    ? join(
        fixture,
        'ios',
        'build',
        'Build',
        'Products',
        `${recipe.configuration}-iphonesimulator`,
        `${IOS_PRODUCT}.app`,
      )
    : join(fixture, 'android', 'app', 'build', 'outputs', 'apk', recipe.apk);
}

function step(
  command: string,
  args: readonly string[],
  cwd: string,
  env: Readonly<Record<string, string>> = {},
): Promise<{ code: number; tail: string }> {
  return new Promise(resolve => {
    const child = spawn(command, [...args], {
      cwd,
      env: { ...process.env, LANG: 'en_US.UTF-8', CI: '1', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
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
    child.on('close', code => resolve({ code: code ?? 1, tail: lines.slice(-15).join('\n') }));
  });
}

export async function mustStep(
  what: string,
  command: string,
  args: readonly string[],
  cwd: string,
  env?: Readonly<Record<string, string>>,
): Promise<void> {
  const result = await step(command, args, cwd, env);
  if (result.code !== 0)
    throw new VerifyFailure(
      'BUILD_FAILED',
      `${what} exited ${result.code}:\n${result.tail}`,
      'fix the error above, then rerun {cli} up',
    );
}

export interface FixtureBuild {
  readonly platform: Platform;
  readonly product: BuildProduct;
  readonly nativeKey: string;
  readonly buildPackages: boolean;
  readonly nativeCache?: string | null;
  readonly progress: (line: string) => void;
}

export interface FixtureSite {
  readonly worktree: string;
  readonly fixture: string;
  readonly must: typeof mustStep;
  readonly toolchain?: (platform: Platform) => Promise<string>;
  readonly expoFingerprint?: ExpoFingerprint;
}

async function installedToolchain(platform: Platform): Promise<string> {
  if (platform === 'android') return 'gradle';
  const xcode = await run('xcodebuild', ['-version']);
  return xcode.code === 0 ? xcode.stdout.trim() : 'no xcodebuild';
}

const THIS_CHECKOUT: FixtureSite = { worktree: WORKTREE, fixture: FIXTURE, must: mustStep };

export function nativeCacheDir(env: NodeJS.ProcessEnv = process.env, worktree: string = WORKTREE): string | null {
  const asked = env.VERIFY_NATIVE_CACHE;
  return asked === undefined || asked === '' ? null : resolve(worktree, asked);
}

const nativeProjectMarker = (site: FixtureSite, platform: Platform) =>
  join(site.fixture, platform, '.verify-native-project');

export function nativeProjectIsCurrent(site: FixtureSite, platform: Platform, wanted: string): boolean {
  const marker = nativeProjectMarker(site, platform);
  return (
    existsSync(join(site.fixture, 'node_modules')) && existsSync(marker) && readFileSync(marker, 'utf8') === wanted
  );
}

const dependenciesMarker = (site: FixtureSite) => join(site.fixture, 'node_modules', '.verify-dependencies');

function dependenciesOf(site: FixtureSite, product: BuildProduct): string {
  const template = createHash('sha256')
    .update(readFileSync(join(site.fixture, 'package.sdk-57.json')))
    .digest('hex');
  return `${product} ${template}`;
}

async function installDependencies(site: FixtureSite, product: BuildProduct): Promise<void> {
  rmSync(dependenciesMarker(site), { force: true });
  cpSync(join(site.fixture, 'package.sdk-57.json'), join(site.fixture, 'package.json'));
  await site.must(
    'pnpm add the workspace packages',
    'pnpm',
    [
      'add',
      'link:../../../packages/expo',
      'link:../../../packages/expo-google-signin',
      'link:../../../packages/expo-biometrics',
    ],
    site.fixture,
  );
  await site.must('expo install', 'pnpm', ['expo', 'install', ...RECIPES[product].expoPackages], site.fixture);
  writeFileSync(dependenciesMarker(site), dependenciesOf(site, product));
}

async function ensureDependencies(site: FixtureSite, product: BuildProduct): Promise<void> {
  const marker = dependenciesMarker(site);
  if (existsSync(marker) && readFileSync(marker, 'utf8') === dependenciesOf(site, product)) return;
  await installDependencies(site, product);
}

export async function locateNativeBuild(
  cache: string,
  platform: Platform,
  site: FixtureSite = THIS_CHECKOUT,
  note: (line: string) => void = () => undefined,
): Promise<KeptNativeBuild> {
  await ensureDependencies(site, 'standalone');
  const { installed, wholeLockfile } = await installedNativeInputs(
    site.fixture,
    platform,
    site.expoFingerprint ?? expoFingerprint,
  );
  if (wholeLockfile !== null)
    note(`build   native fingerprint covers the whole pnpm-lock.yaml, because ${wholeLockfile}`);
  const fingerprint = await nativeFingerprint({
    platform,
    worktree: site.worktree,
    inputs: nativeInputs(platform),
    files: [fileURLToPath(import.meta.url), fileURLToPath(new URL('./native-build.ts', import.meta.url))],
    toolchain: await (site.toolchain ?? installedToolchain)(platform),
    installed,
  });
  return keptNativeBuild(cache, platform, fingerprint, basename(artifact(platform, 'standalone', site.fixture)));
}

async function generateNativeProject(
  site: FixtureSite,
  build: FixtureBuild,
  wanted: string,
  dependencies: 'install' | 'installed',
): Promise<void> {
  const { platform, progress } = build;
  rmSync(nativeProjectMarker(site, platform), { force: true });
  if (dependencies === 'install') await installDependencies(site, build.product);
  progress(`build   expo prebuild --clean --platform ${platform}`);
  await site.must('expo prebuild', 'pnpm', ['expo', 'prebuild', '--clean', '--platform', platform], site.fixture);
  writeFileSync(nativeProjectMarker(site, platform), wanted);
}

export async function buildFixture(build: FixtureBuild, site: FixtureSite = THIS_CHECKOUT): Promise<string> {
  const { platform, product, progress } = build;
  const recipe = RECIPES[product];
  if (!existsSync(join(site.worktree, 'node_modules'))) {
    throw new VerifyFailure('NOT_READY', 'the monorepo has no node_modules', `cd ${site.worktree} && pnpm install`);
  }
  if (build.buildPackages) {
    progress('build   turbo build @clerk/expo, @clerk/expo-biometrics, @clerk/expo-google-signin');
    await site.must(
      'turbo build',
      'pnpm',
      [
        'turbo',
        'build',
        '--filter=@clerk/expo...',
        '--filter=@clerk/expo-biometrics...',
        '--filter=@clerk/expo-google-signin...',
      ],
      site.worktree,
    );
  }
  const cache = product === 'standalone' ? (build.nativeCache ?? null) : null;
  const kept = cache === null ? null : await locateNativeBuild(cache, platform, site, progress);
  if (kept !== null && existsSync(kept.app)) {
    const into = artifact(platform, product, site.fixture);
    progress(`build   native ${kept.id}  an app built from these native inputs is kept, so no native build runs`);
    const java = platform === 'android' ? resolveJavaHome() : null;
    if (java !== null && !java.ok) throw new VerifyFailure('NOT_READY', java.detail, java.fix);
    const embedded = await embedJavaScript({
      platform,
      fixture: site.fixture,
      from: kept.app,
      into,
      iosExecutable: IOS_PRODUCT,
      android: java === null ? null : { sdk: sdkRoot(), javaHome: java.home },
      must: site.must,
    });
    if (embedded.ok) {
      progress(`build   bundle ${embedded.bundle}  exported from this checkout and embedded in that app`);
      return into;
    }
    progress(`build   native ${kept.id}  not reused: ${embedded.why}`);
  }
  const wanted = `${product} ${build.nativeKey}`;
  if (nativeProjectIsCurrent(site, platform, wanted)) {
    progress(`build   the ${platform} project was generated from these native inputs, so expo prebuild is skipped`);
  } else {
    await generateNativeProject(site, build, wanted, kept === null ? 'install' : 'installed');
  }
  if (platform === 'ios') {
    progress(`build   xcodebuild ${recipe.configuration} (${recipe.label})`);
    await site.must(
      'xcodebuild',
      'xcodebuild',
      [
        'build',
        '-quiet',
        '-workspace',
        `ios/${IOS_PRODUCT}.xcworkspace`,
        '-scheme',
        IOS_PRODUCT,
        '-configuration',
        recipe.configuration,
        '-sdk',
        'iphonesimulator',
        '-derivedDataPath',
        join(site.fixture, 'ios', 'build'),
        'CODE_SIGN_IDENTITY=-',
      ],
      site.fixture,
    );
  } else {
    const java = resolveJavaHome();
    if (!java.ok) throw new VerifyFailure('NOT_READY', java.detail, java.fix);
    progress(`build   gradlew ${recipe.gradle.at(-1)} (${recipe.label})`);
    await site.must(
      `gradlew ${recipe.gradle.at(-1)}`,
      './gradlew',
      [...recipe.gradle, '-q'],
      join(site.fixture, 'android'),
      {
        JAVA_HOME: java.home,
        ANDROID_HOME: sdkRoot(),
      },
    );
  }
  const built = artifact(platform, product, site.fixture);
  if (kept !== null) {
    keepNativeBuild(kept, built);
    progress(`build   native ${kept.id}  kept in ${relative(site.worktree, kept.dir)} for later builds`);
  }
  return built;
}

async function committedNativeKey(platform: Platform): Promise<string> {
  const listed = await run('git', ['ls-tree', '-r', 'HEAD', '--', ...nativeInputs(platform)], { cwd: WORKTREE });
  if (listed.code !== 0) throw new VerifyFailure('NOT_READY', `git ls-tree failed: ${listed.stderr.trim()}`, 'retry');
  return createHash('sha256').update(listed.stdout).digest('hex').slice(0, 12);
}

async function printKeptNativeBuild(platform: Platform): Promise<void> {
  const cache = nativeCacheDir();
  if (cache === null) throw new VerifyFailure('USAGE', 'VERIFY_NATIVE_CACHE is not set', 'set it to a directory');
  const kept = await locateNativeBuild(cache, platform, THIS_CHECKOUT, line => console.error(line));
  console.log(`id=${kept.id}`);
  console.log(`dir=${relative(WORKTREE, kept.dir)}`);
  console.log(`app=${basename(kept.app)}`);
}

if (import.meta.main) {
  const [first, second] = process.argv.slice(2);
  const platform = first === 'native' ? second : first;
  if (platform !== 'ios' && platform !== 'android') {
    console.error('usage: fixture.ts [native] ios|android');
    process.exit(2);
  }
  if (first === 'native') {
    try {
      await printKeptNativeBuild(platform);
      process.exit(0);
    } catch (error) {
      console.error((error as Error).message);
      process.exit(1);
    }
  }
  try {
    console.log('build   pnpm install --frozen-lockfile');
    await mustStep('pnpm install', 'pnpm', ['install', '--frozen-lockfile'], WORKTREE);
    const built = await buildFixture({
      platform,
      product: 'standalone',
      nativeKey: await committedNativeKey(platform),
      buildPackages: true,
      progress: line => console.log(line),
    });
    console.log(`build   ${built}`);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
