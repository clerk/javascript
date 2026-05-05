import type {
  EnterpriseConnectionJSON,
  EnterpriseConnectionOauthConfigJSON,
  EnterpriseConnectionSamlConnectionJSON,
} from './JSON';

export class EnterpriseConnectionSamlConnection {
  constructor(
    /**
     * The unique identifier for the SAML connection.
     */
    readonly id: string,
    /**
     * The name to use as a label for the connection.
     */
    readonly name: string,
    /**
     * The Entity ID as provided by the Identity Provider (IdP).
     */
    readonly idpEntityId: string,
    /**
     * The Single-Sign On URL as provided by the Identity Provider (IdP).
     */
    readonly idpSsoUrl: string,
    /**
     * The X.509 certificate as provided by the Identity Provider (IdP).
     */
    readonly idpCertificate: string,
    /**
     * The URL which serves the Identity Provider (IdP) metadata.
     */
    readonly idpMetadataUrl: string,
    /**
     * The XML content of the Identity Provider (IdP) metadata file.
     */
    readonly idpMetadata: string,
    /**
     * The Assertion Consumer Service (ACS) URL of the connection.
     */
    readonly acsUrl: string,
    /**
     * The Entity ID as provided by the Service Provider (Clerk).
     */
    readonly spEntityId: string,
    /**
     * The metadata URL as provided by the Service Provider (Clerk).
     */
    readonly spMetadataUrl: string,
    /**
     * Indicates whether the connection syncs user attributes between the IdP and Clerk.
     */
    readonly syncUserAttributes: boolean,
    /**
     * Indicates whether users with an email address subdomain are allowed to use this connection.
     */
    readonly allowSubdomains: boolean,
    /**
     * Indicates whether Identity Provider (IdP) initiated flows are allowed.
     */
    readonly allowIdpInitiated: boolean,
  ) {}

  static fromJSON(data: EnterpriseConnectionSamlConnectionJSON): EnterpriseConnectionSamlConnection {
    return new EnterpriseConnectionSamlConnection(
      data.id,
      data.name,
      data.idp_entity_id,
      data.idp_sso_url,
      data.idp_certificate,
      data.idp_metadata_url,
      data.idp_metadata,
      data.acs_url,
      data.sp_entity_id,
      data.sp_metadata_url,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.allow_idp_initiated,
    );
  }
}

/**
 * OAuth configuration included on a Backend API {@link EnterpriseConnection} response.
 */
export class EnterpriseConnectionOauthConfig {
  constructor(
    /**
     * The unique identifier for the OAuth configuration.
     */
    readonly id: string,
    /**
     * The name to use as a label for the configuration.
     */
    readonly name: string,
    /**
     * The OAuth client ID.
     */
    readonly clientId: string,
    /**
     * The OpenID Connect discovery URL.
     */
    readonly discoveryUrl: string,
    /**
     * The public URL of the OAuth provider logo, if available.
     */
    readonly logoPublicUrl: string,
    /**
     * The date when the configuration was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the configuration was last updated.
     */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: EnterpriseConnectionOauthConfigJSON): EnterpriseConnectionOauthConfig {
    return new EnterpriseConnectionOauthConfig(
      data.id,
      data.name,
      data.client_id,
      data.discovery_url,
      data.logo_public_url,
      data.created_at,
      data.updated_at,
    );
  }
}

/**
 * The Backend `EnterpriseConnection` object holds information about an enterprise connection (SAML or OAuth) for an instance or organization.
 */
export class EnterpriseConnection {
  constructor(
    /**
     * The unique identifier for the connection.
     */
    readonly id: string,
    /**
     * The name to use as a label for the connection.
     */
    readonly name: string,
    /**
     * The domain of the enterprise. Sign-in flows using an email with this domain may use the connection.
     */
    readonly domains: Array<string>,
    /**
     * The Organization ID if the connection is scoped to an organization.
     */
    readonly organizationId: string | null,
    /**
     * Indicates whether the connection is active or not.
     */
    readonly active: boolean,
    /**
     * Indicates whether the connection syncs user attributes between the IdP and Clerk or not.
     */
    readonly syncUserAttributes: boolean,
    /**
     * Indicates whether users with an email address subdomain are allowed to use this connection or not.
     */
    readonly allowSubdomains: boolean,
    /**
     * Indicates whether additional identifications are disabled for this connection.
     */
    readonly disableAdditionalIdentifications: boolean,
    /**
     * The date when the connection was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the connection was last updated.
     */
    readonly updatedAt: number,
    /**
     * SAML connection details when the enterprise connection uses SAML.
     */
    readonly samlConnection: EnterpriseConnectionSamlConnection | null,
    /**
     * OAuth (OIDC) configuration when the enterprise connection uses OAuth.
     */
    readonly oauthConfig: EnterpriseConnectionOauthConfig | null,
  ) {}

  static fromJSON(data: EnterpriseConnectionJSON): EnterpriseConnection {
    return new EnterpriseConnection(
      data.id,
      data.name,
      data.domains,
      data.organization_id,
      data.active,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.disable_additional_identifications,
      data.created_at,
      data.updated_at,
      data.saml_connection != null ? EnterpriseConnectionSamlConnection.fromJSON(data.saml_connection) : null,
      data.oauth_config != null ? EnterpriseConnectionOauthConfig.fromJSON(data.oauth_config) : null,
    );
  }
}
