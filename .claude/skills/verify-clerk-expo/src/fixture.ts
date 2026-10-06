import { spawn } from 'node:child_process';
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VerifyFailure, type Platform } from './core/types.ts';
import { resolveJavaHome, sdkRoot } from './platform/android/sdk.ts';

export const APP_ID = 'com.clerk.exponativebuildfixture';
export const IOS_PRODUCT = 'ClerkExpoNativeBuildFixture';
export const WORKTREE = fileURLToPath(new URL('../../../../', import.meta.url));
export const FIXTURE = join(WORKTREE, 'integration', 'templates', 'expo-native');

const EXPO_PACKAGES = [
  'expo-auth-session',
  'expo-constants',
  'expo-crypto',
  'expo-dev-client',
  'expo-secure-store',
  'expo-web-browser',
];

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

export function artifact(platform: Platform): string {
  return platform === 'ios'
    ? join(FIXTURE, 'ios', 'build', 'Build', 'Products', 'Debug-iphonesimulator', `${IOS_PRODUCT}.app`)
    : join(FIXTURE, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
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
  readonly buildPackages: boolean;
  readonly progress: (line: string) => void;
}

async function generateNativeProject(build: FixtureBuild): Promise<void> {
  const { platform, progress } = build;
  cpSync(join(FIXTURE, 'package.sdk-57.json'), join(FIXTURE, 'package.json'));
  await mustStep(
    'pnpm add the workspace packages',
    'pnpm',
    [
      'add',
      'link:../../../packages/expo',
      'link:../../../packages/expo-google-signin',
      'link:../../../packages/expo-biometrics',
    ],
    FIXTURE,
  );
  await mustStep('expo install', 'pnpm', ['expo', 'install', ...EXPO_PACKAGES], FIXTURE);
  progress(`build   expo prebuild --clean --platform ${platform}`);
  await mustStep('expo prebuild', 'pnpm', ['expo', 'prebuild', '--clean', '--platform', platform], FIXTURE);
}

export async function buildFixture(build: FixtureBuild): Promise<string> {
  const { platform, progress } = build;
  if (!existsSync(join(WORKTREE, 'node_modules'))) {
    throw new VerifyFailure('NOT_READY', 'the monorepo has no node_modules', `cd ${WORKTREE} && pnpm install`);
  }
  if (build.buildPackages) {
    progress('build   turbo build @clerk/expo, @clerk/expo-biometrics, @clerk/expo-google-signin');
    await mustStep(
      'turbo build',
      'pnpm',
      [
        'turbo',
        'build',
        '--filter=@clerk/expo...',
        '--filter=@clerk/expo-biometrics...',
        '--filter=@clerk/expo-google-signin...',
      ],
      WORKTREE,
    );
  }
  await generateNativeProject(build);
  if (platform === 'ios') {
    progress('build   xcodebuild Debug (dev client)');
    await mustStep(
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
        'Debug',
        '-sdk',
        'iphonesimulator',
        '-derivedDataPath',
        join(FIXTURE, 'ios', 'build'),
        'CODE_SIGN_IDENTITY=-',
      ],
      FIXTURE,
    );
  } else {
    const java = resolveJavaHome();
    if (!java.ok) throw new VerifyFailure('NOT_READY', java.detail, java.fix);
    progress('build   gradlew assembleDebug (dev client)');
    await mustStep('gradlew assembleDebug', './gradlew', ['assembleDebug', '-q'], join(FIXTURE, 'android'), {
      JAVA_HOME: java.home,
      ANDROID_HOME: sdkRoot(),
    });
  }
  return artifact(platform);
}
