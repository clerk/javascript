import type {
  EnterpriseConnectionCustomAttributeJSON,
  EnterpriseConnectionJSON,
  EnterpriseConnectionOauthConfigJSON,
  EnterpriseConnectionSamlConnectionJSON,
  EnterpriseConnectionSamlConnectionLoginHintJSON,
} from './JSON';

/**
 * The `login_hint` configuration included on a Backend API {@link EnterpriseConnectionSamlConnection} response.
 */
export class EnterpriseConnectionSamlConnectionLoginHint {
  constructor(
    /** How the SAML connection emits the `login_hint` sent to the IdP: `'email_address'` sends the typed identifier, `'custom_attribute'` sends the value stored at the user `publicMetadata` key named by `source`, and `'off'` omits the `login_hint`. */
    readonly mode: 'email_address' | 'custom_attribute' | 'off',
    /** The user `publicMetadata` key the `login_hint` value is read from. Only set when `mode` is `'custom_attribute'`. */
    readonly source?: string,
  ) {}

  static fromJSON(data: EnterpriseConnectionSamlConnectionLoginHintJSON): EnterpriseConnectionSamlConnectionLoginHint {
    return new EnterpriseConnectionSamlConnectionLoginHint(data.mode, data.source);
  }
}

/**
 * A custom attribute mapping included on a Backend API {@link EnterpriseConnection} response.
 */
export class EnterpriseConnectionCustomAttribute {
  constructor(
    /** The display name of the custom attribute. */
    readonly name: string,
    /** The key the custom attribute is stored under. */
    readonly key: string,
    /** The SSO (SAML or OIDC) attribute path the value is read from. */
    readonly ssoPath: string,
    /** The SCIM attribute path the value is read from. */
    readonly scimPath: string,
    /** Whether the custom attribute holds multiple values. */
    readonly multiValued: boolean,
  ) {}

  static fromJSON(data: EnterpriseConnectionCustomAttributeJSON): EnterpriseConnectionCustomAttribute {
    return new EnterpriseConnectionCustomAttribute(
      data.name,
      data.key,
      data.sso_path,
      data.scim_path,
      data.multi_valued,
    );
  }
}

/**
 * The Backend `EnterpriseConnectionSamlConnection` object holds information about a SAML enterprise connection for an instance or organization.
 */
export class EnterpriseConnectionSamlConnection {
  constructor(
    /** The unique identifier for the SAML connection. */
    readonly id: string,
    /** The name to use as a label for the connection. */
    readonly name: string,
    /** The Entity ID as provided by the Identity Provider (IdP). */
    readonly idpEntityId: string | undefined,
    /** The Single-Sign On URL as provided by the Identity Provider (IdP). */
    readonly idpSsoUrl: string | undefined,
    /** The X.509 certificate as provided by the Identity Provider (IdP). */
    readonly idpCertificate: string | undefined,
    /** The Unix timestamp when the Identity Provider (IdP) certificate was issued. */
    readonly idpCertificateIssuedAt: number | undefined,
    /** The Unix timestamp when the Identity Provider (IdP) certificate expires. */
    readonly idpCertificateExpiresAt: number | undefined,
    /** The URL which serves the Identity Provider (IdP) metadata. */
    readonly idpMetadataUrl: string | undefined,
    /**
     * The XML content of the Identity Provider (IdP) metadata file.
     * @deprecated The Backend API does not return this field, so it is always `undefined`.
     */
    readonly idpMetadata: string | undefined,
    /** The Assertion Consumer Service (ACS) URL of the connection. */
    readonly acsUrl: string | undefined,
    /** The Entity ID as provided by the Service Provider (Clerk). */
    readonly spEntityId: string | undefined,
    /** The metadata URL as provided by the Service Provider (Clerk). */
    readonly spMetadataUrl: string | undefined,
    /**
     * Whether the connection syncs user attributes between the IdP and Clerk.
     * @deprecated The Backend API does not return this field on the nested SAML connection, so it is always `undefined`. Use the top-level `syncUserAttributes` on {@link EnterpriseConnection} instead.
     */
    readonly syncUserAttributes: boolean | undefined,
    /** Whether users with an email address subdomain are allowed to use this connection. */
    readonly allowSubdomains: boolean,
    /** Whether IdP-initiated SSO is allowed. */
    readonly allowIdpInitiated: boolean,
    /** Whether the SAML connection is active. */
    readonly active: boolean,
    /** Whether the SAML connection requires force authentication. */
    readonly forceAuthn: boolean,
    /** The `login_hint` configuration of the SAML connection. */
    readonly loginHint: EnterpriseConnectionSamlConnectionLoginHint,
  ) {}

