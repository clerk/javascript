import { createClerkClient } from '@clerk/backend';

import { API_URL, API_VERSION, JWT_KEY, SDK_METADATA, SECRET_KEY } from './constants';

export { createClerkClient };

export const clerkClient = createClerkClient({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  jwtKey: JWT_KEY,
  sdkMetadata: SDK_METADATA,
});
