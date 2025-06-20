import type { RoleJSON, RoleResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';
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

    Object.assign(
      this,
      parseJSON<RoleResource>(data, {
        dateFields: ['createdAt', 'updatedAt'],
        arrayFields: {
          permissions: Permission,
        },
      }),
    );
    return this;
  }
}
