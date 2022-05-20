import type { OrganizationJSON } from './JSON';

export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string | null,
    readonly logoUrl: string | null,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly publicMetadata: Record<string, unknown> | null = {},
    readonly privateMetadata: Record<string, unknown> = {},
  ) {}

  static fromJSON(data: OrganizationJSON): Organization {
    return new Organization(
      data.id,
      data.name,
      data.slug,
      data.logo_url,
      data.created_at,
      data.updated_at,
      data.public_metadata,
      data.private_metadata,
    );
  }
}
