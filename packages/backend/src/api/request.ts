import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError, ClerkAPIErrorJSON } from '@clerk/types';
import deepmerge from 'deepmerge';
import snakecaseKeys from 'snakecase-keys';

import { API_URL, API_VERSION, constants, USER_AGENT } from '../constants';
// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../runtime';
import { assertValidSecretKey } from '../util/assertValidSecretKey';
import { joinPaths } from '../util/path';
import { deprecated } from '../util/shared';
import type { CreateBackendApiOptions } from './factory';
import { deserialize } from './resources/Deserializer';

export type ClerkBackendApiRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  queryParams?: Record<string, unknown>;
  headerParams?: Record<string, string>;
  bodyParams?: object;
  formData?: FormData;
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
      clerkTraceId?: string;
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
  (cb: (...args: any) => Promise<ClerkBackendApiResponse<any>>): LegacyRequestFunction =>
  async (...args) => {
    const response = await cb(...args);
    if (response.errors === null) {
      return response.data;
    } else {
      const { errors, clerkTraceId } = response;
      // TODO: To be removed with withLegacyReturn
      const { status, statusText } = response as any;
      const error = new ClerkAPIResponseError(statusText || '', {
        data: [],
        status: status || '',
        clerkTraceId,
      });
      error.errors = errors;
      throw error;
    }
  };

export function buildRequest(options: CreateBackendApiOptions) {
  const request = async <T>(requestOptions: ClerkBackendApiRequestOptions): Promise<ClerkBackendApiResponse<T>> => {
    const {
      apiKey,
      secretKey,
      httpOptions,
      apiUrl = API_URL,
      apiVersion = API_VERSION,
      userAgent = USER_AGENT,
    } = options;
    if (apiKey) {
      deprecated('apiKey', 'Use `secretKey` instead.');
    }
    if (httpOptions) {
      deprecated(
        'httpOptions',
        'This option has been deprecated and will be removed with the next major release.\nA RequestInit init object used by the `request` method.',
      );
    }

    const { path, method, queryParams, headerParams, bodyParams, formData } = requestOptions;
    const key = secretKey || apiKey;

    assertValidSecretKey(key);

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
    const headers: Record<string, any> = {
      Authorization: `Bearer ${key}`,
      'Clerk-Backend-SDK': userAgent,
      ...headerParams,
    };

    let res: Response | undefined = undefined;
    try {
      if (formData) {
        res = await runtime.fetch(finalUrl.href, {
          ...httpOptions,
          method,
          headers,
          body: formData,
        });
      } else {
        // Enforce application/json for all non form-data requests
        headers['Content-Type'] = 'application/json';
        // Build body
        const hasBody = method !== 'GET' && bodyParams && Object.keys(bodyParams).length > 0;
        const body = hasBody ? { body: JSON.stringify(snakecaseKeys(bodyParams, { deep: false })) } : null;

        res = await runtime.fetch(
          finalUrl.href,
          deepmerge(httpOptions || {}, {
            method,
            headers,
            ...body,
          }),
        );
      }

      // TODO: Parse JSON or Text response based on a response header
      const isJSONResponse =
        res?.headers && res.headers?.get(constants.Headers.ContentType) === constants.ContentTypes.Json;
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
          clerkTraceId: getTraceId(err, res?.headers),
        };
      }

      return {
        data: null,
        errors: parseErrors(err),
        // TODO: To be removed with withLegacyReturn
        // @ts-expect-error
        status: res?.status,
        statusText: res?.statusText,
        clerkTraceId: getTraceId(err, res?.headers),
      };
    }
  };

  return withLegacyReturn(request);
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

function parseErrors(data: unknown): ClerkAPIError[] {
  if (!!data && typeof data === 'object' && 'errors' in data) {
    const errors = data.errors as ClerkAPIErrorJSON[];
    return errors.length > 0 ? errors.map(parseError) : [];
  }
  return [];
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
