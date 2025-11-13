import type { PermissionJSON, PermissionResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class Permission extends BaseResource implements PermissionResource {
  id!: string;
  key!: string;
  name!: string;
  description!: string;
  type!: 'system' | 'user';
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: PermissionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: PermissionJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}
