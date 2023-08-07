import type { ClerkPaginatedResponse, ClerkPaginationParams } from './api';
import type { OrganizationDomainResource } from './organizationDomain';
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
  /**
   * @deprecated Use `imageUrl` instead.
   */
  logoUrl: string | null;
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
  getMemberships: (params?: GetMembershipsParams) => Promise<OrganizationMembershipResource[]>;
  getPendingInvitations: (params?: GetPendingInvitationsParams) => Promise<OrganizationInvitationResource[]>;
  getDomains: (params?: GetDomainsParams) => Promise<ClerkPaginatedResponse<OrganizationDomainResource>>;
  addMember: (params: AddMemberParams) => Promise<OrganizationMembershipResource>;
  inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
  inviteMembers: (params: InviteMembersParams) => Promise<OrganizationInvitationResource[]>;
  updateMember: (params: UpdateMembershipParams) => Promise<OrganizationMembershipResource>;
  removeMember: (userId: string) => Promise<OrganizationMembershipResource>;
  createDomain: (domainName: string) => Promise<OrganizationDomainResource>;
  getDomain: ({ domainId }: { domainId: string }) => Promise<OrganizationDomainResource>;
  prepareDomainAffiliationVerification: ({
    domainId,
    emailAddress,
  }: {
    domainId: string;
    emailAddress: string;
  }) => Promise<OrganizationDomainResource>;

  attemptDomainAffiliationVerification: ({
    domainId,
    code,
  }: {
    domainId: string;
    code: string;
  }) => Promise<OrganizationDomainResource>;
  destroy: () => Promise<void>;
  setLogo: (params: SetOrganizationLogoParams) => Promise<OrganizationResource>;
}

export type GetMembershipsParams = {
  role?: MembershipRole[];
} & ClerkPaginationParams;

export type GetPendingInvitationsParams = ClerkPaginationParams;
export type GetDomainsParams = {
  /**
   * This the starting point for your fetched results. The initial value persists between re-renders
   */
  initialPage?: number;
  /**
   * Maximum number of items returned per request. The initial value persists between re-renders
   */
  initialPageSize?: number;
};

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
