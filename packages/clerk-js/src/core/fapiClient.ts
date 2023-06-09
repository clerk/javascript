import { camelToSnake, isBrowserOnline, runWithExponentialBackOff } from '@clerk/shared';
import type { Clerk, ClerkAPIErrorJSON, ClientJSON } from '@clerk/types';
import qs from 'qs';

import { buildEmailAddress as buildEmailAddressUtil, buildURL as buildUrlUtil } from '../utils';
import { clerkNetworkError } from './errors';

export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';

export type FapiRequestInit = RequestInit & {
  path?: string;
  search?: string | URLSearchParams | string[][] | Record<string, string> | undefined;
  sessionId?: string;
  rotatingTokenNonce?: string;
  pathPrefix?: string;
  url?: URL;
};

type FapiQueryStringParameters = {
  _method?: string;
  _clerk_session_id?: string;
  _clerk_js_version?: string;
  rotating_token_nonce?: string;
};

export type FapiResponse<T> = Response & {
  payload: FapiResponseJSON<T> | null;
};

export type FapiRequestCallback<T> = (
  request: FapiRequestInit,
  response?: FapiResponse<T>,
) => Promise<unknown | false> | unknown | false;

const camelToSnakeEncoder: qs.IStringifyOptions['encoder'] = (str, defaultEncoder, _, type) => {
  return type === 'key' ? camelToSnake(str) : defaultEncoder(str);
};

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

  request<T>(requestInit: FapiRequestInit): Promise<FapiResponse<T>>;
}

