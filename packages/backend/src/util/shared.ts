export {
  addClerkPrefix,
  callWithRetry,
  getClerkJsMajorVersionOrTag,
  getScriptUrl,
  isDevelopmentFromApiKey,
  isProductionFromApiKey,
  parsePublishableKey,
  deprecated,
} from '@clerk/shared';

import { buildErrorThrower } from '@clerk/shared';
// TODO: replace packageName with `${PACKAGE_NAME}@${PACKAGE_VERSION}` from tsup.config.ts
export const errorThrower = buildErrorThrower({ packageName: '@clerk/backend' });

import { createDevOrStagingUrlCache } from '@clerk/shared';
export const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
