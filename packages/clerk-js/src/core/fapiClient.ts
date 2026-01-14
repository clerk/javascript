import { isBrowserOnline } from '@clerk/shared/browser';
import { buildEmailAddress as buildEmailAddressUtil } from '@clerk/shared/internal/clerk-js/email';
import { stringifyQueryParams } from '@clerk/shared/internal/clerk-js/querystring';
import { retry } from '@clerk/shared/retry';
import type { ClerkAPIErrorJSON, ClientJSON, InstanceType } from '@clerk/shared/types';
import { camelToSnake } from '@clerk/shared/underscore';

import { debugLogger } from '@/utils/debug';

import { buildURL as buildUrlUtil, filterUndefinedValues } from '../utils';
import { SUPPORTED_FAPI_VERSION } from './constants';
import { clerkNetworkError } from './errors';

export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';

export type FapiRequestInit = RequestInit & {
  path?: string;
  search?: ConstructorParameters<typeof URLSearchParams>[0];
  sessionId?: string;
  rotatingTokenNonce?: string;
  protectId?: string;
  pathPrefix?: string;
  url?: URL;
};

type FapiQueryStringParameters = {
  _method?: string;
  _clerk_session_id?: string;
  _clerk_js_version?: string;
  rotating_token_nonce?: string;
  _clerk_protect_id?: string;
};

type FapiRequestOptions = {
  fetchMaxTries?: number;
};

export type FapiResponse<T> = Response & {
  payload: FapiResponseJSON<T> | null;
};

export type FapiRequestCallback<T> = (request: FapiRequestInit, response?: FapiResponse<T>) => unknown;

// TODO: Move to @clerk/types
export interface FapiResponseJSON<T> {
  response: T;
  client?: ClientJSON;
  errors?: ClerkAPIErrorJSON[];
  meta?: {
    client?: ClientJSON;
    session_id?: string;
  };
}

export interface FapiClient {
  buildUrl(requestInit: FapiRequestInit): URL;

  buildEmailAddress(localPart: string): string;

  onAfterResponse(callback: FapiRequestCallback<unknown>): void;

  onBeforeRequest(callback: FapiRequestCallback<unknown>): void;

  request<T>(requestInit: FapiRequestInit, options?: FapiRequestOptions): Promise<FapiResponse<T>>;
}

// List of paths that should not receive the session ID parameter in the URL
const unauthorizedPathPrefixes = ['/client', '/waitlist'];

type FapiClientOptions = {
  frontendApi: string;
  domain?: string;
  proxyUrl?: string;
  instanceType: InstanceType;
  getSessionId: () => string | undefined;
  getProtectId: () => string | undefined;
  isSatellite?: boolean;
};

