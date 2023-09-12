/*
 * This module will contain functionality that will be copied
 * from @clerk/shared and will be replaced by imports when the
 * bundling issue is fixed.
 */
export { isDevelopmentFromApiKey, isProductionFromApiKey, isStaging } from './instance';

export { addClerkPrefix, getScriptUrl, getClerkJsMajorVersionOrTag } from './url';
export { callWithRetry } from './callWithRetry';

// TODO: replace it with @clerk/shared errorThrower.throwMissingPublishableKeyError()
export const missingPublishableKeyErrorMessage = `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`;

export { isDevOrStagingUrl } from './isDevOrStagingUrl';
export { buildPublishableKey, isPublishableKey, parsePublishableKey } from './parsePublishableKey';
