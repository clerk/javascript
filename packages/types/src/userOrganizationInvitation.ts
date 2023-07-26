import type { OrganizationResource } from './organization';
import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { MembershipRole } from './organizationMembership';
import type { ClerkResource } from './resource';

declare global {
  /**
   * If you want to provide custom types for the organizationInvitation.publicMetadata
   * object, simply redeclare this rule in the global namespace.
   * Every organizationInvitation object will use the provided type.
   */
  interface UserOrganizationInvitationPublicMetadata {
    [k: string]: unknown;
  }

  interface UserOrganizationInvitationPrivateMetadata {
    [k: string]: unknown;
  }
}

export interface UserOrganizationInvitationResource extends ClerkResource {
  id: string;
  emailAddress: string;
  organization: OrganizationResource;
  publicMetadata: UserOrganizationInvitationPublicMetadata;
  role: MembershipRole;
  status: OrganizationInvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}
