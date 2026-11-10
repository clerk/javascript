import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { runtime } from '../../runtime';
import { joinPaths } from '../../util/path';
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
export type OAuthTokenTypeIdentifier =
  | 'urn:ietf:params:oauth:token-type:access_token'
  | 'urn:ietf:params:oauth:token-type:refresh_token'
  | 'urn:ietf:params:oauth:token-type:id_token'
  | 'urn:ietf:params:oauth:token-type:jwt'
  | (string & {});

/**
 * The parameters for performing an [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693) for an OAuth application.
 */
export type ExchangeOAuthApplicationTokenParams = {
  /** The ID of the OAuth application performing the exchange. */
  oauthApplicationId: string;
  /** The client secret of the OAuth application, used to authenticate with the token endpoint. */
  clientSecret: string;
  /** The token that represents the identity of the party on behalf of whom the request is being made. */
  subjectToken: string;
  /** The type of `subjectToken`. */
  subjectTokenType: OAuthTokenTypeIdentifier;
  /** The token that represents the identity of the acting party, for delegation. */
  actorToken?: string;
  /** The type of `actorToken`. Required when `actorToken` is provided. */
  actorTokenType?: OAuthTokenTypeIdentifier;
  /** The type of token being requested. */
  requestedTokenType?: OAuthTokenTypeIdentifier;
  /** The logical name or names of the target service where the issued token will be used. */
  audience?: string | string[];
  /** The URI or URIs of the target service or resource where the issued token will be used. */
  resource?: string | string[];
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

const TOKEN_EXCHANGE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:token-exchange';

const formUrlEncode = (value: string) => new URLSearchParams({ v: value }).toString().slice(2);

const appendAll = (body: URLSearchParams, key: string, value: string | string[] | undefined) => {
  if (value === undefined) {
    return;
  }
  for (const v of Array.isArray(value) ? value : [value]) {
    body.append(key, v);
  }
};

const buildTokenExchangeBody = (params: ExchangeOAuthApplicationTokenParams) => {
  const body = new URLSearchParams({
    grant_type: TOKEN_EXCHANGE_GRANT_TYPE,
    subject_token: params.subjectToken,
    subject_token_type: params.subjectTokenType,
  });
  appendAll(body, 'actor_token', params.actorToken);
  appendAll(body, 'actor_token_type', params.actorTokenType);
  appendAll(body, 'requested_token_type', params.requestedTokenType);
  appendAll(body, 'audience', params.audience);
  appendAll(body, 'resource', params.resource);
  if (params.scope?.length) {
    body.set('scope', params.scope.join(' '));
  }
  return body;
};

type TokenExchangeResponseJSON = {
  access_token: string;
  issued_token_type: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
};

const toTokenExchangeResult = (json: TokenExchangeResponseJSON): ExchangeOAuthApplicationTokenResult => ({
  accessToken: json.access_token,
  issuedTokenType: json.issued_token_type,
  tokenType: json.token_type,
  expiresIn: json.expires_in,
  scope: json.scope ? json.scope.split(' ') : undefined,
  refreshToken: json.refresh_token,
});

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
   * Performs an [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693) for the given [`OAuthApplication`](/docs/reference/backend/types/backend-oauth-application), exchanging a subject token for a new token issued by the application's token endpoint.
   *
   * @param params - The parameters for the token exchange.
   * @returns The issued token and its metadata.
   *
   * @example
   * ```ts
   * const { accessToken } = await clerkClient.oauthApplications.__experimental_exchangeToken({
   *   oauthApplicationId: 'oauthapp_123',
   *   clientSecret: process.env.OAUTH_CLIENT_SECRET,
   *   subjectToken,
   *   subjectTokenType: 'urn:ietf:params:oauth:token-type:access_token',
   *   audience: 'https://api.example.com',
   * });
   * ```
   */
  public async __experimental_exchangeToken(
    params: ExchangeOAuthApplicationTokenParams,
  ): Promise<ExchangeOAuthApplicationTokenResult> {
    const application = await this.get(params.oauthApplicationId);

    const credentials = `${formUrlEncode(application.clientId)}:${formUrlEncode(params.clientSecret)}`;

    const response = await runtime.fetch(application.tokenFetchUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${btoa(credentials)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildTokenExchangeBody(params),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed with status ${response.status}.`);
    }

    return toTokenExchangeResult((await response.json()) as TokenExchangeResponseJSON);
  }
}
