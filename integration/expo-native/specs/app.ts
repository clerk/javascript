import type { TestApp } from './support/inputs.ts';
import type { AppEntry, Platform } from './support/types.ts';

export const APP_ID = 'com.clerk.exponativebuildfixture';

const ANDROID_ACTIVITY = '.MainActivity';
const DEV_CLIENT_SCHEME = 'exp+clerk-expo-native-build-fixture';

export function devClientEntry(platform: Platform, devServer: string): AppEntry {
  return platform === 'ios'
    ? {
        kind: 'dev-client',
        launchArguments: [
          '--initialUrl',
          devServer,
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
        openLink: `${DEV_CLIENT_SCHEME}://expo-development-client/?url=${encodeURIComponent(devServer)}`,
        androidActivity: ANDROID_ACTIVITY,
      };
}

export const app: TestApp = {
  platforms: ['ios', 'android'],
  id: (): string => APP_ID,
  entry: (platform: Platform, devServer: string | null): AppEntry =>
    devServer === null ? { kind: 'binary' } : devClientEntry(platform, devServer),
};
