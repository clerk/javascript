import type { PermissionType } from './Enums';
import type { PermissionJSON } from './JSON';

export class Permission {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly key: string,
    readonly description: string,
    readonly type: PermissionType,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: PermissionJSON) {
    return new Permission(data.id, data.name, data.key, data.description, data.type, data.created_at, data.updated_at);
  }
}
