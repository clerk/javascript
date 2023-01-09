import {
  ClerkAPIResponseError,
  ClerkBackendAPI,
  CreateClerkClient,
  extractClerkApiFromInstance,
} from '@clerk/backend-core';

import { LIB_NAME, LIB_VERSION } from '../info';

const defaultParams = {
  libName: LIB_NAME,
  libVersion: LIB_VERSION,
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
        headers: {
          ...(headerParams as Record<string, string>),
          'X-Clerk-SDK': `vercel-edge/${LIB_VERSION}`,
        },
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
} as ConstructorParameters<typeof ClerkBackendAPI>[0];

export const ClerkAPI = new ClerkBackendAPI(defaultParams);

export const createClerkClient: CreateClerkClient = params => {
  const { apiKey, ...rest } = params || {};
  const instance = new ClerkBackendAPI({
    apiKey: apiKey || process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY,
    ...defaultParams,
    ...rest,
  });
  return extractClerkApiFromInstance(instance);
};
