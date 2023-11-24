import type { ClerkPaginatedResponse, ClerkPaginationParams } from './api';
import type { OrganizationDomainResource, OrganizationEnrollmentMode } from './organizationDomain';
import type { OrganizationInvitationResource, OrganizationInvitationStatus } from './organizationInvitation';
import type { MembershipRole, OrganizationMembershipResource } from './organizationMembership';
import type { OrganizationMembershipRequestResource } from './organizationMembershipRequest';
import type { ClerkResource } from './resource';
import type { RoleResource } from './role';

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
  imageUrl: string;
  hasImage: boolean;
  membersCount: number;
  pendingInvitationsCount: number;
  publicMetadata: OrganizationPublicMetadata;
  adminDeleteEnabled: boolean;
  maxAllowedMemberships: number;
  createdAt: Date;
  updatedAt: Date;
  update: (params: UpdateOrganizationParams) => Promise<OrganizationResource>;
  getMemberships: GetMemberships;
  getInvitations: (params?: GetInvitationsParams) => Promise<ClerkPaginatedResponse<OrganizationInvitationResource>>;
  /**
   * @experimental
   */
  getRoles: (params?: GetRolesParams) => Promise<ClerkPaginatedResponse<RoleResource>>;
  getDomains: (params?: GetDomainsParams) => Promise<ClerkPaginatedResponse<OrganizationDomainResource>>;
  getMembershipRequests: (
    params?: GetMembershipRequestParams,
  ) => Promise<ClerkPaginatedResponse<OrganizationMembershipRequestResource>>;
  addMember: (params: AddMemberParams) => Promise<OrganizationMembershipResource>;
  inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
  inviteMembers: (params: InviteMembersParams) => Promise<OrganizationInvitationResource[]>;
  updateMember: (params: UpdateMembershipParams) => Promise<OrganizationMembershipResource>;
  removeMember: (userId: string) => Promise<OrganizationMembershipResource>;
  createDomain: (domainName: string) => Promise<OrganizationDomainResource>;
  getDomain: ({ domainId }: { domainId: string }) => Promise<OrganizationDomainResource>;
  destroy: () => Promise<void>;
  setLogo: (params: SetOrganizationLogoParams) => Promise<OrganizationResource>;
}

/**
 * @experimental
 */
export type GetRolesParams = ClerkPaginationParams;

export type GetMembersParams = ClerkPaginationParams<{
  role?: MembershipRole[];
}>;

export type GetDomainsParams = ClerkPaginationParams<{
  enrollmentMode?: OrganizationEnrollmentMode;
}>;

export type GetInvitationsParams = ClerkPaginationParams<{
  status?: OrganizationInvitationStatus[];
}>;

export type GetMembershipRequestParams = ClerkPaginationParams<{
  status?: OrganizationInvitationStatus;
}>;

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
  file: Blob | File | string | null;
}

export type GetMemberships = (
  params?: GetMembersParams,
) => Promise<ClerkPaginatedResponse<OrganizationMembershipResource>>;
