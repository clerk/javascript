import type { OrganizationJSON } from './JSON';

/**
 * The Backend `Organization` object is similar to the [`Organization`](https://clerk.com/docs/references/javascript/organization) object as it holds information about an organization, as well as methods for managing it. However, the Backend `Organization` object is different in that it is used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/ListOrganizations){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 */
export class Organization {
  private _raw: OrganizationJSON | null = null;

  public get raw(): OrganizationJSON | null {
    return this._raw;
  }

  constructor(
    /**
     * The unique identifier for the organization.
     */
    readonly id: string,
    /**
     * The name of the organization.
     */
    readonly name: string,
    /**
     * The URL-friendly identifier of the user's active organization. If supplied, it must be unique for the instance.
     */
    readonly slug: string,
    /**
     * Holds the organization's logo. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/image-optimization).
     */
    readonly imageUrl: string,
    /**
     * Whether the organization has an image.
     */
    readonly hasImage: boolean,
    /**
     * The date when the organization was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the organization was last updated.
     */
    readonly updatedAt: number,
    /**
     * Metadata that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API.
     */
    readonly publicMetadata: OrganizationPublicMetadata | null = {},
    /**
     * Metadata that can be read and set only from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
     */
    readonly privateMetadata: OrganizationPrivateMetadata = {},
    /**
     * The maximum number of memberships allowed in the organization.
     */
    readonly maxAllowedMemberships: number,
    /**
     * Whether the organization allows admins to delete users.
     */
    readonly adminDeleteEnabled: boolean,
    /**
     * The number of members in the organization.
     */
    readonly membersCount?: number,
    /**
     * The ID of the user who created the organization.
     */
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
