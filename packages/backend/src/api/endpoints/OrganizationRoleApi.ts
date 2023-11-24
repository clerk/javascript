import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject, Role } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/organizations_roles';

type GetRoleListParams = ClerkPaginationRequest<{
  query?: string;
  order_by?: string;
}>;

type CreateParams = {
  /**
   * A name of a role in a readable friendly format.
   * F.e. `Teacher` or `Administrator`
   */
  name: string;

  /**
   * A unique identifier that represents the role.
   * F.e. `org:administrator`
   */
  key: string;

  /**
   * A brief description of what the role represents or its intended use.
   */
  description: string;

  /**
   * An array of permission ids that will be assigned to this role.
   */
  permissions: string[];
};

type GetOrganizationRoleParams = { roleId: string };

type UpdateParams = {
  /**
   * A name of a role in a readable friendly format.
   * F.e. `Teacher` or `Administrator`
   * Passing undefined has no effect to the existing value.
   */
  name?: string;

  /**
   * A unique identifier that represents the role.
   * F.e. `org:administrator`
   * Passing undefined has no effect to the existing value.
   */
  key?: string;

  /**
   * A brief description of what the role represents or its intended use.
   * Passing undefined has no effect to the existing value.
   */
  description?: string;

  /**
   * An array of permission ids that will be assigned to this role.
   * Passing undefined has no effect to the permission that already exist.
   * Passing an empty array will override the existing permissions.
   */
  permissions?: string[];
};

type RemovePermissionParams = {
  permissionId: string;
  roleId: string;
};

type AssignPermissionParams = RemovePermissionParams;

export class OrganizationRoleAPI extends AbstractAPI {
  public async getOrganizationRoleList(params?: GetRoleListParams) {
    return this.request<Role[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createOrganizationRole(params: CreateParams) {
    return this.request<Role>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async getOrganizationRole(params: GetOrganizationRoleParams) {
    this.requireId(params.roleId);

    return this.request<Role>({
      method: 'GET',
      path: joinPaths(basePath, params.roleId),
    });
  }

  public async updateOrganizationRole(roleId: string, params: UpdateParams) {
    this.requireId(roleId);
    return this.request<Role>({
      method: 'PATCH',
      path: joinPaths(basePath, roleId),
      bodyParams: params,
    });
  }

  public async deleteOrganizationRole(roleId: string) {
    this.requireId(roleId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, roleId),
    });
  }

  public async assignPermissionToRole(params: AssignPermissionParams) {
    const { roleId, permissionId } = params;
    this.requireId(roleId);
    this.requireId(permissionId);
    return this.request<Role>({
      method: 'POST',
      path: joinPaths(basePath, roleId, 'permission', permissionId),
    });
  }

  public async removePermissionFromRole(params: RemovePermissionParams) {
    const { roleId, permissionId } = params;
    this.requireId(roleId);
    this.requireId(permissionId);
    return this.request<Role>({
      method: 'DELETE',
      path: joinPaths(basePath, roleId, 'permission', permissionId),
    });
  }
}
