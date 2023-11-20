import type { OrganizationRoleJSON } from './JSON';

export class OrganizationRole {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly key: string,
    readonly description: string,
    readonly permissions: string[],
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: OrganizationRoleJSON): OrganizationRole {
    return new OrganizationRole(
      data.id,
      data.name,
      data.key,
      data.description,
      data.permissions,
      data.created_at,
      data.updated_at,
    );
  }
}
