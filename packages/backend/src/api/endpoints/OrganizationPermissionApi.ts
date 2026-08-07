import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Permission } from '../resources/Permission';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/organization_permissions';

type GetOrganizationPermissionListParams = ClerkPaginationRequest<{
  /**
   * Returns organization permissions with ID, name, or key that match the given query.
   * Uses exact match for permission ID and partial match for name and key.
   */
  query?: string;
  /**
   * Allows to return organization permissions in a particular order.
   * At the moment, you can order the returned permissions by their `created_at`, `name`, or `key`.
   */
  orderBy?: WithSign<'created_at' | 'name' | 'key'>;
}>;

type CreateOrganizationPermissionParams = {
  /**
   * The name of the permission.
   */
  name: string;
  /**
   * The key of the permission. Must have the format `org:feature:action`, for example `org:billing:manage`.
   * Cannot begin with `org:sys_` as that prefix is reserved for system permissions.
   */
  key: string;
  /**
   * A description of the permission.
   */
  description?: string;
};

type UpdateOrganizationPermissionParams = {
  permissionId: string;
} & Partial<CreateOrganizationPermissionParams>;

export class OrganizationPermissionAPI extends AbstractAPI {
  public async getOrganizationPermissionList(params: GetOrganizationPermissionListParams = {}) {
    return this.request<PaginatedResourceResponse<Permission[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getOrganizationPermission(permissionId: string) {
    this.requireId(permissionId);
    return this.request<Permission>({
      method: 'GET',
      path: joinPaths(basePath, permissionId),
    });
  }

  public async createOrganizationPermission(params: CreateOrganizationPermissionParams) {
    return this.request<Permission>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateOrganizationPermission(params: UpdateOrganizationPermissionParams) {
    const { permissionId, ...bodyParams } = params;
    this.requireId(permissionId);
    return this.request<Permission>({
      method: 'PATCH',
      path: joinPaths(basePath, permissionId),
      bodyParams,
    });
  }

  public async deleteOrganizationPermission(permissionId: string) {
    this.requireId(permissionId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, permissionId),
    });
  }
}
