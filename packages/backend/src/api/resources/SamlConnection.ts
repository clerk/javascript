import type { AttributeMapping } from './AttributeMapping';
import type { SamlConnectionJSON } from './JSON';

export class SamlConnection {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly domain: string,
    readonly idp_entity_id: string,
    readonly idp_sso_url: string,
    readonly idp_certificate: string,
    readonly idp_metadata_url: string,
    readonly acs_url: string,
    readonly sp_entity_id: string,
    readonly sp_metadata_url: string,
    readonly active: boolean,
    readonly provider: string,
    readonly user_count: number,
    readonly sync_user_attributes: boolean,
    readonly allow_subdomains: boolean,
    readonly allow_idp_initiated: boolean,
    readonly created_at: number,
    readonly updated_at: number,
    readonly attribute_mapping: AttributeMapping,
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
      data.attribute_mapping,
    );
  }
}
