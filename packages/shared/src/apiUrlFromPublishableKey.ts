import {
  LEGACY_DEV_INSTANCE_SUFFIXES,
  LOCAL_API_URL,
  LOCAL_ENV_SUFFIXES,
  PROD_API_URL,
  STAGING_API_URL,
  STAGING_ENV_SUFFIXES,
} from './constants';
import { parsePublishableKey } from './keys';

// The return type is annotated explicitly so the declaration emit stays
// deterministic. An inferred union's member order comes from TypeScript's
// global type-id assignment, which shifts as unrelated code changes and made
// break-check report phantom diffs for this export. These literals mirror the
// *_API_URL constants returned below; tsc errors here if a value ever drifts.
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
