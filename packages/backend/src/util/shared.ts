export {
  addClerkPrefix,
  callWithRetry,
  getClerkJsMajorVersionOrTag,
  getScriptUrl,
  isDevelopmentFromApiKey,
  isProductionFromApiKey,
  parsePublishableKey,
} from '@clerk/shared';
export { deprecated, deprecatedProperty } from '@clerk/shared/deprecated';

import { buildErrorThrower } from '@clerk/shared/error';
// TODO: replace packageName with `${PACKAGE_NAME}@${PACKAGE_VERSION}` from tsup.config.ts
export const errorThrower = buildErrorThrower({ packageName: '@clerk/backend' });

import { createDevOrStagingUrlCache } from '@clerk/shared';
export const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
