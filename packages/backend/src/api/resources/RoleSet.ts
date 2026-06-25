import type { RoleSetItemJSON, RoleSetJSON, RoleSetMigrationJSON } from './JSON';

/**
 * The Backend `RoleSetItem` object represents a role that belongs to a {@link RoleSet}.
 */
export class RoleSetItem {
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
     * The unique key of the role.
     */
    readonly key: string,
    /**
     * A description of the role.
     */
    readonly description: string | null,
    /**
     * The date when the role was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the role was last updated.
     */
    readonly updatedAt: number,
    /**
     * The number of organization members that have this role.
     */
    readonly membersCount?: number | null,
    /**
     * Whether any organization members have this role.
     */
    readonly hasMembers?: boolean | null,
  ) {}

  static fromJSON(data: RoleSetItemJSON): RoleSetItem {
    return new RoleSetItem(
      data.id,
      data.name,
      data.key,
      data.description,
      data.created_at,
      data.updated_at,
      data.members_count,
      data.has_members,
    );
  }
}

/**
 * The Backend `RoleSetMigration` object holds information about an in-progress migration between role sets.
 */
export class RoleSetMigration {
  constructor(
    readonly id: string,
    readonly organizationId: string | null,
    readonly instanceId: string,
    readonly sourceRoleSetId: string,
    readonly destRoleSetId: string | null,
    readonly triggerType: string,
    readonly status: string,
    readonly migratedMembers: number,
    readonly mappings: Record<string, string> | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly startedAt?: number,
    readonly completedAt?: number,
  ) {}

  static fromJSON(data: RoleSetMigrationJSON): RoleSetMigration {
    return new RoleSetMigration(
      data.id,
      data.organization_id,
      data.instance_id,
      data.source_role_set_id,
      data.dest_role_set_id,
      data.trigger_type,
      data.status,
      data.migrated_members,
      data.mappings,
      data.created_at,
      data.updated_at,
      data.started_at,
      data.completed_at,
    );
  }
}

/**
 * The Backend `RoleSet` object represents a collection of roles that can be assigned to organization members.
 */
export class RoleSet {
  constructor(
    /**
     * The unique identifier for the role set.
     */
    readonly id: string,
    /**
     * The name of the role set.
     */
    readonly name: string,
    /**
     * The unique key of the role set.
     */
    readonly key: string,
    /**
     * A description of the role set.
     */
    readonly description: string | null,
    /**
     * The roles that belong to the role set.
     */
    readonly roles: RoleSetItem[],
    /**
     * The default role assigned to new organization members.
     */
    readonly defaultRole: RoleSetItem | null,
    /**
     * The role assigned to the creator of an organization.
     */
    readonly creatorRole: RoleSetItem | null,
    /**
     * The type of the role set. `initial` role sets are the default for new organizations.
     */
    readonly type: 'initial' | 'custom',
    /**
     * Active migration information, only present when a migration is in progress.
     */
    readonly roleSetMigration: RoleSetMigration | null,
    /**
     * The date when the role set was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the role set was last updated.
     */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: RoleSetJSON): RoleSet {
    return new RoleSet(
      data.id,
      data.name,
      data.key,
      data.description,
      (data.roles ?? []).map(role => RoleSetItem.fromJSON(role)),
      data.default_role ? RoleSetItem.fromJSON(data.default_role) : null,
      data.creator_role ? RoleSetItem.fromJSON(data.creator_role) : null,
      data.type,
      data.role_set_migration ? RoleSetMigration.fromJSON(data.role_set_migration) : null,
      data.created_at,
      data.updated_at,
    );
  }
}
