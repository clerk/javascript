import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';

/**
 * The `OrganizationMembershipRequest` object is the model that describes the request of a user to join an organization.
 *
 * @interface
 */
export interface OrganizationMembershipRequestResource extends ClerkResource {
  /**
   * The unique identifier for the membership request.
   */
  id: string;
  /**
   * The ID of the Organization the request is for.
   */
  organizationId: string;
  /**
   * The current status of the membership request.
   */
  status: OrganizationInvitationStatus;
  /**
   * Public information about the user that created the membership request.
   */
  publicUserData: PublicUserData;
  /**
   * The date when the membership request was created.
   */
  createdAt: Date;
  /**
   * The date when the membership request was last updated.
   */
  updatedAt: Date;

  /**
   * Accepts the membership request, adding the user to the Organization.
   *
   * @returns A promise that resolves to the accepted [`OrganizationMembershipRequest`](https://clerk.com/docs/reference/types/organization-membership-request) object.
   */
  accept: () => Promise<OrganizationMembershipRequestResource>;
  /**
   * Rejects the membership request, declining the user's request to join the Organization.
   *
   * @returns A promise that resolves to the rejected [`OrganizationMembershipRequest`](https://clerk.com/docs/reference/types/organization-membership-request) object.
   */
  reject: () => Promise<OrganizationMembershipRequestResource>;
}
