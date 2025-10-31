import type { ClerkPaginationRequest, SamlIdpSlug } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { SamlConnection } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/saml_connections';

type SamlConnectionListParams = ClerkPaginationRequest<{
  /**
   * Returns SAML connections that have a name that matches the given query, via case-insensitive partial match.
   */
  query?: string;

  /**
   * Sorts SAML connections by phone_number, email_address, created_at, first_name, last_name or username.
   * By prepending one of those values with + or -, we can choose to sort in ascending (ASC) or descending (DESC) order.
   */
  orderBy?: WithSign<'phone_number' | 'email_address' | 'created_at' | 'first_name' | 'last_name' | 'username'>;

  /**
   * Returns SAML connections that have an associated organization ID to the given organizations.
   * For each organization id, the + and - can be prepended to the id, which denote whether the
   * respective organization should be included or excluded from the result set. Accepts up to 100 organization ids.
   */
  organizationId?: WithSign<string>[];
}>;

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
    return this.request<PaginatedResourceResponse<SamlConnection[]>>({
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
      options: {
        deepSnakecaseBodyParamKeys: true,
      },
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
      options: {
        deepSnakecaseBodyParamKeys: true,
      },
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
