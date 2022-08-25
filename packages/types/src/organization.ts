import { ClerkPaginationParams } from './api';
import { OrganizationInvitationResource } from './organizationInvitation';
import { OrganizationMembershipResource } from './organizationMembership';
import { MembershipRole } from './organizationMembership';

declare global {
  /**
   * If you want to provide custom types for the organization.publicMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every organization object will use the provided type.
   */
  interface OrganizationPublicMetadata {
    [k: string]: unknown;
  }
}

export interface OrganizationResource {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  publicMetadata: OrganizationPublicMetadata;
  createdAt: Date;
  updatedAt: Date;
  update: (params: UpdateOrganizationParams) => Promise<OrganizationResource>;
  getMemberships: (params?: GetMembershipsParams) => Promise<OrganizationMembershipResource[]>;
  getPendingInvitations: (params?: GetPendingInvitationsParams) => Promise<OrganizationInvitationResource[]>;
  addMember: (params: AddMemberParams) => Promise<OrganizationMembershipResource>;
  inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
  updateMember: (params: UpdateMembershipParams) => Promise<OrganizationMembershipResource>;
  removeMember: (userId: string) => Promise<OrganizationMembershipResource>;
  destroy: () => Promise<void>;
  setLogo: (params: SetOrganizationLogoParams) => Promise<OrganizationResource>;
}

export type GetMembershipsParams = ClerkPaginationParams;

export type GetPendingInvitationsParams = ClerkPaginationParams;

export interface AddMemberParams {
  userId: string;
  role: MembershipRole;
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

export interface SetOrganizationLogoParams {
  file: Blob | File;
}
