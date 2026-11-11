import { isHttpOrHttps } from '@clerk/shared/proxy';
import type { Autocomplete, ClerkPaginationRequest } from '@clerk/shared/types';

import { OAuthTokenExchangeError } from '../../errors';
import { runtime } from '../../runtime';
import { joinPaths } from '../../util/path';
import { parsePublishableKey } from '../../util/shared';
import type { DeletedObject } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { OAuthApplication } from '../resources/OAuthApplication';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/oauth_applications';

/** @generateWithEmptyComment */
export type CreateOAuthApplicationParams = {
  /**
   * A descriptive name for the OAuth application (e.g., "My Web App", "My Mobile App"). Maximum length: 256 characters.
   */
  name: string;
  /** An array of redirect URIs for the OAuth application. */
  redirectUris?: Array<string> | null | undefined;
  /** Scopes for the OAuth application that dictate the user payload of the OAuth user info endpoint. Available scopes are `profile`, `email`, `public_metadata`, `private_metadata`. Provide the requested scopes as a string, separated by spaces. */
  scopes?: string | null | undefined;
  /** Whether the OAuth application is public. If `true`, the Proof Key of Code Exchange (PKCE) flow can be used. */
  public?: boolean | null | undefined;
};

/** @generateWithEmptyComment */
export type UpdateOAuthApplicationParams = CreateOAuthApplicationParams & {
  /** The ID of the OAuth application to update. */
  oauthApplicationId: string;
};

/** @generateWithEmptyComment */
export type RevokeOAuthApplicationTokenParams = {
  /** The ID of the OAuth application for which to revoke the token. */
  oauthApplicationId: string;
  /** The opaque OAuth access token or refresh token to revoke. */
  token: string;
};

/**
 * A token type identifier as defined in [RFC 8693 section 3](https://www.rfc-editor.org/rfc/rfc8693#section-3).
 */
export type OAuthTokenTypeIdentifier = Autocomplete<
  | 'urn:ietf:params:oauth:token-type:access_token'
  | 'urn:ietf:params:oauth:token-type:refresh_token'
  | 'urn:ietf:params:oauth:token-type:id_token'
  | 'urn:ietf:params:oauth:token-type:jwt'
>;

/**
 * The parameters for performing an [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693) for an OAuth application.
 */
export type ExchangeOAuthApplicationTokenParams = {
  /** The publishable key of the instance, used to derive its token endpoint. */
  publishableKey: string;
  /** The absolute URL of your Frontend API proxy. When set, the exchange is sent through the proxy instead of the Frontend API host in `publishableKey`. */
  proxyUrl?: string;
  /** The client ID of the OAuth application performing the exchange. */
  clientId: string;
  /** The client secret of the OAuth application, used to authenticate with the token endpoint. */
  clientSecret: string;
  /** The OAuth access token that represents the user on whose behalf the request is being made. */
  subjectToken: string;
  /** The URI of the target resource where the issued token will be used. */
  resource: string;
  /** The scopes requested for the issued token. */
  scope?: string[];
};

/**
 * The result of a successful [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693#section-2.2.1).
 */
export type ExchangeOAuthApplicationTokenResult = {
  /** The issued security token. */
  accessToken: string;
  /** The type of the issued token. */
  issuedTokenType: OAuthTokenTypeIdentifier;
  /** How the issued token is used, for example `Bearer`. */
  tokenType: string;
  /** The lifetime of the issued token in seconds, if provided by the authorization server. */
  expiresIn?: number;
  /** The scopes of the issued token, if provided by the authorization server. */
  scope?: string[];
  /** A refresh token, if issued by the authorization server. */
  refreshToken?: string;
};

/** @generateWithEmptyComment */
export type GetOAuthApplicationListParams = ClerkPaginationRequest<{
  /**
   * Filters by a case-insensitive substring of the application name or an exact client ID.
   */
  nameQuery?: string;
  /**
   * Returns OAuth applications in a particular order. Prefix a value with `+` to sort in ascending order, or `-` to sort in descending order. Defaults to `-created_at`.
   */
  orderBy?: WithSign<'name' | 'created_at'>;
}>;

type TokenExchangeResponseJSON = {
  access_token: string;
  issued_token_type: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
};

const tokenExchangeGrantType = 'urn:ietf:params:oauth:grant-type:token-exchange';
const accessTokenType = 'urn:ietf:params:oauth:token-type:access_token';

function formUrlEncode(value: string) {
  return new URLSearchParams({ v: value }).toString().slice(2);
}

