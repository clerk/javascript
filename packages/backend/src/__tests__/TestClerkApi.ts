import fetch from 'node-fetch';

import { ClerkBackendAPI } from '../api/ClerkBackendApi';
import { ClerkAPIResponseError } from '../api/errors';

const defaultAPIKey = process.env.CLERK_API_KEY || '';
const defaultAPIVersion = process.env.CLERK_API_VERSION || 'v1';

export const defaultServerAPIUrl = process.env.CLERK_API_URL || 'https://api.clerk.dev';

export const TestClerkAPI = new ClerkBackendAPI({
  apiKey: defaultAPIKey,
  apiVersion: defaultAPIVersion,
  apiUrl: defaultServerAPIUrl,
  libName: 'test',
  libVersion: '0.0.1',
  apiClient: {
    async request({ url, method, queryParams, headerParams, bodyParams }) {
      // Build final URL with search parameters
      const finalUrl = new URL(url || '');

      if (queryParams) {
        for (const [key, val] of Object.entries(queryParams as Record<string, string | string[]>)) {
          // Support array values for queryParams such as { foo: [42, 43] }
          if (val) {
            [val].flat().forEach(v => finalUrl.searchParams.append(key, v));
          }
        }
      }

      const response = await fetch(finalUrl.href, {
        method,
        headers: headerParams as Record<string, string>,
        ...(bodyParams && Object.keys(bodyParams).length > 0 && { body: JSON.stringify(bodyParams) }),
      });

      // Parse JSON or Text response.
      const isJSONResponse = headerParams && headerParams['Content-Type'] === 'application/json';
      const data = await (isJSONResponse ? response.json() : response.text());

      // Check for errors
      if (!response.ok) {
        throw new ClerkAPIResponseError(response.statusText, {
          data: data?.errors || data,
          status: response.status,
        });
      }

      return data;
    },
  },
});