export default function createFapiClient(clerkInstance: Clerk): FapiClient {
  const onBeforeRequestCallbacks: Array<FapiRequestCallback<unknown>> = [];
  const onAfterResponseCallbacks: Array<FapiRequestCallback<unknown>> = [];

  function onBeforeRequest(callback: FapiRequestCallback<unknown>) {
    onBeforeRequestCallbacks.push(callback);
  }

  function onAfterResponse(callback: FapiRequestCallback<unknown>) {
    onAfterResponseCallbacks.push(callback);
  }

  async function runBeforeRequestCallbacks(requestInit: FapiRequestInit) {
    //@ts-expect-error
    const windowCallback = typeof window !== 'undefined' && (window as never).__unstable__onBeforeRequest;
    for await (const callback of [windowCallback, ...onBeforeRequestCallbacks].filter(s => s)) {
      if ((await callback(requestInit)) === false) {
        return false;
      }
    }
    return true;
  }

  async function runAfterResponseCallbacks(requestInit: FapiRequestInit, response: FapiResponse<unknown>) {
    const windowCallback = typeof window !== 'undefined' && (window as any).__unstable__onAfterResponse;
    for await (const callback of [windowCallback, ...onAfterResponseCallbacks].filter(s => s)) {
      if ((await callback(requestInit, response)) === false) {
        return false;
      }
    }
    return true;
  }

  function buildQueryString({ method, path, sessionId, search, rotatingTokenNonce }: FapiRequestInit) {
    const searchParams = new URLSearchParams(search);
    if (clerkInstance.version) {
      searchParams.append('_clerk_js_version', clerkInstance.version);
    }

    if (rotatingTokenNonce) {
      searchParams.append('rotating_token_nonce', rotatingTokenNonce);
    }

    if (clerkInstance.instanceType === 'development' && clerkInstance.isSatellite) {
      searchParams.append('__domain', clerkInstance.domain);
    }

    // Due to a known Safari bug regarding CORS requests, we are forced to always use GET or POST method.
    // The original HTTP method is used as a query string parameter instead of as an actual method to
    // avoid triggering a CORS OPTION request as it currently breaks cookie dropping in Safari.
    if (!!method && method !== 'GET' && method !== 'POST') {
      searchParams.append('_method', method);
    }

    if (path && !path.startsWith('/client') && sessionId) {
      searchParams.append('_clerk_session_id', sessionId);
    }

    // TODO: extract to generic helper
    const objParams = [...searchParams.entries()].reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {} as FapiQueryStringParameters & Record<string, string>);

    return qs.stringify(objParams, { addQueryPrefix: true });
  }

  function buildUrl(requestInit: FapiRequestInit): URL {
    const { path, pathPrefix = 'v1' } = requestInit;

    const { proxyUrl, domain, frontendApi, instanceType } = clerkInstance;

    const domainOnlyInProd = instanceType === 'production' ? domain : '';

    if (proxyUrl) {
      const proxyBase = new URL(proxyUrl);
      const proxyPath = proxyBase.pathname.slice(1, proxyBase.pathname.length);
      return buildUrlUtil(
        {
          base: proxyBase.origin,
          pathname: `${proxyPath}/${pathPrefix}${path}`,
          search: buildQueryString(requestInit),
        },
        { stringify: false },
      );
    }

    return buildUrlUtil(
      {
        base: `https://${domainOnlyInProd || frontendApi}`,
        pathname: `${pathPrefix}${path}`,
        search: buildQueryString(requestInit),
      },
      { stringify: false },
    );
  }

  function buildEmailAddress(localPart: string): string {
    return buildEmailAddressUtil({
      localPart,
      frontendApi: clerkInstance.frontendApi,
    });
  }

  async function request<T>(requestInit: FapiRequestInit): Promise<FapiResponse<T>> {
    // eslint-disable-next-line prefer-const
    let { method = 'GET', body } = requestInit;

    requestInit.url = buildUrl({
      ...requestInit,
      // TODO: Pass these values to the FAPI client instead of calculating them on the spot
      sessionId: clerkInstance.session?.id,
    });

    // Initialize the headers if they're not provided.
    if (!requestInit.headers) {
      requestInit.headers = new Headers();
    }

    // Set the default content type for non-GET requests.
    // Skip for FormData, because the browser knows how to construct it later on.
    // Skip if the content-type header has already been set, somebody intends to override it.
    // @ts-ignore
    if (method !== 'GET' && !(body instanceof FormData) && !requestInit.headers.has('content-type')) {
      // @ts-ignore
      requestInit.headers.set('content-type', 'application/x-www-form-urlencoded');
    }

    // Massage the body depending on the content type if needed.
    // Currently, this is needed only for form-urlencoded, so that the values reach the server in the form
    // foo=bar&baz=bar&whatever=1
    // @ts-ignore
    if (requestInit.headers.get('content-type') === 'application/x-www-form-urlencoded') {
      requestInit.body = qs.stringify(body, { encoder: camelToSnakeEncoder, indices: false });
    }

    const beforeRequestCallbacksResult = await runBeforeRequestCallbacks(requestInit);
    // Due to a known Safari bug regarding CORS requests, we are forced to always use GET or POST method.
    // The original HTTP method is used as a query string parameter instead of as an actual method to
    // avoid triggering a CORS OPTION request as it currently breaks cookie dropping in Safari.
    const overwrittenRequestMethod = method === 'GET' ? 'GET' : 'POST';
    let response: Response;
    const urlStr = requestInit.url.toString();
    const fetchOpts: FapiRequestInit = {
      ...requestInit,
      credentials: 'include',
      method: overwrittenRequestMethod,
    };

    try {
      if (beforeRequestCallbacksResult) {
        const maxTries = isBrowserOnline() ? 4 : 11;
        response =
          // retry only on GET requests for safety
          overwrittenRequestMethod === 'GET'
            ? await runWithExponentialBackOff(() => fetch(urlStr, fetchOpts), {
                firstDelay: 500,
                maxDelay: 3000,
                shouldRetry: (_: unknown, iterationsCount: number) => {
                  return iterationsCount < maxTries;
                },
              })
            : await fetch(urlStr, fetchOpts);
      } else {
        response = new Response('{}', requestInit); // Mock an empty json response
      }
    } catch (e) {
      clerkNetworkError(urlStr, e);
    }

    const json: FapiResponseJSON<T> = await response.json();
    const fapiResponse: FapiResponse<T> = Object.assign(response, { payload: json });
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