  static fromJSON(data: EnterpriseConnectionSamlConnectionJSON): EnterpriseConnectionSamlConnection {
    return new EnterpriseConnectionSamlConnection(
      data.id,
      data.name,
      data.idp_entity_id,
      data.idp_sso_url,
      data.idp_certificate,
      data.idp_certificate_issued_at,
      data.idp_certificate_expires_at,
      data.idp_metadata_url,
      data.idp_metadata,
      data.acs_url,
      data.sp_entity_id,
      data.sp_metadata_url,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.allow_idp_initiated,
      data.active,
      data.force_authn,
      EnterpriseConnectionSamlConnectionLoginHint.fromJSON(data.login_hint),
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
    readonly clientId: string | undefined,
    /**
     * The OpenID Connect discovery URL.
     */
    readonly discoveryUrl: string | undefined,
    /**
     * The public URL of the OAuth provider logo, if available.
     */
    readonly logoPublicUrl: string | undefined,
    /**
     * The date when the configuration was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the configuration was last updated.
     */
    readonly updatedAt: number,
    /**
     * The OAuth provider key of the configuration. For example, `'custom_oidc'`.
     */
    readonly providerKey: string,
    /**
     * The OAuth authorization URL.
     */
    readonly authUrl: string | undefined,
    /**
     * The OAuth token URL.
     */
    readonly tokenUrl: string | undefined,
    /**
     * The OAuth user info URL.
     */
    readonly userInfoUrl: string | undefined,
    /**
     * Whether the OAuth configuration requires PKCE.
     */
    readonly requiresPkce: boolean,
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
      data.provider_key,
      data.auth_url,
      data.token_url,
      data.user_info_url,
      data.requires_pkce,
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
     * Whether the connection is active or not.
     */
    readonly active: boolean,
    /**
     * Whether the connection syncs user attributes between the IdP and Clerk or not.
     */
    readonly syncUserAttributes: boolean,
    /**
     * Whether users with an email address subdomain are allowed to use this connection or not.
     * @deprecated The Backend API does not return this field at the top level, so it is always `undefined`. Use `samlConnection.allowSubdomains` instead.
     */
    readonly allowSubdomains: boolean | undefined,
    /**
     * Whether additional identifications are disabled for this connection.
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
    /**
     * The identity provider (IdP) of the connection. For example, `'saml_custom'` or `'oidc_custom'`.
     */
    readonly provider: string,
    /**
     * The public URL of the provider logo, if available.
     */
    readonly logoPublicUrl: string | undefined,
    /**
     * Whether existing users who are members of the organization can link their account to their enterprise identity.
     */
    readonly allowOrganizationAccountLinking: boolean,
    /**
     * Whether the connection can be used for sign-in and sign-up.
     */
    readonly authenticatable: boolean,
    /**
     * Whether Just-in-Time (JIT) provisioning of users is disabled for the connection.
     */
    readonly disableJitProvisioning: boolean,
    /**
     * The custom attribute mappings of the connection. Only returned when the custom attributes feature is enabled for the instance.
     */
    readonly customAttributes: EnterpriseConnectionCustomAttribute[] | undefined,
  ) {}

  static fromJSON(data: EnterpriseConnectionJSON): EnterpriseConnection {
    return new EnterpriseConnection(
      data.id,
      data.name,
      data.domains,
      data.organization_id ?? null,
      data.active,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.disable_additional_identifications,
      data.created_at,
      data.updated_at,
      data.saml_connection != null ? EnterpriseConnectionSamlConnection.fromJSON(data.saml_connection) : null,
      data.oauth_config != null ? EnterpriseConnectionOauthConfig.fromJSON(data.oauth_config) : null,
      data.provider,
      data.logo_public_url,
      data.allow_organization_account_linking,
      data.authenticatable,
      data.disable_jit_provisioning,
      data.custom_attributes?.map(attr => EnterpriseConnectionCustomAttribute.fromJSON(attr)),
    );
  }
}
