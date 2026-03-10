import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { EnterpriseConnection } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/enterprise_connections';

type EnterpriseConnectionListParams = ClerkPaginationRequest<{
  organizationId?: string;
  active?: boolean;
}>;

export interface EnterpriseConnectionOidcParams {
  authUrl?: string;
  clientId?: string;
  clientSecret?: string;
  discoveryUrl?: string;
  requiresPkce?: boolean;
  tokenUrl?: string;
  userInfoUrl?: string;
}

export interface EnterpriseConnectionSamlAttributeMappingParams {
  userId?: string | null;
  emailAddress?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface EnterpriseConnectionSamlParams {
  allowIdpInitiated?: boolean;
  allowSubdomains?: boolean;
  attributeMapping?: EnterpriseConnectionSamlAttributeMappingParams;
  forceAuthn?: boolean;
  idpCertificate?: string;
  idpEntityId?: string;
  idpMetadata?: string;
  idpMetadataUrl?: string;
  idpSsoUrl?: string;
}

type CreateEnterpriseConnectionParams = {
  name?: string;
  domains?: string[];
  organizationId?: string;
  active?: boolean;
  syncUserAttributes?: boolean;
  oidc?: EnterpriseConnectionOidcParams;
  saml?: EnterpriseConnectionSamlParams;
};

type UpdateEnterpriseConnectionParams = {
  name?: string;
  domains?: string[];
  organizationId?: string;
  active?: boolean;
  syncUserAttributes?: boolean;
  provider?: string;
  oidc?: EnterpriseConnectionOidcParams;
  saml?: EnterpriseConnectionSamlParams;
};

export class EnterpriseConnectionAPI extends AbstractAPI {
  public async createEnterpriseConnection(params: CreateEnterpriseConnectionParams) {
    return this.request<EnterpriseConnection>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateEnterpriseConnection(enterpriseConnectionId: string, params: UpdateEnterpriseConnectionParams) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'PATCH',
      path: joinPaths(basePath, enterpriseConnectionId),
      bodyParams: params,
    });
  }

  public async getEnterpriseConnectionList(params: EnterpriseConnectionListParams = {}) {
    return this.request<PaginatedResourceResponse<EnterpriseConnection[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getEnterpriseConnection(enterpriseConnectionId: string) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'GET',
      path: joinPaths(basePath, enterpriseConnectionId),
    });
  }

  public async deleteEnterpriseConnection(enterpriseConnectionId: string) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'DELETE',
      path: joinPaths(basePath, enterpriseConnectionId),
    });
  }
}
