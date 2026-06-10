import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { RoleSet } from '../resources/RoleSet';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/role_sets';

type GetRoleSetListParams = ClerkPaginationRequest<{
  /**
   * Returns role sets with ID, name, or key that match the given query.
   * Uses exact match for role set ID and partial match for name and key.
   */
  query?: string;
  /**
   * Allows to return role sets in a particular order.
   * At the moment, you can order the returned role sets by their `created_at`, `name`, or `key`.
   */
  orderBy?: WithSign<'created_at' | 'name' | 'key'>;
}>;

type CreateRoleSetParams = {
  /**
   * The name of the new role set.
   */
  name: string;
  /**
   * A unique key for the role set. Must start with `role_set:` and contain only lowercase
   * alphanumeric characters and underscores. If not provided, a key will be generated from the name.
   */
  key?: string;
  /**
   * Optional description for the role set.
   */
  description?: string | null;
  /**
   * The key of the role to use as the default role for new organization members.
   * Must be one of the roles in the `roles` array.
   */
  defaultRoleKey: string;
  /**
   * The key of the role to assign to organization creators.
   * Must be one of the roles in the `roles` array.
   */
  creatorRoleKey: string;
  /**
   * The type of the role set. `initial` role sets are the default for new organizations.
   * Only one role set can be `initial` per instance.
   */
  type?: 'initial' | 'custom';
  /**
   * Array of role keys to include in the role set. Must contain at least one role and no more than 10 roles.
   */
  roles: string[];
};

type UpdateRoleSetParams = {
  roleSetKeyOrId: string;
  /**
   * The new name for the role set.
   */
  name?: string | null;
  /**
   * A unique key for the role set. Must start with `role_set:` and contain only lowercase
   * alphanumeric characters and underscores.
   */
  key?: string | null;
  /**
   * Optional description for the role set.
   */
  description?: string | null;
  /**
   * Set to `initial` to make this the default role set for new organizations.
   * Only one role set can be `initial` per instance; setting this will change any existing initial role set to `custom`.
   */
  type?: 'initial' | null;
  /**
   * The key of the role to use as the default role for new organization members. Must be an existing role in the role set.
   */
  defaultRoleKey?: string | null;
  /**
   * The key of the role to assign to organization creators. Must be an existing role in the role set.
   */
  creatorRoleKey?: string | null;
};

type AddRolesToRoleSetParams = {
  roleSetKeyOrId: string;
  /**
   * Array of role keys to add to the role set. Must contain at least one role and no more than 10 roles.
   */
  roleKeys: string[];
  /**
   * Optionally update the default role to one of the newly added roles.
   */
  defaultRoleKey?: string;
  /**
   * Optionally update the creator role to one of the newly added roles.
   */
  creatorRoleKey?: string;
};

type ReplaceRoleInRoleSetParams = {
  roleSetKeyOrId: string;
  /**
   * The key of the role to remove from the role set.
   */
  roleKey: string;
  /**
   * The key of the role to reassign members to.
   */
  toRoleKey: string;
};

type ReplaceRoleSetParams = {
  roleSetKeyOrId: string;
  /**
   * The key of the destination role set.
   */
  destRoleSetKey: string;
  /**
   * Mappings from source role keys to destination role keys.
   * Required if members have roles that need to be reassigned.
   */
  reassignmentMappings?: Record<string, string>;
};

export class RoleSetAPI extends AbstractAPI {
  public async getRoleSetList(params: GetRoleSetListParams = {}) {
    return this.request<PaginatedResourceResponse<RoleSet[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async getRoleSet(roleSetKeyOrId: string) {
    this.requireId(roleSetKeyOrId);
    return this.request<RoleSet>({
      method: 'GET',
      path: joinPaths(basePath, roleSetKeyOrId),
    });
  }

  public async createRoleSet(params: CreateRoleSetParams) {
    return this.request<RoleSet>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async updateRoleSet(params: UpdateRoleSetParams) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request<RoleSet>({
      method: 'PATCH',
      path: joinPaths(basePath, roleSetKeyOrId),
      bodyParams,
    });
  }

  public async addRolesToRoleSet(params: AddRolesToRoleSetParams) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request<RoleSet>({
      method: 'POST',
      path: joinPaths(basePath, roleSetKeyOrId, 'roles'),
      bodyParams,
    });
  }

  public async replaceRoleInRoleSet(params: ReplaceRoleInRoleSetParams) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request<RoleSet>({
      method: 'POST',
      path: joinPaths(basePath, roleSetKeyOrId, 'roles', 'replace'),
      bodyParams,
    });
  }

  public async replaceRoleSet(params: ReplaceRoleSetParams) {
    const { roleSetKeyOrId, ...bodyParams } = params;
    this.requireId(roleSetKeyOrId);
    return this.request<DeletedObject>({
      method: 'POST',
      path: joinPaths(basePath, roleSetKeyOrId, 'replace'),
      bodyParams,
    });
  }
}
