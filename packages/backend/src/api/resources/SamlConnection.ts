import type { AttributeMappingJSON, SamlAccountConnectionJSON, SamlConnectionJSON } from './JSON';

/**
 * The Backend `SamlConnection` object holds information about a SAML connection for an organization.
 */
export class SamlConnection {
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
     * @deprecated The domain of your organization. Sign in flows using an email with this domain will use the connection.
     */
    readonly domain: string,
    /**
     * The domains of your organization. Sign in flows using an email with one of these domains will use the connection.
     */
    readonly domains: string[],
    /**
     * The organization ID of the organization.
     */
    readonly organizationId: string | null,
    /**
     * The Entity ID as provided by the Identity Provider (IdP).
     */
    readonly idpEntityId: string | null,
    /**
     * The Single-Sign On URL as provided by the Identity Provider (IdP).
     */
    readonly idpSsoUrl: string | null,
    /**
     * The X.509 certificate as provided by the Identity Provider (IdP).
     */
    readonly idpCertificate: string | null,
    /**
     * The URL which serves the Identity Provider (IdP) metadata. If present, it takes priority over the corresponding individual properties.
     */
    readonly idpMetadataUrl: string | null,
    /**
     * The XML content of the Identity Provider (IdP) metadata file. If present, it takes priority over the corresponding individual properties.
     */
    readonly idpMetadata: string | null,
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
     * Indicates whether the connection is active or not.
     */
    readonly active: boolean,
    /**
     * The Identity Provider (IdP) of the connection.
     */
    readonly provider: string,
    /**
     * The number of users associated with the connection.
     */
    readonly userCount: number,
    /**
     * Indicates whether the connection syncs user attributes between the Service Provider (SP) and Identity Provider (IdP) or not.
     */
    readonly syncUserAttributes: boolean,
    /**
     * Indicates whether users with an email address subdomain are allowed to use this connection in order to authenticate or not.
     */
    readonly allowSubdomains: boolean,
    /**
     * Indicates whether the connection allows Identity Provider (IdP) initiated flows or not.
     */
    readonly allowIdpInitiated: boolean,
    /**
     * The date when the connection was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the SAML connection was last updated.
     */
    readonly updatedAt: number,
    /**
     * Defines the attribute name mapping between the Identity Provider (IdP) and Clerk's [`User`](https://clerk.com/docs/reference/javascript/user) properties.
     */
    readonly attributeMapping: AttributeMapping,
  ) {}
  static fromJSON(data: SamlConnectionJSON): SamlConnection {
    return new SamlConnection(
      data.id,
      data.name,
      data.domain,
      data.domains,
      data.organization_id,
      data.idp_entity_id,
      data.idp_sso_url,
      data.idp_certificate,
      data.idp_metadata_url,
      data.idp_metadata,
      data.acs_url,
      data.sp_entity_id,
      data.sp_metadata_url,
      data.active,
      data.provider,
      data.user_count,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.allow_idp_initiated,
      data.created_at,
      data.updated_at,
      data.attribute_mapping && AttributeMapping.fromJSON(data.attribute_mapping),
    );
  }
}

export class SamlAccountConnection {
  constructor(
    readonly id: string,
    readonly name: string,
    /**
     * @deprecated Use `domains` array instead. This field will be removed in a future version.
     */
    readonly domain: string,
    readonly domains: string[],
    readonly active: boolean,
    readonly provider: string,
    readonly syncUserAttributes: boolean,
    readonly allowSubdomains: boolean,
    readonly allowIdpInitiated: boolean,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}
  static fromJSON(data: SamlAccountConnectionJSON): SamlAccountConnection {
    return new SamlAccountConnection(
      data.id,
      data.name,
      data.domain,
      data.domains,
      data.active,
      data.provider,
      data.sync_user_attributes,
      data.allow_subdomains,
      data.allow_idp_initiated,
      data.created_at,
      data.updated_at,
    );
  }
}

class AttributeMapping {
  constructor(
    /**
     * The user ID attribute name.
     */
    readonly userId: string,
    /**
     * The email address attribute name.
     */
    readonly emailAddress: string,
    /**
     * The first name attribute name.
     */
    readonly firstName: string,
    /**
     * The last name attribute name.
     */
    readonly lastName: string,
  ) {}

  static fromJSON(data: AttributeMappingJSON): AttributeMapping {
    return new AttributeMapping(data.user_id, data.email_address, data.first_name, data.last_name);
  }
}
