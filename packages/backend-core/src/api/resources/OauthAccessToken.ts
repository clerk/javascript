import type { OauthAccessTokenJSON } from './JSON';

export class OauthAccessToken {
  constructor(
    readonly provider: string,
    readonly token: string,
    readonly publicMetadata: Record<string, unknown> = {},
    readonly label: string,
    readonly scopes?: string[],
    readonly tokenSecret?: string,
  ) {}

  static fromJSON(data: OauthAccessTokenJSON) {
    return new OauthAccessToken(
      data.provider,
      data.token,
      data.public_metadata,
      data.label,
      data.scopes,
      data.token_secret,
    );
  }
}
