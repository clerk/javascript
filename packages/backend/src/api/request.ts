import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';
import deepmerge from 'deepmerge';
import snakecaseKeys from 'snakecase-keys';

import { API_URL, API_VERSION, USER_AGENT } from '../constants';
// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../runtime';
import { joinPaths } from '../util/path';
import type { CreateBackendApiOptions } from './factory';
import { deserialize } from './resources/Deserializer';

export type ClerkBackendApiRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  queryParams?: Record<string, unknown>;
  headerParams?: Record<string, string>;
  bodyParams?: object;
} & (
  | {
      url: string;
      path?: string;
    }
  | {
      url?: string;
      path: string;
    }
);

export type ClerkBackendApiResponse<T> =
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: ClerkAPIError[];
    };

export type RequestFunction = ReturnType<typeof buildRequest>;

export function buildRequest(mutableOptions: CreateBackendApiOptions) {
  async function request<T>(requestOptions: ClerkBackendApiRequestOptions): Promise<ClerkBackendApiResponse<T>> {
    const {
      apiKey,
      apiUrl = API_URL,
      apiVersion = API_VERSION,
      userAgent = USER_AGENT,
      httpOptions = {},
    } = mutableOptions;
    const { path, method, queryParams, headerParams, bodyParams } = requestOptions;

    if (!apiKey) {
      throw Error(
        'Missing Clerk API Key. Go to https://dashboard.clerk.dev and get your Clerk API Key for your instance.',
      );
    }

    const url = joinPaths(apiUrl, apiVersion, path);

    // Build final URL with search parameters
    const finalUrl = new URL(url);

    if (queryParams) {
      // Snakecase query parameters
      const snakecasedQueryParams = snakecaseKeys({ ...queryParams });

      // Support array values for queryParams such as { foo: [42, 43] }
      for (const [key, val] of Object.entries(snakecasedQueryParams)) {
        if (val) {
          [val].flat().forEach(v => finalUrl.searchParams.append(key, v as string));
        }
      }
    }

    // Build headers
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Clerk-Backend-SDK': userAgent,
      ...headerParams,
    };

    // Build body
    const hasBody = method !== 'GET' && bodyParams && Object.keys(bodyParams).length > 0;
    const body = hasBody ? { body: JSON.stringify(snakecaseKeys(bodyParams, { deep: false })) } : null;

    try {
      const res = await runtime.fetch(
        finalUrl.href,
        deepmerge(httpOptions, {
          method,
          headers,
          ...body,
        }),
      );

      // TODO: Parse JSON or Text response based on a response header
      const isJSONResponse = headers && headers['Content-Type'] === 'application/json';
      const data = await (isJSONResponse ? res.json() : res.text());

      if (!res.ok) {
        throw data;
      }

      return {
        data: deserialize(data) as T,
        errors: null,
      };
    } catch (err) {
      if (err instanceof Error) {
        return {
          data: null,
          errors: [
            {
              code: 'unexpected_error',
              message: err.message || 'Unexpected error',
            },
          ],
        };
      }

      return {
        data: null,
        errors: parseErrors(err as ClerkAPIErrorJSON[]),
      };
    }
  }

  return { mutableOptions, request };
}

function parseErrors(data: ClerkAPIErrorJSON[] = []): ClerkAPIError[] {
  return data.length > 0 ? data.map(parseError) : [];
}

function parseError(error: ClerkAPIErrorJSON): ClerkAPIError {
  return {
    code: error.code,
    message: error.message,
    longMessage: error.long_message,
    meta: {
      paramName: error?.meta?.param_name,
      sessionId: error?.meta?.session_id,
    },
  };
}
