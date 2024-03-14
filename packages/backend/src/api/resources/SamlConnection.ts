import { AttributeMapping } from './AttributeMapping';
import type { SamlConnectionJSON } from './JSON';

export class SamlConnection {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly domain: string,
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
    readonly attributeMapping: AttributeMapping | null,
  ) {}
  static fromJSON(data: SamlConnectionJSON): SamlConnection {
    return new SamlConnection(
      data.id,
      data.name,
      data.domain,
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
