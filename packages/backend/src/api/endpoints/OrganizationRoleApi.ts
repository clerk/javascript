import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Role } from '../resources/Role';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/organization_roles';

type GetOrganizationRoleListParams = ClerkPaginationRequest<{
  /**
   * Returns organization roles with ID, name, or key that match the given query.
   * Uses exact match for organization role ID and partial match for name and key.
   */
  query?: string;
  /**
   * Allows to return organization roles in a particular order.
   * At the moment, you can order the returned organization roles by their `created_at`, `name`, or `key`.
   */
  orderBy?: WithSign<'created_at' | 'name' | 'key'>;
}>;

type CreateOrganizationRoleParams = {
  /**
   * The name of the new organization role.
   */
  name: string;
  /**
   * A unique key for the organization role. Must start with `org:` and contain only lowercase
   * alphanumeric characters and underscores.
   */
  key: string;
  /**
   * Optional description for the role.
   */
  description?: string | null;
  /**
   * Array of permission IDs to assign to the role.
   */
  permissions?: string[] | null;
  /**
   * Whether this role should be included in the initial role set.
   */
  includeInInitialRoleSet?: boolean | null;
};

type UpdateOrganizationRoleParams = {
  organizationRoleId: string;
  /**
   * The new name for the organization role.
   */
  name?: string | null;
  /**
   * A unique key for the organization role. Must start with `org:` and contain only lowercase
   * alphanumeric characters and underscores.
   */
  key?: string | null;
  /**
   * Optional description for the role.
   */
  description?: string | null;
  /**
   * Array of permission IDs to assign to the role. If provided, this will replace the existing permissions.
   */
  permissions?: string[] | null;
};

type OrganizationRolePermissionParams = {
  organizationRoleId: string;
  permissionId: string;
};

export class OrganizationRoleAPI extends AbstractAPI {
  public async getOrganizationRoleList(params: GetOrganizationRoleListParams = {}) {
    return this.request<PaginatedResourceResponse<Role[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getOrganizationRole(organizationRoleId: string) {
    this.requireId(organizationRoleId);
    return this.request<Role>({
      method: 'GET',
      path: joinPaths(basePath, organizationRoleId),
    });
  }

  public async createOrganizationRole(params: CreateOrganizationRoleParams) {
    return this.request<Role>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateOrganizationRole(params: UpdateOrganizationRoleParams) {
    const { organizationRoleId, ...bodyParams } = params;
    this.requireId(organizationRoleId);
    return this.request<Role>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationRoleId),
      bodyParams,
    });
  }

  public async deleteOrganizationRole(organizationRoleId: string) {
    this.requireId(organizationRoleId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationRoleId),
    });
  }

  public async assignPermissionToOrganizationRole(params: OrganizationRolePermissionParams) {
    const { organizationRoleId, permissionId } = params;
    this.requireId(organizationRoleId);
    this.requireId(permissionId);
    return this.request<Role>({
      method: 'POST',
      path: joinPaths(basePath, organizationRoleId, 'permissions', permissionId),
    });
  }

  public async removePermissionFromOrganizationRole(params: OrganizationRolePermissionParams) {
    const { organizationRoleId, permissionId } = params;
    this.requireId(organizationRoleId);
    this.requireId(permissionId);
    return this.request<Role>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationRoleId, 'permissions', permissionId),
    });
  }
}
