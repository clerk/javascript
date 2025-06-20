import type { PermissionJSON, PermissionResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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
    Object.assign(
      this,
      parseJSON<PermissionResource>(data, {
        dateFields: ['createdAt', 'updatedAt'],
      }),
    );
    return this;
  }
}
