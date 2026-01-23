import type { OauthAccessTokenJSON } from './JSON';

export class OauthAccessToken {
  constructor(
    readonly externalAccountId: string,
    readonly provider: string,
    readonly token: string,
    readonly publicMetadata: Record<string, unknown> = {},
    readonly label: string,
    readonly scopes?: string[],
    readonly tokenSecret?: string,
    readonly expiresAt?: number,
    /**
     * The ID token retrieved from the OIDC provider.
     * Only present for OIDC-compliant OAuth 2.0 providers when available.
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
