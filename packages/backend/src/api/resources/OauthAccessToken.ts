import type { OauthAccessTokenJSON } from './JSON';

/**
 * The Backend `OauthAccessToken` object holds information about an OAuth access token associated with a user that has previously authenticated with a particular OAuth provider.
 */
export class OauthAccessToken {
  constructor(
    /**
     * The ID of the external account associated with this token.
     */
    readonly externalAccountId: string,
    /**
     * The OAuth provider (e.g., `google`, `github`).
     */
    readonly provider: string,
    /**
     * The OAuth access token.
     */
    readonly token: string,
    /**
     * Metadata that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API.
     */
    readonly publicMetadata: Record<string, unknown> = {},
    /**
     * A descriptive label to differentiate multiple access tokens of the same user for the same provider.
     */
    readonly label: string,
    /**
     * The scopes granted for this access token.
     */
    readonly scopes?: string[],
    /**
     * The token secret, if applicable (e.g., for OAuth 1.0 providers).
     */
    readonly tokenSecret?: string,
    /**
     * The date when the access token expires.
     */
    readonly expiresAt?: number,
    /**
     * The user's OIDC ID Token, if available.
     * This token contains user identity information as a JWT and is returned when the provider supports [OpenID Connect (OIDC)](/docs/guides/configure/auth-strategies/oauth/overview). Not all OAuth providers implement OIDC, so this field may be `undefined` for some providers.
     */
    readonly idToken?: string,
  ) {}

  static fromJSON(data: OauthAccessTokenJSON) {
    return new OauthAccessToken(
      data.external_account_id,
      data.provider,
      data.token,
      data.public_metadata,
      data.label || '',
      data.scopes,
      data.token_secret,
      data.expires_at,
      data.id_token,
    );
  }
}
