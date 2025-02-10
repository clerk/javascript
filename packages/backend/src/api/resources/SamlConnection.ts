import type { AttributeMappingJSON, SamlAccountConnectionJSON, SamlConnectionJSON } from './JSON';

export class SamlConnection {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly domain: string,
    readonly organizationId: string | null,
    readonly idpEntityId: string | null,
    readonly idpSsoUrl: string | null,
    readonly idpCertificate: string | null,
    readonly idpMetadataUrl: string | null,
    readonly idpMetadata: string | null,
    readonly acsUrl: string,
    readonly spEntityId: string,
    readonly spMetadataUrl: string,
    readonly active: boolean,
    readonly provider: string,
    readonly userCount: number,
    readonly syncUserAttributes: boolean,
    readonly allowSubdomains: boolean,
    readonly allowIdpInitiated: boolean,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly attributeMapping: AttributeMapping,
  ) {}
  static fromJSON(data: SamlConnectionJSON): SamlConnection {
    return new SamlConnection(
      data.id,
      data.name,
      data.domain,
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
    readonly domain: string,
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
    readonly userId: string,
    readonly emailAddress: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {}

  static fromJSON(data: AttributeMappingJSON): AttributeMapping {
    return new AttributeMapping(data.user_id, data.email_address, data.first_name, data.last_name);
  }
}
