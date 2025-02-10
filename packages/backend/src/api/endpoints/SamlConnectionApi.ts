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
  organizationId?: string;
  idpEntityId?: string;
  idpSsoUrl?: string;
  idpCertificate?: string;
  idpMetadataUrl?: string;
  idpMetadata?: string;
  attributeMapping?: {
    emailAddress?: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
  };
};

type UpdateSamlConnectionParams = {
  name?: string;
  provider?: SamlIdpSlug;
  domain?: string;
  organizationId?: string;
  idpEntityId?: string;
  idpSsoUrl?: string;
  idpCertificate?: string;
  idpMetadataUrl?: string;
  idpMetadata?: string;
  attributeMapping?: {
    emailAddress?: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
  };
  active?: boolean;
  syncUserAttributes?: boolean;
  allowSubdomains?: boolean;
  allowIdpInitiated?: boolean;
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
