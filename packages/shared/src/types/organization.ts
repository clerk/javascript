import type { BillingPayerMethods } from './billing';
import type { OrganizationDomainResource, OrganizationEnrollmentMode } from './organizationDomain';
import type { OrganizationInvitationResource, OrganizationInvitationStatus } from './organizationInvitation';
import type { OrganizationCustomRoleKey, OrganizationMembershipResource } from './organizationMembership';
import type { OrganizationMembershipRequestResource } from './organizationMembershipRequest';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';
import type { RoleResource } from './role';
import type { OrganizationJSONSnapshot } from './snapshots';

declare global {
  /**
   * If you want to provide custom types for the organization.publicMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every Organization object will use the provided type.
   */
  interface OrganizationPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the organization.privateMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every Organization object will use the provided type.
   */
  interface OrganizationPrivateMetadata {
    [k: string]: unknown;
  }
}

/**
 * The `Organization` object holds information about an Organization, as well as methods for managing it.
 *
 * To use these methods, you must have the **Organizations** feature [enabled in your app's settings in the Clerk Dashboard](https://clerk.com/docs/guides/organizations/configure#enable-organizations).
 *
 * @interface
 */
export interface OrganizationResource extends ClerkResource, BillingPayerMethods {
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
  getRoles: (params?: GetRolesParams) => Promise<GetRolesResponse>;
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
  __internal_toSnapshot: () => OrganizationJSONSnapshot;
}

export type GetRolesParams = ClerkPaginationParams;

export interface GetRolesResponse extends ClerkPaginatedResponse<RoleResource> {
  has_role_set_migration?: boolean;
}

export type GetMembersParams = ClerkPaginationParams<{
  role?: OrganizationCustomRoleKey[];
  query?: string;
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
  role: OrganizationCustomRoleKey;
}

export interface InviteMemberParams {
  emailAddress: string;
  role: OrganizationCustomRoleKey;
}

export interface InviteMembersParams {
  emailAddresses: string[];
  role: OrganizationCustomRoleKey;
}

export interface UpdateMembershipParams {
  userId: string;
  role: OrganizationCustomRoleKey;
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
