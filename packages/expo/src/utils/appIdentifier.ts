import { Platform } from 'react-native';

import { isExpoGo } from './runtime';

export function getExpoAppIdentifier(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const constantsModule = require('expo-constants') as {
      default?: {
        expoConfig?: {
          ios?: { bundleIdentifier?: string };
          android?: { package?: string };
        };
      };
    };
    if (isExpoGo()) {
      return undefined;
    }

    const expoConfig = constantsModule.default?.expoConfig;
    return Platform.OS === 'ios' ? expoConfig?.ios?.bundleIdentifier : expoConfig?.android?.package;
  } catch {
    return undefined;
  }
}
