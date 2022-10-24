// TODO: Remove import and use an isomorphic helper
import snakecaseKeys from 'snakecase-keys';

import { API_KEY, API_URL, API_VERSION, USER_AGENT } from '../constants';
import { joinPaths } from '../util/path';
import {
  AllowlistIdentifierAPI,
  ClientAPI,
  EmailAPI,
  InterstitialAPI,
  InvitationAPI,
  OrganizationAPI,
  RedirectUrlAPI,
  SessionAPI,
  SignInTokenAPI,
  SMSMessageAPI,
  UserAPI,
} from './endpoints';
import { ClerkAPIResponseError, MISSING_API_KEY } from './errors';
// TODO: Revise the HttpTransport abstraction. Maybe just use the fetch API directly?
import { HTTPTransport, HTTPTransportRequestOptions, request as httpRequest } from './HttpTransport';
import { deserialize } from './resources/Deserializer';

export type ClerkBackendAPIOptions = {
  /* Backend API Client (not specific to window.fetch API)
   * The fetcher implementation should return the response body, not the whole response.
   */
  httpTransport: HTTPTransport;
  /* Backend API key */
  apiKey?: string;
  /* Backend API URL */
  apiUrl?: string;
  /* Backend API version */
  apiVersion?: string;
  /* Library/SDK name */
  userAgent?: string;
};

export function createBackendApiClient(options?: ClerkBackendAPIOptions) {
  const {
    apiKey = API_KEY,
    apiUrl = API_URL,
    apiVersion = API_VERSION,
    httpTransport = httpRequest,
    userAgent = USER_AGENT,
  } = options || {};

  const request = async <T>(requestOptions: HTTPTransportRequestOptions): Promise<T> | never => {
    if (apiKey) {
      throw Error(MISSING_API_KEY);
    }

    const { path, method } = requestOptions;
    const url = joinPaths(apiUrl, apiVersion, path);

    const newRequestOptions = { method, url } as HTTPTransportRequestOptions;

    newRequestOptions.queryParams = snakecaseKeys({ ...requestOptions.queryParams });

    newRequestOptions.headerParams = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
      'X-Clerk-SDK': userAgent,
      ...requestOptions.headerParams,
    };

    newRequestOptions.bodyParams = snakecaseKeys({ ...requestOptions.bodyParams }, { deep: false });

    const { data, hasError, status, statusText } = await httpTransport<T>(newRequestOptions);

    if (hasError) {
      throw new ClerkAPIResponseError(statusText, {
        data: data?.errors || data,
        status,
      });
    }

    return deserialize(data) as T;
  };

  return {
    allowlistIdentifiers: new AllowlistIdentifierAPI(request),
    clients: new ClientAPI(request),
    emails: new EmailAPI(request),
    interstitial: new InterstitialAPI(request),
    invitations: new InvitationAPI(request),
    organizations: new OrganizationAPI(request),
    redirectUrls: new RedirectUrlAPI(request),
    sessions: new SessionAPI(request),
    signInTokens: new SignInTokenAPI(request),
    smsMessage: new SMSMessageAPI(request),
    users: new UserAPI(request),
  };
}
