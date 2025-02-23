export { addClerkPrefix, getScriptUrl, getClerkJsMajorVersionOrTag } from '@clerk/shared/url';
export { retry } from '@clerk/shared/retry';
export {
  isDevelopmentFromSecretKey,
  isProductionFromSecretKey,
  parsePublishableKey,
  getCookieSuffix,
  getSuffixedCookieName,
} from '@clerk/shared/keys';
export { deprecated, deprecatedProperty } from '@clerk/shared/deprecated';

import { buildErrorThrower } from '@clerk/shared/error';
import { createDevOrStagingUrlCache } from '@clerk/shared/keys';
// TODO: replace packageName with `${PACKAGE_NAME}@${PACKAGE_VERSION}` from tsup.config.ts
export const errorThrower = buildErrorThrower({ packageName: '@clerk/backend' });

export const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
