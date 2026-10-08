import { spawn } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VerifyFailure, type Platform } from './core/types.ts';
import { resolveJavaHome, sdkRoot } from './platform/android/sdk.ts';

export const APP_ID = 'com.clerk.exponativebuildfixture';
export const IOS_PRODUCT = 'ClerkExpoNativeBuildFixture';
export const WORKTREE = fileURLToPath(new URL('../../../../', import.meta.url));
export const FIXTURE = join(WORKTREE, 'integration', 'templates', 'expo-native');

export type BuildProduct = 'dev-client';

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

export function nativeInputs(platform: Platform): readonly string[] {
  return [...PLATFORM_NATIVE_INPUTS[platform], ...SHARED_NATIVE_INPUTS];
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
  readonly progress: (line: string) => void;
}

export interface FixtureSite {
  readonly worktree: string;
  readonly fixture: string;
  readonly must: typeof mustStep;
}

const THIS_CHECKOUT: FixtureSite = { worktree: WORKTREE, fixture: FIXTURE, must: mustStep };

const nativeProjectMarker = (site: FixtureSite, platform: Platform) =>
  join(site.fixture, platform, '.verify-native-project');

export function nativeProjectIsCurrent(site: FixtureSite, platform: Platform, wanted: string): boolean {
  const marker = nativeProjectMarker(site, platform);
  return (
    existsSync(join(site.fixture, 'node_modules')) && existsSync(marker) && readFileSync(marker, 'utf8') === wanted
  );
}

async function generateNativeProject(site: FixtureSite, build: FixtureBuild, wanted: string): Promise<void> {
  const { platform, progress } = build;
  rmSync(nativeProjectMarker(site, platform), { force: true });
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
  await site.must('expo install', 'pnpm', ['expo', 'install', ...RECIPES[build.product].expoPackages], site.fixture);
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
  const wanted = `${product} ${build.nativeKey}`;
  if (nativeProjectIsCurrent(site, platform, wanted)) {
    progress(`build   the ${platform} project was generated from these native inputs, so expo prebuild is skipped`);
  } else {
    await generateNativeProject(site, build, wanted);
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
  return artifact(platform, product, site.fixture);
}
