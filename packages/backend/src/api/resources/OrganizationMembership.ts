import { Organization } from '../resources';
import type { OrganizationMembershipRole } from './Enums';
import type { OrganizationMembershipJSON, OrganizationMembershipPublicUserDataJSON } from './JSON';

/**
 * The Backend `OrganizationMembership` object is similar to the [`OrganizationMembership`](https://clerk.com/docs/reference/javascript/types/organization-membership) object as it's the model around an Organization membership entity and describes the relationship between users and Organizations. However, the Backend `OrganizationMembership` object is different in that it's used in the [Backend API](https://clerk.com/docs/reference/backend-api/tag/Organization-Memberships#operation/CreateOrganizationMembership){{ target: '_blank' }} and is not directly accessible from the Frontend API.
 */
export class OrganizationMembership {
  private _raw: OrganizationMembershipJSON | null = null;

  public get raw(): OrganizationMembershipJSON | null {
    return this._raw;
  }

  constructor(
    /**
     * The unique identifier for the membership.
     */
    readonly id: string,
    /**
     * The Role of the user.
     */
    readonly role: OrganizationMembershipRole,
    /**
     * The Permissions granted to the user in the Organization.
     */
    readonly permissions: string[],
    /**
     * Metadata that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API.
     */
    readonly publicMetadata: OrganizationMembershipPublicMetadata = {},
    /**
     * Metadata that can be read and set only from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
     */
    readonly privateMetadata: OrganizationMembershipPrivateMetadata = {},
    /**
     * The date when the membership was first created.
     */
    readonly createdAt: number,
    /**
     * The date when the membership was last updated.
     */
    readonly updatedAt: number,
    /**
     * The Organization that the user is a member of.
     */
    readonly organization: Organization,
    /**
     * Public information about the user that this membership belongs to.
     */
    readonly publicUserData?: OrganizationMembershipPublicUserData | null,
  ) {}

  static fromJSON(data: OrganizationMembershipJSON) {
    const res = new OrganizationMembership(
      data.id,
      data.role,
      data.permissions,
      data.public_metadata,
      data.private_metadata,
      data.created_at,
      data.updated_at,
      Organization.fromJSON(data.organization),
      OrganizationMembershipPublicUserData.fromJSON(data.public_user_data),
    );
    res._raw = data;
    return res;
  }
}

/**
 * @class
 */
export class OrganizationMembershipPublicUserData {
  constructor(
    /**
     * The identifier of the user.
     */
    readonly identifier: string,
    /**
     * The first name of the user.
     */
    readonly firstName: string | null,
    /**
     * The last name of the user.
     */
    readonly lastName: string | null,
    /**
     * Holds the default avatar or user's uploaded profile image. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/development/image-optimization).
     */
    readonly imageUrl: string,
    /**
     * Whether the user has a profile picture.
     */
    readonly hasImage: boolean,
    /**
     * The ID of the user that this public data belongs to.
     */
    readonly userId: string,
  ) {}

  static fromJSON(data: OrganizationMembershipPublicUserDataJSON) {
    return new OrganizationMembershipPublicUserData(
      data.identifier,
      data.first_name,
      data.last_name,
      data.image_url,
      data.has_image,
      data.user_id,
    );
  }
}
