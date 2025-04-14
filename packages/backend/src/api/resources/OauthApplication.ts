import type { OAuthApplicationJSON } from './JSON';

export class OAuthApplication {
  constructor(
    readonly id: string,
    readonly instanceId: string,
    readonly name: string,
    readonly clientId: string,
    readonly isPublic: boolean, // NOTE: `public` is reserved
    readonly scopes: string,
    readonly redirectUris: Array<string>,
    readonly authorizeUrl: string,
    readonly tokenFetchUrl: string,
    readonly userInfoUrl: string,
    readonly discoveryUrl: string,
    readonly tokenIntrospectionUrl: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly clientSecret?: string,
  ) {}

  static fromJSON(data: OAuthApplicationJSON) {
    return new OAuthApplication(
      data.id,
      data.instance_id,
      data.name,
      data.client_id,
      data.public,
      data.scopes,
      data.redirect_uris,
      data.authorize_url,
      data.token_fetch_url,
      data.user_info_url,
      data.discovery_url,
      data.token_introspection_url,
      data.created_at,
      data.updated_at,
      data.client_secret,
    );
  }
}
