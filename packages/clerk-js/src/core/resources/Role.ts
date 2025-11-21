import type { RoleJSON, RoleResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';
import { Permission } from './Permission';

export class Role extends BaseResource implements RoleResource {
  id!: string;
  key!: string;
  name!: string;
  description!: string;
  permissions: Permission[] = [];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: RoleJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: RoleJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;
    this.permissions = data.permissions.map(perm => new Permission(perm));
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}
