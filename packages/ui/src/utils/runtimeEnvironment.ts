import type { LoadedClerk } from '@clerk/shared/types';
import { isDevelopmentEnvironment } from '@clerk/shared/utils';

export const isDevelopmentSDK = (clerk: LoadedClerk) =>
  isDevelopmentEnvironment() || clerk.sdkMetadata?.environment === 'development';
