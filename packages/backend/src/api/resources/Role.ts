import type { RoleJSON } from './JSON';
import { Permission } from './Permission';

/**
 * The Backend `Role` object represents an organization role that can be assigned to organization members.
 */
export class Role {
  constructor(
    /**
     * The unique identifier for the role.
     */
    readonly id: string,
    /**
     * The name of the role.
     */
    readonly name: string,
    /**
     * The unique key of the role, in the format `org:role`.
     */
    readonly key: string,
    /**
     * A description of the role.
     */
    readonly description: string | null,
    /**
     * The permissions assigned to the role.
     */
    readonly permissions: Permission[],
    /**
     * Whether this role is eligible to be an organization creator role.
     */
    readonly isCreatorEligible: boolean,
    /**
     * The date when the role was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the role was last updated.
     */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: RoleJSON): Role {
    return new Role(
      data.id,
      data.name,
      data.key,
      data.description,
      (data.permissions ?? []).map(permission => Permission.fromJSON(permission)),
      data.is_creator_eligible,
      data.created_at,
      data.updated_at,
    );
  }
}
