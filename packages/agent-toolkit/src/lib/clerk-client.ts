import { createClerkClient } from '@clerk/backend';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getEnvVariable } from '@clerk/shared/getEnvVariable';

const API_VERSION = getEnvVariable('CLERK_API_VERSION') || 'v1';
const SECRET_KEY = getEnvVariable('CLERK_SECRET_KEY') || '';
const PUBLISHABLE_KEY = getEnvVariable('CLERK_PUBLISHABLE_KEY') || '';
const API_URL = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
const JWT_KEY = getEnvVariable('CLERK_JWT_KEY') || '';
const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: getEnvVariable('NODE_ENV'),
};

export const clerkClient = createClerkClient({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  jwtKey: JWT_KEY,
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  sdkMetadata: SDK_METADATA,
});
