import type { OrganizationCustomRoleKey } from './organizationMembership';
import type { ClerkResource } from './resource';

declare global {
  /**
   * If you want to provide custom types for the organizationInvitation.publicMetadata object, simply redeclare this rule in the global namespace. Every `OrganizationInvitation` will use the provided type.
   */
  interface OrganizationInvitationPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the organizationInvitation.privateMetadata object, simply redeclare this rule in the global namespace. Every `OrganizationInvitation` will use the provided type.
   */
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
  /**
   * The unique identifier for the invitation.
   */
  id: string;
  /**
   * The email address the invitation was sent to.
   */
  emailAddress: string;
  /**
   * The ID of the Organization that the invitation is for.
   */
  organizationId: string;
  /**
   * Metadata that can be read from both the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }} and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but can be set only from the Backend API. Once the user accepts the invitation and signs up, these metadata will end up in the user's public metadata.
   */
  publicMetadata: OrganizationInvitationPublicMetadata;
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) that the invited user will be assigned once they accept the invitation.
   */
  role: OrganizationCustomRoleKey;
  /**
   * The name of the [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) that the invited user will be assigned.
   */
  roleName: string;
  /**
   * The current status of the invitation.
   */
  status: OrganizationInvitationStatus;
  /**
   * The date when the invitation was created.
   */
  createdAt: Date;
  /**
   * The date when the invitation was last updated.
   */
  updatedAt: Date;
  /**
   * Revokes the invitation so it can no longer be accepted.
   *
   * @returns A promise that resolves to the revoked [`OrganizationInvitation`](https://clerk.com/docs/reference/types/organization-invitation) object.
   */
  revoke: () => Promise<OrganizationInvitationResource>;
}

/**
 * The current status of an Organization invitation.
 *
 * @inline
 */
export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
