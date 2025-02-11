import { createClerkClient } from '@clerk/backend';
import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';

const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
const API_URL = process.env.CLERK_API_URL || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
const JWT_KEY = process.env.CLERK_JWT_KEY || '';
const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: process.env.NODE_ENV,
};

export const clerkClient = createClerkClient({
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  jwtKey: JWT_KEY,
  userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  sdkMetadata: SDK_METADATA,
});
