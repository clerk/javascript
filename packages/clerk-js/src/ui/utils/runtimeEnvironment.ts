import { isDevelopmentEnvironment } from '@clerk/shared';
import type { LoadedClerk } from '@clerk/types';

export const logErrorInDevMode = (message: string, clerk: LoadedClerk) => {
  if (isDevelopmentSDK(clerk)) {
    console.error(`Clerk: ${message}`);
  }
};

export const isDevelopmentSDK = (clerk: LoadedClerk) =>
  isDevelopmentEnvironment() || clerk.sdkMetadata?.environment === 'development';
