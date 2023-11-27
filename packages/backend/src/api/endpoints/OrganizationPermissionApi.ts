import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject, Permission } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/organizations_permissions';

type GetOrganizationPermissionListParams = ClerkPaginationRequest<{
  query?: string;
  orderBy?: string;
}>;

type CreateParams = {
  name: string;
  key: string;
  description: string;
};

type GetOrganizationPermissionParams = { permissionId: string };

type UpdateParams = {
  name?: string;
  key?: string;
  description?: string;
};

export class OrganizationPermissionAPI extends AbstractAPI {
  public async getOrganizationPermissionList(params?: GetOrganizationPermissionListParams) {
    return this.request<Permission[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createOrganizationPermission(params: CreateParams) {
    return this.request<Permission>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async getOrganizationPermission(params: GetOrganizationPermissionParams) {
    this.requireId(params.permissionId);

    return this.request<Permission>({
      method: 'GET',
      path: joinPaths(basePath, params.permissionId),
    });
  }

  public async updateOrganizationPermission(permissionId: string, params: UpdateParams) {
    this.requireId(permissionId);
    return this.request<Permission>({
      method: 'PATCH',
      path: joinPaths(basePath, permissionId),
      bodyParams: params,
    });
  }

  public async deleteOrganizationPermission(permissionId: string) {
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, permissionId),
    });
  }
}
