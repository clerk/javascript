import { OrganizationInvitationResource } from './organizationInvitation';
import { OrganizationMembershipResource } from './organizationMembership';
import { MembershipRole } from './organizationMembership';

declare global {
  /**
   * If you want to provide custom types for the organization.publicMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface OrganizationPublicMetadata {
    [k: string]: unknown;
  }
}

export interface OrganizationResource {
  id: string;
  name: string;
  slug: string;
  publicMetadata: OrganizationPublicMetadata;
  createdAt: Date;
  updatedAt: Date;
  update: (params: UpdateOrganizationParams) => Promise<OrganizationResource>;
  getMemberships: (params?: GetMembershipsParams) => Promise<OrganizationMembershipResource[]>;
  getPendingInvitations: () => Promise<OrganizationInvitationResource[]>;
  inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
  updateMember: (params: UpdateMembershipParams) => Promise<OrganizationMembershipResource>;
  removeMember: (userId: string) => Promise<OrganizationMembershipResource>;
}

export interface GetMembershipsParams {
  limit?: number;
  offset?: number;
}

export interface InviteMemberParams {
  emailAddress: string;
  role: MembershipRole;
  redirectUrl?: string;
}

export interface UpdateMembershipParams {
  userId: string;
  role: MembershipRole;
}

export interface UpdateOrganizationParams {
  name: string;
}
