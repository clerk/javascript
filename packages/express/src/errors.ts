// https://github.com/clerk/javascript/blob/main/packages/remix/src/errors.ts#L1-L0
const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}
  
  For more info, check out the docs: https://clerk.com/docs,
  or come say hi in our discord server: https://clerk.com/discord
  `;
};

export const middlewareRequired =
  createErrorMessage(`The "clerkMiddleware" should be registered before using the "getAuth".
Example:

import express from 'express';
import { clerkMiddleware } from '@clerk/express';

const app = express();
app.use(clerkMiddleware);
`);

export const satelliteAndMissingProxyUrlAndDomain =
  'Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl';
export const satelliteAndMissingSignInUrl = `
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL.`;
