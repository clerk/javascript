import fetch from '../runtime/fetch';

export type HTTPTransportRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  queryParams?: Record<string, unknown>;
  headerParams?: Record<string, unknown>;
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

export type HTTPTransportResponseOptions<T> = {
  data: T;
  hasError: boolean;
  status: number;
  statusText: string;
};

export type HTTPTransport = <T>(options: HTTPTransportRequestOptions) => Promise<HTTPTransportResponseOptions<T>>;

export const request: HTTPTransport = async ({ url, method, queryParams, headerParams, bodyParams }) => {
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
    headers: headerParams,
    ...(bodyParams && Object.keys(bodyParams).length > 0 && { body: JSON.stringify(bodyParams) }),
  });

  // Parse JSON or Text response.
  const isJSONResponse = headerParams && headerParams['Content-Type'] === 'application/json';
  const data = await (isJSONResponse ? response.json() : response.text());

  return {
    data,
    hasError: !response.ok,
    status: response.status,
    statusText: response.statusText,
  };
};