export function createFapiClient(options: FapiClientOptions): FapiClient {
  const onBeforeRequestCallbacks: Array<FapiRequestCallback<unknown>> = [];
  const onAfterResponseCallbacks: Array<FapiRequestCallback<unknown>> = [];

  function onBeforeRequest(callback: FapiRequestCallback<unknown>) {
    onBeforeRequestCallbacks.push(callback);
  }

  function onAfterResponse(callback: FapiRequestCallback<unknown>) {
    onAfterResponseCallbacks.push(callback);
  }

  async function runBeforeRequestCallbacks(requestInit: FapiRequestInit) {
    const windowCallback = typeof window !== 'undefined' && (window as any).__internal_onBeforeRequest;
    for await (const callback of [windowCallback, ...onBeforeRequestCallbacks].filter(s => s)) {
      if ((await callback(requestInit)) === false) {
        return false;
      }
    }
    return true;
  }

  async function runAfterResponseCallbacks(requestInit: FapiRequestInit, response: FapiResponse<unknown>) {
    const windowCallback = typeof window !== 'undefined' && (window as any).__internal_onAfterResponse;
    for await (const callback of [windowCallback, ...onAfterResponseCallbacks].filter(s => s)) {
      if ((await callback(requestInit, response)) === false) {
        return false;
      }
    }
    return true;
  }

  // TODO @userland-errors:
  function buildQueryString({
    method,
    path,
    sessionId,
    search,
    rotatingTokenNonce,
    protectId,
  }: FapiRequestInit): string {
    const searchParams = new URLSearchParams(search as any);
    // the above will parse {key: ['val1','val2']} as key: 'val1,val2' and we need to recreate the array bellow

    // Append supported FAPI version to the query string
    searchParams.append('__clerk_api_version', SUPPORTED_FAPI_VERSION);

    searchParams.append('_clerk_js_version', __PKG_VERSION__);

    if (rotatingTokenNonce) {
      searchParams.append('rotating_token_nonce', rotatingTokenNonce);
    }

    if (options.domain && options.instanceType === 'development' && options.isSatellite) {
      searchParams.append('__domain', options.domain);
    }

    // Due to a known Safari bug regarding CORS requests, we are forced to always use GET or POST method.
    // The original HTTP method is used as a query string parameter instead of as an actual method to
    // avoid triggering a CORS OPTION request as it currently breaks cookie dropping in Safari.
    if (!!method && method !== 'GET' && method !== 'POST') {
      searchParams.append('_method', method);
    }

    if (path && !unauthorizedPathPrefixes.some(p => path.startsWith(p)) && sessionId) {
      searchParams.append('_clerk_session_id', sessionId);
    }

    if (protectId) {
      searchParams.append('_clerk_protect_id', protectId);
    }

    // TODO: extract to generic helper
    const objParams = [...searchParams.entries()].reduce(
      (acc, [k, v]) => {
        acc[k] = v.includes(',') ? v.split(',') : v;
        return acc;
      },
      {} as FapiQueryStringParameters & Record<string, string | string[]>,
    );

    return stringifyQueryParams(objParams);
  }

  function buildUrl(requestInit: FapiRequestInit): URL {
    const { path, pathPrefix = 'v1' } = requestInit;

    if (options.proxyUrl) {
      // TODO @userland-errors:
      const proxyBase = new URL(options.proxyUrl);
      let proxyPath = proxyBase.pathname.slice(1);
      if (proxyPath.endsWith('/')) {
        proxyPath = proxyPath.slice(0, -1);
      }
      return buildUrlUtil(
        {
          base: proxyBase.origin,
          pathname: `${proxyPath}/${pathPrefix}${path}`,
          search: buildQueryString(requestInit),
        },
        { stringify: false },
      );
    }

    // We only use the domain option in production, in development it should always match the frontendApi
    const domainOnlyInProd = options.instanceType === 'production' ? options.domain : '';

    const baseUrl = `https://${domainOnlyInProd || options.frontendApi}`;

    return buildUrlUtil(
      {
        base: baseUrl,
        pathname: `${pathPrefix}${path}`,
        search: buildQueryString(requestInit),
      },
      { stringify: false },
    );
  }

  function buildEmailAddress(localPart: string): string {
    return buildEmailAddressUtil({
      localPart,
      frontendApi: options.frontendApi,
    });
  }

  // TODO @userland-errors:
  async function request<T>(
    _requestInit: FapiRequestInit,
    requestOptions?: FapiRequestOptions,
  ): Promise<FapiResponse<T>> {
    const requestInit = { ..._requestInit };
    const { method = 'GET', body } = requestInit;

    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      requestInit.body = filterUndefinedValues(body);
    }

    requestInit.url = buildUrl({
      ...requestInit,
      // TODO: Pass these values to the FAPI client instead of calculating them on the spot
      sessionId: options.getSessionId(),
      protectId: options.getProtectId(),
    });

    // Normalize requestInit.headers
    requestInit.headers = new Headers(requestInit.headers);

    // Set the default content type for non-GET requests.
    // Skip for FormData, because the browser knows how to construct it later on.
    // Skip if the content-type header has already been set, somebody intends to override it.
    if (method !== 'GET' && !(body instanceof FormData) && !requestInit.headers.has('content-type')) {
      requestInit.headers.set('content-type', 'application/x-www-form-urlencoded');
    }

    // Massage the body depending on the content type if needed.
    // Currently, this is needed only for form-urlencoded, so that the values reach the server in the form
    // foo=bar&baz=bar&whatever=1
    if (requestInit.headers.get('content-type') === 'application/x-www-form-urlencoded') {
      // The native BodyInit type is too wide for our use case,
      // so we're casting it to a more specific type here.
      // This is covered by the test suite.
      requestInit.body = body
        ? stringifyQueryParams(body as any as Record<string, string>, { keyEncoder: camelToSnake })
        : body;
    }

    // TODO @userland-errors:
    const beforeRequestCallbacksResult = await runBeforeRequestCallbacks(requestInit);
    // Due to a known Safari bug regarding CORS requests, we are forced to always use GET or POST method.
    // The original HTTP method is used as a query string parameter instead of as an actual method to
    // avoid triggering a CORS OPTION request as it currently breaks cookie dropping in Safari.
    const overwrittenRequestMethod = method === 'GET' ? 'GET' : 'POST';
    let response: Response;
    const url = requestInit.url;
    const fetchOpts: FapiRequestInit = {
      ...requestInit,
      method: overwrittenRequestMethod,
      credentials: requestInit.credentials || 'include',
    };

    try {
      if (beforeRequestCallbacksResult) {
        const maxTries = requestOptions?.fetchMaxTries ?? (isBrowserOnline() ? 4 : 11);
        // TODO @userland-errors:
        response = await retry(() => fetch(url, fetchOpts), {
          // This retry handles only network errors, not 4xx or 5xx responses,
          // so we want to try once immediately to handle simple network blips.
          // Since fapiClient is responsible for the network layer only,
          // callers need to use their own retry logic where needed.
          retryImmediately: true,
          // And then exponentially back off with a max delay of 5 seconds.
          initialDelay: 700,
          maxDelayBetweenRetries: 5000,
          shouldRetry: (_: unknown, iterations: number) => {
            // We want to retry only GET requests, as other methods are not idempotent.
            return overwrittenRequestMethod === 'GET' && iterations < maxTries;
          },
          onBeforeRetry: (iteration: number): void => {
            // Add the retry attempt to the query string params.
            // We use params to keep the request simple for CORS.
            url.searchParams.set('_clerk_retry_attempt', iteration.toString());
          },
        });
      } else {
        response = new Response('{}', requestInit); // Mock an empty json response
      }
    } catch (e) {
      const urlStr = url.toString();
      debugLogger.error('network error', { error: e, url: urlStr, method }, 'fapiClient');
      clerkNetworkError(urlStr, e);
    }

    // 204 No Content responses do not have a body so we should not try to parse it
    const json: FapiResponseJSON<T> | null = response.status !== 204 ? await response.json() : null;
    const fapiResponse: FapiResponse<T> = Object.assign(response, { payload: json });
    if (!response.ok) {
      debugLogger.error('request failed', { method, path: requestInit.path, status: response.status }, 'fapiClient');
    }
    // TODO @userland-errors:
    await runAfterResponseCallbacks(requestInit, fapiResponse);
    return fapiResponse;
  }

  return {
    buildEmailAddress,
    buildUrl,
    onAfterResponse,
    onBeforeRequest,
    request,
  };
}
