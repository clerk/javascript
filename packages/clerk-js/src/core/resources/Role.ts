import type { RoleJSON, RoleResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class Role extends BaseResource implements RoleResource {
  id!: string;
  key!: string;
  name!: string;
  description!: string;
  permissions: string[] = [];
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
    this.permissions = data.permissions;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}
