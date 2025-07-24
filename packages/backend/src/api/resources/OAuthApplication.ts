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
     * The ID of the instance that this OAuth application belongs to.
     */
    readonly instanceId: string,
    /**
     * The name of the new OAuth application.
     */
    readonly name: string,
    /**
     * The ID of the client associated with the OAuth application.
     */
    readonly clientId: string,
    /**
     * The public-facing URL of the OAuth application, often shown on consent screens.
     */
    readonly clientUri: string | null,
    /**
     * The URL of the image or logo representing the OAuth application.
     */
    readonly clientImageUrl: string | null,
    /**
     * Specifies whether the OAuth application is dynamically registered.
     */
    readonly dynamicallyRegistered: boolean,
    /**
     * Specifies whether the consent screen should be displayed in the authentication flow. Cannot be disabled for dynamically registered OAuth applications.
     */
    readonly consentScreenEnabled: boolean,
    /**
     * Specifies whether the Proof Key of Code Exchange (PKCE) flow should be required in the authentication flow.
     */
    readonly pkceRequired: boolean,
    /**
     * Indicates whether the client is public. If true, the Proof Key of Code Exchange (PKCE) flow can be used.
     */
    readonly isPublic: boolean, // NOTE: `public` is reserved
    /**
     * Scopes for the new OAuth application.
     */
    readonly scopes: string,
    /**
     * An array of redirect URIs of the new OAuth application.
     */
    readonly redirectUris: Array<string>,
    /**
     * The URL used to authorize the user and obtain an authorization code.
     */
    readonly authorizeUrl: string,
    /**
     * The URL used by the client to exchange an authorization code for an access token.
     */
    readonly tokenFetchUrl: string,
    /**
     * The URL where the client can retrieve user information using an access token.
     */
    readonly userInfoUrl: string,
    /**
     * The OpenID Connect discovery endpoint URL for this OAuth application.
     */
    readonly discoveryUrl: string,
    /**
     * The URL used to introspect and validate issued access tokens.
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
     * The client secret associated with the OAuth application. Empty if public client.
     */
    readonly clientSecret?: string,
  ) {}

  static fromJSON(data: OAuthApplicationJSON) {
    return new OAuthApplication(
      data.id,
      data.instance_id,
      data.name,
      data.client_id,
      data.client_uri,
      data.client_image_url,
      data.dynamically_registered,
      data.consent_screen_enabled,
      data.pkce_required,
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
