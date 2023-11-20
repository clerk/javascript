import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources';
import type { OrganizationRole } from '../resources/OrganizationRole';
import { AbstractAPI } from './AbstractApi';

const basePath = '/organizations_roles';

type GetOrganizationRoleListParams = {
  limit?: number;
  offset?: number;
};

type CreateParams = {
  name: string;
  key: string;
  description: string;
  permissions: string[];
};

type GetOrganizationRoleParams = { roleId: string };

type UpdateParams = {
  name?: string;
  description?: string;
  //TODO(@pantelis): Will this override or union ?
  permissions?: string[];
};

type RemovePermissionParams = {
  permissionId: string;
  roleId: string;
};

type AssignPermissionParams = RemovePermissionParams;

export class OrganizationRoleAPI extends AbstractAPI {
  public async getOrganizationRoleList(params?: GetOrganizationRoleListParams) {
    return this.request<OrganizationRole[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createOrganizationRole(params: CreateParams) {
    return this.request<OrganizationRole>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async getOrganizationRole(params: GetOrganizationRoleParams) {
    this.requireId(params.roleId);

    return this.request<OrganizationRole>({
      method: 'GET',
      path: joinPaths(basePath, params.roleId),
    });
  }

  public async updateOrganizationRole(roleId: string, params: UpdateParams) {
    this.requireId(roleId);
    return this.request<OrganizationRole>({
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
    return this.request<OrganizationRole>({
      method: 'POST',
      path: joinPaths(basePath, roleId, 'permission', permissionId),
    });
  }

  public async removePermissionFromRole(params: RemovePermissionParams) {
    const { roleId, permissionId } = params;
    this.requireId(roleId);
    this.requireId(permissionId);
    return this.request<OrganizationRole>({
      method: 'DELETE',
      path: joinPaths(basePath, roleId, 'permission', permissionId),
    });
  }
}