function tokenExchangeBody(params: ExchangeOAuthApplicationTokenParams) {
  const body = new URLSearchParams({
    grant_type: tokenExchangeGrantType,
    subject_token: params.subjectToken,
    subject_token_type: accessTokenType,
    resource: params.resource,
  });
  if (params.scope?.length) {
    body.set('scope', params.scope.join(' '));
  }
  return body;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAbsentOr(value: Record<string, unknown>, key: string, check: (member: unknown) => boolean) {
  return !(key in value) || check(value[key]);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isTokenExchangeResponse(value: unknown): value is TokenExchangeResponseJSON {
  return (
    isRecord(value) &&
    isString(value.access_token) &&
    isString(value.issued_token_type) &&
    isString(value.token_type) &&
    isAbsentOr(value, 'scope', isString) &&
    isAbsentOr(value, 'expires_in', isNonNegativeInteger) &&
    isAbsentOr(value, 'refresh_token', isString)
  );
}

function tokenExchangeResult(json: TokenExchangeResponseJSON): ExchangeOAuthApplicationTokenResult {
  return {
    accessToken: json.access_token,
    issuedTokenType: json.issued_token_type,
    tokenType: json.token_type,
    expiresIn: json.expires_in,
    scope: json.scope ? json.scope.split(' ').filter(Boolean) : undefined,
    refreshToken: json.refresh_token,
  };
}

function tokenExchangeError(json: unknown, status: number) {
  if (!isRecord(json) || typeof json.error !== 'string') {
    return new OAuthTokenExchangeError({ error: 'invalid_response', status });
  }
  return new OAuthTokenExchangeError({
    error: json.error,
    errorDescription: typeof json.error_description === 'string' ? json.error_description : undefined,
    status,
  });
}

function oauthTokenEndpoint({ publishableKey, proxyUrl }: ExchangeOAuthApplicationTokenParams) {
  if (proxyUrl) {
    if (!isHttpOrHttps(proxyUrl)) {
      throw new Error('`proxyUrl` must be an absolute URL to perform an OAuth token exchange.');
    }
    return `${proxyUrl.replace(/\/+$/, '')}/oauth/token`;
  }
  const { frontendApi } = parsePublishableKey(publishableKey, { fatal: true });
  return `https://${frontendApi}/oauth/token`;
}

/** @generateWithEmptyComment */
export class OAuthApplicationsApi extends AbstractAPI {
  /**
   * Gets a list of OAuth applications for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @param params - The parameters to get the OAuth applications with.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) objects and a `totalCount` property containing the total number of OAuth applications.
   */
  public async list(params: GetOAuthApplicationListParams = {}) {
    return this.request<PaginatedResourceResponse<OAuthApplication[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  /**
   * Gets the given OAuth application.
   * @param oauthApplicationId - The ID of the OAuth application to get.
   * @returns The [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async get(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'GET',
      path: joinPaths(basePath, oauthApplicationId),
    });
  }

  /**
   * Creates a new OAuth application.
   * @param params - The parameters to create the OAuth application with.
   * @returns The created [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async create(params: CreateOAuthApplicationParams) {
    return this.request<OAuthApplication>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Updates the given OAuth application.
   * @returns The updated [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async update(params: UpdateOAuthApplicationParams) {
    const { oauthApplicationId, ...bodyParams } = params;

    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'PATCH',
      path: joinPaths(basePath, oauthApplicationId),
      bodyParams,
    });
  }

  /**
   * Deletes the given OAuth application.
   * @param oauthApplicationId - The ID of the OAuth application to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object) object.
   */
  public async delete(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, oauthApplicationId),
    });
  }

  /**
   * Rotates the secret of the given OAuth application. When the client secret is rotated, ensure that you update it in your authorized OAuth clients.
   * @param oauthApplicationId - The ID of the OAuth application to rotate the secret of.
   * @returns The [`OAuthApplication`](https://clerk.com/docs/reference/backend/types/backend-oauth-application) object.
   */
  public async rotateSecret(oauthApplicationId: string) {
    this.requireId(oauthApplicationId);

    return this.request<OAuthApplication>({
      method: 'POST',
      path: joinPaths(basePath, oauthApplicationId, 'rotate_secret'),
    });
  }

  /**
   * Revokes both the [OAuth access token](!oauth-access-token) and refresh token for the associated grant for the given [`OAuthApplication`](/docs/reference/backend/types/backend-oauth-application). The request may specify either token.
   */
  public async revokeToken(params: RevokeOAuthApplicationTokenParams) {
    const { oauthApplicationId, ...bodyParams } = params;

    this.requireId(oauthApplicationId);

    return this.request<void>({
      method: 'POST',
      path: joinPaths(basePath, oauthApplicationId, 'revoke_token'),
      bodyParams,
    });
  }

  /**
   * @experimental This is an experimental API for OAuth 2.0 Token Exchange and is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version to avoid breaking changes.
   *
   * Performs an [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693) for an [`OAuthApplication`](/docs/reference/backend/types/backend-oauth-application), exchanging a user's OAuth access token for a new access token for the target resource. The request is sent to the instance's token endpoint, derived from `publishableKey`, or from `proxyUrl` when set, and authenticates with the application's client ID and client secret. The instance secret key is not required.
   *
   * @param params - The parameters for the token exchange.
   * @returns The issued token and its metadata.
   * @throws `OAuthTokenExchangeError` if the token endpoint rejects the exchange or returns an invalid response.
   * @throws `Error` if `clientId` is empty, `publishableKey` is missing or invalid, or `proxyUrl` is not an absolute URL.
   *
   * @example
   * ```ts
   * const { accessToken } = await clerkClient.oauthApplications.__experimental_exchangeToken({
   *   publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
   *   clientId: process.env.OAUTH_CLIENT_ID!,
   *   clientSecret: process.env.OAUTH_CLIENT_SECRET!,
   *   subjectToken,
   *   resource: 'https://api.example.com',
   * });
   * ```
   */
  public async __experimental_exchangeToken(
    params: ExchangeOAuthApplicationTokenParams,
  ): Promise<ExchangeOAuthApplicationTokenResult> {
    if (!params.clientId) {
      throw new Error('A valid client ID is required.');
    }

    const tokenEndpoint = oauthTokenEndpoint(params);
    const credentials = `${formUrlEncode(params.clientId)}:${formUrlEncode(params.clientSecret)}`;
    const body = tokenExchangeBody(params);
    const headers = {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(credentials)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await runtime.fetch(tokenEndpoint, { method: 'POST', headers, body });

    const json = await response.json().catch(() => undefined);

    if (!response.ok) {
      throw tokenExchangeError(json, response.status);
    }

    if (response.status !== 200 || !isTokenExchangeResponse(json)) {
      throw new OAuthTokenExchangeError({ error: 'invalid_response', status: response.status });
    }

    return tokenExchangeResult(json);
  }
}
