import type { OrganizationCustomRoleKey } from './organizationMembership';
import type { ClerkResource } from './resource';

declare global {
  /**
   * If you want to provide custom types for the organizationInvitation.publicMetadata
   * object, simply redeclare this rule in the global namespace.
   * Every OrganizationInvitation object will use the provided type.
   */
  interface OrganizationInvitationPublicMetadata {
    [k: string]: unknown;
  }

  interface OrganizationInvitationPrivateMetadata {
    [k: string]: unknown;
  }
}

/**
 * The `OrganizationInvitation` object is the model around an Organization invitation.
 *
 * @interface
 */
export interface OrganizationInvitationResource extends ClerkResource {
  id: string;
  emailAddress: string;
  organizationId: string;
  publicMetadata: OrganizationInvitationPublicMetadata;
  role: OrganizationCustomRoleKey;
  roleName: string;
  status: OrganizationInvitationStatus;
  createdAt: Date;
  updatedAt: Date;
  revoke: () => Promise<OrganizationInvitationResource>;
}

/**
 * @inline
 */
export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
