import { Clerk } from '@clerk/backend';

import { API_URL, API_VERSION, JWT_KEY, SECRET_KEY } from './constants';

export const createClerkClient = Clerk;

export const clerkClient = createClerkClient({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  jwtKey: JWT_KEY,
  // @ts-ignore - defined by tsup config
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
});
