import { ClerkAPIResponseError, parseError } from '@clerk/shared/error';
import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';
import snakecaseKeys from 'snakecase-keys';

import { API_URL, API_VERSION, constants, SUPPORTED_BAPI_VERSION, USER_AGENT } from '../constants';
import { runtime } from '../runtime';
import { assertValidSecretKey } from '../util/optionsAssertions';
import { joinPaths } from '../util/path';
import { deserialize } from './resources/Deserializer';

type ClerkBackendApiRequestOptionsUrlOrPath =
  | {
      url: string;
      path?: string;
    }
  | {
      url?: string;
      path: string;
    };

type ClerkBackendApiRequestOptionsBodyParams =
  | {
      bodyParams: Record<string, unknown> | Array<Record<string, unknown>>;
      options?: {
        /**
         * If true, snakecases the keys of the bodyParams object recursively.
         * @default false
         */
        deepSnakecaseBodyParamKeys?: boolean;
      };
    }
  | {
      bodyParams?: never;
      options?: {
        deepSnakecaseBodyParamKeys?: never;
      };
    };

export type ClerkBackendApiRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  queryParams?: Record<string, unknown>;
  headerParams?: Record<string, string>;
  formData?: FormData;
} & ClerkBackendApiRequestOptionsUrlOrPath &
  ClerkBackendApiRequestOptionsBodyParams;

export type ClerkBackendApiResponse<T> =
  | {
      data: T;
      errors: null;
      totalCount?: number;
    }
  | {
      data: null;
      errors: ClerkAPIError[];
      totalCount?: never;
      clerkTraceId?: string;
      status?: number;
      statusText?: string;
      retryAfter?: number;
    };

export type RequestFunction = ReturnType<typeof buildRequest>;

type BuildRequestOptions = {
  /* Secret Key */
  secretKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
  /**
   * Allow requests without specifying a secret key. In most cases this should be set to `false`.
   * @default true
   */
  requireSecretKey?: boolean;
  /**
   * If true, omits the API version from the request URL path.
   * This is required for bapi-proxy endpoints, which do not use versioning in the URL.
   *
   * Note: API versioning for these endpoints is instead handled via the `Clerk-API-Version` HTTP header.
   *
   * @default false
   */
  skipApiVersionInUrl?: boolean;
};

export function buildRequest(options: BuildRequestOptions) {
  const requestFn = async <T>(requestOptions: ClerkBackendApiRequestOptions): Promise<ClerkBackendApiResponse<T>> => {
    const {
      secretKey,
      requireSecretKey = true,
      apiUrl = API_URL,
      apiVersion = API_VERSION,
      userAgent = USER_AGENT,
      skipApiVersionInUrl = false,
    } = options;
    const { path, method, queryParams, headerParams, bodyParams, formData, options: opts } = requestOptions;
    const { deepSnakecaseBodyParamKeys = false } = opts || {};

    if (requireSecretKey) {
      assertValidSecretKey(secretKey);
    }

    const url = skipApiVersionInUrl ? joinPaths(apiUrl, path) : joinPaths(apiUrl, apiVersion, path);

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
    const headers = new Headers({
      'Clerk-API-Version': SUPPORTED_BAPI_VERSION,
      'User-Agent': userAgent,
      ...headerParams,
    });

    if (secretKey) {
      headers.set('Authorization', `Bearer ${secretKey}`);
    }

    let res: Response | undefined;
    try {
      if (formData) {
        res = await runtime.fetch(finalUrl.href, {
          method,
          headers,
          body: formData,
        });
      } else {
        // Enforce application/json for all non form-data requests
        headers.set('Content-Type', 'application/json');

        const buildBody = () => {
          const hasBody = method !== 'GET' && bodyParams && Object.keys(bodyParams).length > 0;
          if (!hasBody) {
            return null;
          }

          const formatKeys = (object: Parameters<typeof snakecaseKeys>[0]) =>
            snakecaseKeys(object, { deep: deepSnakecaseBodyParamKeys });

          return {
            body: JSON.stringify(Array.isArray(bodyParams) ? bodyParams.map(formatKeys) : formatKeys(bodyParams)),
          };
        };

        res = await runtime.fetch(finalUrl.href, {
          method,
          headers,
          ...buildBody(),
        });
      }

      // TODO: Parse JSON or Text response based on a response header
      const isJSONResponse =
        res?.headers && res.headers?.get(constants.Headers.ContentType) === constants.ContentTypes.Json;
      const responseBody = await (isJSONResponse ? res.json() : res.text());

      if (!res.ok) {
        return {
          data: null,
          errors: parseErrors(responseBody),
          status: res?.status,
          statusText: res?.statusText,
          clerkTraceId: getTraceId(responseBody, res?.headers),
          retryAfter: getRetryAfter(res?.headers),
        };
      }

      return {
        ...deserialize<T>(responseBody),
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
          clerkTraceId: getTraceId(err, res?.headers),
        };
      }

      return {
        data: null,
        errors: parseErrors(err),
        status: res?.status,
        statusText: res?.statusText,
        clerkTraceId: getTraceId(err, res?.headers),
        retryAfter: getRetryAfter(res?.headers),
      };
    }
  };

  return withLegacyRequestReturn(requestFn);
}

// Returns either clerk_trace_id if present in response json, otherwise defaults to CF-Ray header
// If the request failed before receiving a response, returns undefined
function getTraceId(data: unknown, headers?: Headers): string {
  if (data && typeof data === 'object' && 'clerk_trace_id' in data && typeof data.clerk_trace_id === 'string') {
    return data.clerk_trace_id;
  }

  const cfRay = headers?.get('cf-ray');
  return cfRay || '';
}

function getRetryAfter(headers?: Headers): number | undefined {
  const retryAfter = headers?.get('Retry-After');
  if (!retryAfter) return;

  const value = parseInt(retryAfter, 10);
  if (isNaN(value)) return;

  return value;
}

function parseErrors(data: unknown): ClerkAPIError[] {
  if (!!data && typeof data === 'object' && 'errors' in data) {
    const errors = data.errors as ClerkAPIErrorJSON[];
    return errors.length > 0 ? errors.map(parseError) : [];
  }
  return [];
}

type LegacyRequestFunction = <T>(requestOptions: ClerkBackendApiRequestOptions) => Promise<T>;

// TODO(dimkl): Will be probably be dropped in next major version
function withLegacyRequestReturn(cb: any): LegacyRequestFunction {
  return async (...args) => {
    const { data, errors, totalCount, status, statusText, clerkTraceId, retryAfter } = await cb(...args);
    if (errors) {
      // instead of passing `data: errors`, we have set the `error.errors` because
      // the errors returned from callback is already parsed and passing them as `data`
      // will not be able to assign them to the instance
      const error = new ClerkAPIResponseError(statusText || '', {
        data: [],
        status,
        clerkTraceId,
        retryAfter,
      });
      error.errors = errors;
      throw error;
    }

    if (typeof totalCount !== 'undefined') {
      return { data, totalCount };
    }

    return data;
  };
}
