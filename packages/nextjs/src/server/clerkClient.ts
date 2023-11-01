import { Clerk } from '@clerk/backend';

import { API_URL, API_VERSION, DOMAIN, IS_SATELLITE, PROXY_URL, SECRET_KEY } from './constants';

const clerkClient = Clerk({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  // TODO: Fetch version from package.json
  userAgent: '@clerk/nextjs',
  proxyUrl: PROXY_URL,
  domain: DOMAIN,
  isSatellite: IS_SATELLITE,
});

const createClerkClient = Clerk;

export { Clerk, clerkClient, createClerkClient };

export * from '@clerk/backend';

/**
 * @deprecated Don't export the constants. Should be marked as internal
 */
export * from './constants';
