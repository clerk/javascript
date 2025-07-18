import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { ClerkResource } from './resource';
import type { PublicUserData } from './session';

/**
 * The `OrganizationMembershipRequest` object is the model that describes the request of a user to join an organization.
 * @interface
 */
export interface OrganizationMembershipRequestResource extends ClerkResource {
  id: string;
  organizationId: string;
  status: OrganizationInvitationStatus;
  publicUserData: PublicUserData;
  createdAt: Date;
  updatedAt: Date;

  accept: () => Promise<OrganizationMembershipRequestResource>;
  reject: () => Promise<OrganizationMembershipRequestResource>;
}
