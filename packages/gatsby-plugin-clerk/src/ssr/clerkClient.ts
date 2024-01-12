/* eslint-disable turbo/no-undeclared-env-vars */
import { Clerk } from '@clerk/backend';

import { API_KEY, API_URL, API_VERSION, SECRET_KEY } from '../constants';

const clerkClient = Clerk({
  apiKey: API_KEY,
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  // TODO: Fetch version from package.json
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
});

const createClerkClient = Clerk;

export { clerkClient, createClerkClient, Clerk };

export * from '@clerk/backend';
