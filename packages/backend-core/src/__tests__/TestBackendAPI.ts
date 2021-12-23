import fetch from 'node-fetch';

import { ClerkBackendAPI } from '../api/ClerkBackendAPI';

const defaultApiKey = process.env.CLERK_API_KEY || '';
const defaultApiVersion = process.env.CLERK_API_VERSION || 'v1';
const defaultServerApiUrl =
  process.env.CLERK_API_URL || 'https://api.clerk.dev';

export const TestBackendAPIClient = new ClerkBackendAPI({
  apiKey: defaultApiKey,
  apiVersion: defaultApiVersion,
  serverApiUrl: defaultServerApiUrl,
  libName: 'test',
  libVersion: '0.0.1',
  packageRepo: 'test',
  fetcher: async (
    url,
    { method, authorization, contentType, userAgent, body }
  ) => {
    return (
      await fetch(url, {
        method,
        headers: {
          Authorization: authorization,
          'Content-Type': contentType,
          'User-Agent': userAgent,
        },
        ...(body && { body: JSON.stringify(body) }),
      })
    ).json();
  },
});
