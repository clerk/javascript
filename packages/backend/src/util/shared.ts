export { deprecated, deprecatedProperty } from '@clerk/shared/deprecated';
export {
  getCookieSuffix,
  getSuffixedCookieName,
  isDevelopmentFromSecretKey,
  isProductionFromSecretKey,
  parsePublishableKey,
} from '@clerk/shared/keys';
export { retry } from '@clerk/shared/retry';
export { addClerkPrefix, getClerkJsMajorVersionOrTag, getScriptUrl } from '@clerk/shared/url';

import { buildErrorThrower } from '@clerk/shared/error';
import { createDevOrStagingUrlCache } from '@clerk/shared/keys';
// TODO: replace packageName with `${PACKAGE_NAME}@${PACKAGE_VERSION}` from tsup.config.ts
export const errorThrower = buildErrorThrower({ packageName: '@clerk/backend' });

export const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
