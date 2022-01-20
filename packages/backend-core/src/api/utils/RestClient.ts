import * as querystring from 'query-string';
import snakecaseKeys from 'snakecase-keys';

import deserialize from './Deserializer';
import handleError from './ErrorHandler';

export const INTERSTITIAL_METHOD = 'GET';
const SERVER_API_URL = 'https://api.clerk.dev';
const INTERSTITIAL_path = 'v1/internal/interstitial';
const INTERSTITIAL_URL = `${SERVER_API_URL}/${INTERSTITIAL_path}`;
const API_CONTENT_TYPE = 'application/x-www-form-urlencoded';

type RequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  queryParams?: object;
  bodyParams?: object;
};

/*
 * HTTP fetch implementation (not specific to window.fetch API).
 * The fetcher implementation should return the response body, not the whole response.
 */
export type ClerkFetcher = (
  url: string,
  options: {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    authorization: string;
    contentType: string;
    userAgent: string;
    body?: Record<string, unknown>;
  }
) => Promise<unknown>;

export default class RestClient {
  apiKey: string;
  serverApiUrl: string;
  apiVersion: string;
  fetcher: ClerkFetcher;
  userAgent: string;

  constructor(
    apiKey: string,
    serverApiUrl: string,
    apiVersion: string,
    fetcher: ClerkFetcher,
    libName: string,
    libVersion: string,
    packageRepo: string
  ) {
    this.apiKey = apiKey;
    this.serverApiUrl = serverApiUrl;
    this.apiVersion = apiVersion;
    this.fetcher = fetcher;
    this.userAgent = `${libName}/${libVersion} (${packageRepo})`;
  }

  makeRequest<T>(requestOptions: RequestOptions): Promise<T> {
    let url = `${this.serverApiUrl}/${this.apiVersion}${requestOptions.path}`;

    if (requestOptions.queryParams) {
      url = `${url}?${querystring.stringify(
        snakecaseKeys(requestOptions.queryParams)
      )}`;
    }

    let body;
    if (requestOptions.bodyParams) {
      body = snakecaseKeys(requestOptions.bodyParams);
    }

    // TODO improve error handling
    // TODO Instruct that data should be a JSON response
    return this.fetcher(url, {
      method: requestOptions.method,
      authorization: `Bearer ${this.apiKey}`,
      contentType: API_CONTENT_TYPE,
      userAgent: this.userAgent,
      body,
    })
      .then((responseData) => deserialize(responseData) as T)
      .catch((error) => handleError(error));
  }

  fetchInterstitial<T>(): Promise<T> {
    return this.fetcher(INTERSTITIAL_URL, {
      method: INTERSTITIAL_METHOD,
      authorization: `Bearer ${this.apiKey}`,
      contentType: 'text/html',
      userAgent: this.userAgent,
    }).catch((error) => handleError(error)) as Promise<T>;
  }
}
