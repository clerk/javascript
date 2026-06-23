import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { EnterpriseConnection } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/enterprise_connections';

/** @generateWithEmptyComment */
export type EnterpriseConnectionListParams = ClerkPaginationRequest<{
  /**
   * Filters enterprise connections by Organization ID.
   */
  organizationId?: string;
  /**
   * Filters enterprise connections by active status. If `true`, only active connections are returned. If `false`, only inactive connections are returned. If omitted, all connections are returned.
   */
  active?: boolean;
}>;

/** @inline */
export interface EnterpriseConnectionOidcParams {
  /** The OAuth (OIDC) authorization URL. */
  authUrl?: string;
  /** The OAuth (OIDC) client ID. */
  clientId?: string;
  /** The OAuth (OIDC) client secret. */
  clientSecret?: string;
  /** The OAuth (OIDC) discovery URL. */
  discoveryUrl?: string;
  /** Whether the OAuth (OIDC) requires PKCE. Must be `true` for public clients with no client secret. */
  requiresPkce?: boolean;
  /** The OAuth (OIDC) token URL. */
  tokenUrl?: string;
  /** The OAuth (OIDC) user info URL. */
  userInfoUrl?: string;
}

/** @inline */
export interface EnterpriseConnectionSamlAttributeMappingParams {
  /** The attribute mapping for the user ID. */
  userId?: string | null;
  /** The attribute mapping for the email address. */
  emailAddress?: string | null;
  /** The attribute mapping for the first name. */
  firstName?: string | null;
  /** The attribute mapping for the last name. */
  lastName?: string | null;
}

/** @inline */
export interface EnterpriseConnectionSamlParams {
  /** Whether the SAML connection allows Identity Provider (IdP) initiated flows. */
  allowIdpInitiated?: boolean;
  /** Whether the SAML connection allows users with an email address subdomain to use it. */
  allowSubdomains?: boolean;
  /** The attribute mapping for the SAML connection. */
  attributeMapping?: EnterpriseConnectionSamlAttributeMappingParams;
  /** Whether the SAML connection requires force authentication. */
  forceAuthn?: boolean;
  /** The IdP certificate (PEM) for the SAML connection. */
  idpCertificate?: string;
  /** The IdP Entity ID for the SAML connection. */
  idpEntityId?: string;
  /** The raw IdP metadata XML for the SAML connection. */
  idpMetadata?: string;
  /** The IdP metadata URL for the SAML connection. */
  idpMetadataUrl?: string;
  /** The IdP Single-Sign On URL for the SAML connection. */
  idpSsoUrl?: string;
}

/** @generateWithEmptyComment */
export type CreateEnterpriseConnectionParams = {
  /** The name of the enterprise connection. */
  name?: string;
  /** The [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) of the enterprise connection. */
  domains?: string[];
  /** The organization ID of the enterprise connection. */
  organizationId?: string;
  /** Whether the enterprise connection should be active. */
  active?: boolean;
  /** Whether the enterprise connection should sync user attributes between the IdP and Clerk. */
  syncUserAttributes?: boolean;
  /** Configuration for if the enterprise connection uses OAuth (OIDC). */
  oidc?: EnterpriseConnectionOidcParams;
  /** Configuration for if the enterprise connection uses SAML. */
  saml?: EnterpriseConnectionSamlParams;
};

/** @inline */
export type UpdateEnterpriseConnectionParams = {
  /** The name of the enterprise connection. */
  name?: string;
  /** The [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) of the enterprise connection. */
  domains?: string[];
  /** The organization ID of the enterprise connection. */
  organizationId?: string;
  /** Whether the enterprise connection should be active. */
  active?: boolean;
  /** Whether the enterprise connection should sync user attributes between the IdP and Clerk. */
  syncUserAttributes?: boolean;
  /** The identity provider (IdP) of the enterprise connection. For example, `'saml_custom'` or `'oidc_custom'`. */
  provider?: string;
  /** Configuration for if the enterprise connection uses OAuth (OIDC). */
  oidc?: EnterpriseConnectionOidcParams;
  /** Configuration for if the enterprise connection uses SAML. */
  saml?: EnterpriseConnectionSamlParams;
};

/** @generateWithEmptyComment */
export class EnterpriseConnectionAPI extends AbstractAPI {
  /**
   * Creates a new enterprise connection.
   * @returns The created [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  public async createEnterpriseConnection(params: CreateEnterpriseConnectionParams) {
    return this.request<EnterpriseConnection>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true,
      },
    });
  }

  /**
   * Updates the given enterprise connection.
   * @param enterpriseConnectionId - The ID of the enterprise connection to update.
   * @param params - The parameters to update the enterprise connection.
   * @returns The updated [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  public async updateEnterpriseConnection(enterpriseConnectionId: string, params: UpdateEnterpriseConnectionParams) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'PATCH',
      path: joinPaths(basePath, enterpriseConnectionId),
      bodyParams: params,
      options: {
        deepSnakecaseBodyParamKeys: true,
      },
    });
  }

  /**
   * Gets a list of enterprise connections for the instance.
   * @returns The list of [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) objects.
   */
  public async getEnterpriseConnectionList(params: EnterpriseConnectionListParams = {}) {
    return this.request<PaginatedResourceResponse<EnterpriseConnection[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  /**
   * Gets the given enterprise connection.
   * @param enterpriseConnectionId - The ID of the enterprise connection to get.
   * @returns The [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  public async getEnterpriseConnection(enterpriseConnectionId: string) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'GET',
      path: joinPaths(basePath, enterpriseConnectionId),
    });
  }

  /**
   * Deletes the given enterprise connection.
   * @param enterpriseConnectionId - The ID of the enterprise connection to delete.
   * @returns The deleted [`EnterpriseConnection`](https://clerk.com/docs/reference/backend/types/backend-enterprise-connection) object.
   */
  public async deleteEnterpriseConnection(enterpriseConnectionId: string) {
    this.requireId(enterpriseConnectionId);
    return this.request<EnterpriseConnection>({
      method: 'DELETE',
      path: joinPaths(basePath, enterpriseConnectionId),
    });
  }
}
