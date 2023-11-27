import type { RoleJSON } from './JSON';
import { Permission } from './Permission';

export class Role {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly key: string,
    readonly description: string,
    readonly permissions: Permission[] = [],
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: RoleJSON): Role {
    return new Role(
      data.id,
      data.name,
      data.key,
      data.description,
      (data.permissions || []).map(x => Permission.fromJSON(x)),
      data.created_at,
      data.updated_at,
    );
  }
}
