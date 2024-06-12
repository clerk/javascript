export { addClerkPrefix, getScriptUrl, getClerkJsMajorVersionOrTag } from '@clerk/shared/url';
export { callWithRetry } from '@clerk/shared/callWithRetry';
export {
  isDevelopmentFromSecretKey,
  isProductionFromSecretKey,
  parsePublishableKey,
  getCookieSuffix,
  getSuffixedCookieName,
} from '@clerk/shared/keys';
export { deprecated, deprecatedProperty } from '@clerk/shared/deprecated';

import { buildErrorThrower } from '@clerk/shared/error';
// TODO: replace packageName with `${PACKAGE_NAME}@${PACKAGE_VERSION}` from tsup.config.ts
export const errorThrower = buildErrorThrower({ packageName: '@clerk/backend' });

import { createDevOrStagingUrlCache } from '@clerk/shared/keys';
export const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
