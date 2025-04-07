import type { OrganizationJSON } from './JSON';

export class Organization {
  private _raw: OrganizationJSON | null = null;

  public get raw(): OrganizationJSON | null {
    return this._raw;
  }

  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string | null,
    readonly imageUrl: string,
    readonly hasImage: boolean,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly publicMetadata: OrganizationPublicMetadata | null = {},
    readonly privateMetadata: OrganizationPrivateMetadata = {},
    readonly maxAllowedMemberships: number,
    readonly adminDeleteEnabled: boolean,
    readonly membersCount?: number,
    readonly createdBy?: string,
  ) {}

  static fromJSON(data: OrganizationJSON): Organization {
    const res = new Organization(
      data.id,
      data.name,
      data.slug,
      data.image_url || '',
      data.has_image,
      data.created_at,
      data.updated_at,
      data.public_metadata,
      data.private_metadata,
      data.max_allowed_memberships,
      data.admin_delete_enabled,
      data.members_count,
      data.created_by,
    );
    res._raw = data;
    return res;
  }
}
