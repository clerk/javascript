import type { ClerkPaginationParams } from './api';
import type { OrganizationInvitationResource } from './organizationInvitation';
import type { MembershipRole, OrganizationMembershipResource } from './organizationMembership';
import type { ClerkResource } from './resource';

declare global {
  /**
   * If you want to provide custom types for the organization.publicMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every organization object will use the provided type.
   */
  interface OrganizationPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the organization.privateMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every organization object will use the provided type.
   */
  interface OrganizationPrivateMetadata {
    [k: string]: unknown;
  }
}

export interface OrganizationResource extends ClerkResource {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  imageUrl: string;
  membersCount: number;
  pendingInvitationsCount: number;
  publicMetadata: OrganizationPublicMetadata;
  createdAt: Date;
  updatedAt: Date;
  update: (params: UpdateOrganizationParams) => Promise<OrganizationResource>;
  getMemberships: (params?: GetMembershipsParams) => Promise<OrganizationMembershipResource[]>;
  getPendingInvitations: (params?: GetPendingInvitationsParams) => Promise<OrganizationInvitationResource[]>;
  addMember: (params: AddMemberParams) => Promise<OrganizationMembershipResource>;
  inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
  inviteMembers: (params: InviteMembersParams) => Promise<OrganizationInvitationResource[]>;
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
}

export interface InviteMembersParams {
  emailAddresses: string[];
  role: MembershipRole;
}

export interface UpdateMembershipParams {
  userId: string;
  role: MembershipRole;
}

export interface UpdateOrganizationParams {
  name: string;
  slug?: string;
}

export interface SetOrganizationLogoParams {
  file: Blob | File | null;
}
