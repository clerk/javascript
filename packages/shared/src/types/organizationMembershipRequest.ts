import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';

/**
 * The `OrganizationMembershipRequest` object is the model that describes [the request of a user to join an Organization](https://clerk.com/docs/guides/organizations/add-members/verified-domains#membership-requests).
 *
 * @interface
 */
export interface OrganizationMembershipRequestResource extends ClerkResource {
  /**
   * The unique identifier for the Membership Request.
   */
  id: string;
  /**
   * The ID of the Organization the Membership Request is for.
   */
  organizationId: string;
  /**
   * The current status of the Membership Request.
   */
  status: OrganizationInvitationStatus;
  /**
   * Public information about the user that created the Membership Request.
   */
  publicUserData: PublicUserData;
  /**
   * The date when the Membership Request was created.
   */
  createdAt: Date;
  /**
   * The date when the Membership Request was last updated.
   */
  updatedAt: Date;

  /**
   * Accepts the Membership Request, adding the user to the Organization.
   *
   * @returns A promise that resolves to the accepted [`OrganizationMembershipRequest`](https://clerk.com/docs/reference/types/organization-membership-request) object.
   */
  accept: () => Promise<OrganizationMembershipRequestResource>;
  /**
   * Rejects the Membership Request, declining the user's request to join the Organization.
   *
   * @returns A promise that resolves to the rejected [`OrganizationMembershipRequest`](https://clerk.com/docs/reference/types/organization-membership-request) object.
   */
  reject: () => Promise<OrganizationMembershipRequestResource>;
}
