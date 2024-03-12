import type { SamlIdpSlug } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { SamlConnection } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/saml_connections';

type SamlConnectionListParams = {
  limit?: number;
  offset?: number;
};
type CreateSamlConnectionParams = {
  name: string;
  provider: SamlIdpSlug;
  domain: string;
  idp_entity_id?: string;
  idp_sso_url?: string;
  idp_certificate?: string;
  idp_metadata_url?: string;
  attribute_mapping?: {
    email_address?: string;
    first_name?: string;
    last_name?: string;
    user_id?: string;
  };
};

type UpdateSamlConnectionParams = {
  name?: string;
  provider?: SamlIdpSlug;
  domain?: string;
  idp_entity_id?: string;
  idp_sso_url?: string;
  idp_certificate?: string;
  idp_metadata_url?: string;
  attribute_mapping?: {
    email_address?: string;
    first_name?: string;
    last_name?: string;
    user_id?: string;
  };
  active?: boolean;
  sync_user_attributes?: boolean;
  allow_subdomains?: boolean;
  allow_idp_initiated?: boolean;
};

export class SamlConnectionAPI extends AbstractAPI {
  public async getSamlConnectionList(params: SamlConnectionListParams = {}) {
    return this.request<SamlConnection[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createSamlConnection(params: CreateSamlConnectionParams) {
    return this.request<SamlConnection>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async getSamlConnection(samlConnectionId: string) {
    this.requireId(samlConnectionId);
    return this.request<SamlConnection>({
      method: 'GET',
      path: joinPaths(basePath, samlConnectionId),
    });
  }

  public async updateSamlConnection(samlConnectionId: string, params: UpdateSamlConnectionParams = {}) {
    this.requireId(samlConnectionId);

    return this.request<SamlConnection>({
      method: 'PATCH',
      path: joinPaths(basePath, samlConnectionId),
      bodyParams: params,
    });
  }
  public async deleteSamlConnection(samlConnectionId: string) {
    this.requireId(samlConnectionId);
    return this.request<SamlConnection>({
      method: 'DELETE',
      path: joinPaths(basePath, samlConnectionId),
    });
  }
}
