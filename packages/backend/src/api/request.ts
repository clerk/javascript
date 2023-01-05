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
type LegacyRequestFunction = <T>(requestOptions: ClerkBackendApiRequestOptions) => Promise<T>;

/**
 * Switching to the { data, errors } format is a breaking change, so we will skip it for now
 * until we release v5 of the related SDKs.
 * This HOF wraps the request helper and transforms the new return to the legacy return.
 * TODO: Simply remove this wrapper and the ClerkAPIResponseError before the v5 release.
 */
const withLegacyReturn =
  (cb: any): LegacyRequestFunction =>
  async (...args) => {
    // @ts-ignore
    const { data, errors, status, statusText } = await cb<T>(...args);
    if (errors === null) {
      return data;
    } else {
      throw new ClerkAPIResponseError(statusText || '', {
        data: errors,
        status: status || '',
      });
    }
  };

export function buildRequest(options: CreateBackendApiOptions) {
  const request = async <T>(requestOptions: ClerkBackendApiRequestOptions): Promise<ClerkBackendApiResponse<T>> => {
    const { apiKey, apiUrl = API_URL, apiVersion = API_VERSION, userAgent = USER_AGENT, httpOptions = {} } = options;
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

    let res: Response | undefined = undefined;
    try {
      res = await runtime.fetch(
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
        data: deserialize(data),
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
        // TODO: To be removed with withLegacyReturn
        // @ts-expect-error
        status: res?.status,
        statusText: res?.statusText,
      };
    }
  };

  return withLegacyReturn(request);
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

class ClerkAPIResponseError extends Error {
  clerkError: true;

  status: number;
  message: string;

  errors: ClerkAPIError[];

  constructor(message: string, { data, status }: { data: ClerkAPIError[]; status: number }) {
    super(message);

    Object.setPrototypeOf(this, ClerkAPIResponseError.prototype);

    this.clerkError = true;
    this.message = message;
    this.status = status;
    this.errors = data;
  }
}
