import { Clerk } from '@clerk/clerk-sdk-node';

import { API_KEY, API_URL, API_VERSION, JWT_KEY, SECRET_KEY } from './constants';

export const clerkClient = Clerk({
  apiKey: API_KEY,
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  jwtKey: JWT_KEY,
});
