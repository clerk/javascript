import type { PermissionJSON } from './JSON';

/**
 * The Backend `Permission` object represents an organization permission that can be assigned to organization roles.
 */
export class Permission {
  constructor(
    /** The unique identifier for the permission. */
    readonly id: string,
    /** The name of the permission. */
    readonly name: string,
    /** The unique key of the permission, in the format `org:feature:action`. */
    readonly key: string,
    /** A description of the permission. */
    readonly description: string,
    /** The Unix timestamp when the permission was first created. */
    readonly createdAt: number,
    /** The Unix timestamp when the permission was last updated. */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: PermissionJSON): Permission {
    return new Permission(data.id, data.name, data.key, data.description, data.created_at, data.updated_at);
  }
}
