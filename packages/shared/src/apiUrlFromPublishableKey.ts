import {
  LEGACY_DEV_INSTANCE_SUFFIXES,
  LOCAL_API_URL,
  LOCAL_ENV_SUFFIXES,
  PROD_API_URL,
  STAGING_API_URL,
  STAGING_ENV_SUFFIXES,
} from './constants';
import { parsePublishableKey } from './keys';

// Explicit return type per the repo TypeScript guideline for public APIs,
// written as literals because `typeof CONST` would pull a hashed `_chunks/*`
// import into the published d.ts. The literals mirror the *_API_URL constants
// returned below (tsc errors here if a value drifts), and the pinned order
// keeps the declaration emit deterministic where inference is not.
/**
 * Get the correct API url based on the publishable key.
 *
 * @param publishableKey - The publishable key to parse.
 * @returns One of Clerk's API URLs.
 */
export const apiUrlFromPublishableKey = (
  publishableKey: string,
): 'https://api.lclclerk.com' | 'https://api.clerkstage.dev' | 'https://api.clerk.com' => {
  const frontendApi = parsePublishableKey(publishableKey)?.frontendApi;

  if (frontendApi?.startsWith('clerk.') && LEGACY_DEV_INSTANCE_SUFFIXES.some(suffix => frontendApi?.endsWith(suffix))) {
    return PROD_API_URL;
  }

  if (LOCAL_ENV_SUFFIXES.some(suffix => frontendApi?.endsWith(suffix))) {
    return LOCAL_API_URL;
  }
  if (STAGING_ENV_SUFFIXES.some(suffix => frontendApi?.endsWith(suffix))) {
    return STAGING_API_URL;
  }
  return PROD_API_URL;
};
