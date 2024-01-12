/* eslint-disable turbo/no-undeclared-env-vars */
import { Clerk } from '@clerk/backend';

import { API_KEY, API_URL, API_VERSION, DOMAIN, IS_SATELLITE, PROXY_URL, SECRET_KEY } from './constants';

const clerkClient = Clerk({
  apiKey: API_KEY,
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  proxyUrl: PROXY_URL,
  domain: DOMAIN,
  isSatellite: IS_SATELLITE,
});

const createClerkClient = Clerk;

export { clerkClient, createClerkClient, Clerk };

export * from '@clerk/backend';

/**
 * @deprecated Don't export the constants. Should be marked as internal
 */
export * from './constants';
