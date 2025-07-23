import type { OAuthApplicationJSON } from './JSON';

/**
 * The Backend `OAuthApplication` object holds information about an OAuth application.
 */
export class OAuthApplication {
  constructor(
    /**
     * The unique identifier for the OAuth application.
     */
    readonly id: string,
    /**
     * The instance ID of the OAuth application.
     */
    readonly instanceId: string,
    /**
     * The name of the new OAuth application.
     */
    readonly name: string,
    /**
     * The client ID of the client.
     */
    readonly clientId: string,
    /**
     * Indicates whether the client is public. If true, the Proof Key of Code Exchange (PKCE) flow can be used.
     */
    readonly isPublic: boolean, // NOTE: `public` is reserved
    /**
     * Scopes for the new OAuth application. Available scopes are `profile`, `email`, `public_metadata`, `private_metadata`. Defaults to `profile email`. Provide the requested scopes as a string, separated by spaces.
     */
    readonly scopes: string,
    /**
     * An array of redirect URIs of the new OAuth application.
     */
    readonly redirectUris: Array<string>,
    /**
     *
     */
    readonly authorizeUrl: string,
    /**
     *
     */
    readonly tokenFetchUrl: string,
    /**
     *
     */
    readonly userInfoUrl: string,
    /**
     *
     */
    readonly discoveryUrl: string,
    /**
     *
     */
    readonly tokenIntrospectionUrl: string,
    /**
     * The date when the OAuth application was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the OAuth application was last updated.
     */
    readonly updatedAt: number,
    /**
     * The client secret.
     */
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
