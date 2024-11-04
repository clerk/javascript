import { isDevelopmentEnvironment } from '@clerk/shared/utils';
import type { LoadedClerk } from '@clerk/types';

export const isDevelopmentSDK = (clerk: LoadedClerk) =>
  isDevelopmentEnvironment() || clerk.sdkMetadata?.environment === 'development';
