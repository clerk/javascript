import type { OrganizationJSON } from './JSON';

export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string | null,
    readonly imageUrl: string,
    readonly hasImage: boolean,
    readonly createdBy: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly publicMetadata: OrganizationPublicMetadata | null = {},
    readonly privateMetadata: OrganizationPrivateMetadata = {},
    readonly maxAllowedMemberships: number,
    readonly adminDeleteEnabled: boolean,
    readonly members_count?: number,
  ) {}

  static fromJSON(data: OrganizationJSON): Organization {
    return new Organization(
      data.id,
      data.name,
      data.slug,
      data.image_url,
      data.has_image,
      data.created_by,
      data.created_at,
      data.updated_at,
      data.public_metadata,
      data.private_metadata,
      data.max_allowed_memberships,
      data.admin_delete_enabled,
      data.members_count,
    );
  }
}
