import type { BillingPayerMethods } from './billing';
import type { DeletedObjectResource } from './deletedObject';
import type {
  CreateOrganizationEnterpriseConnectionParams,
  EnterpriseConnectionResource,
  UpdateOrganizationEnterpriseConnectionParams,
} from './enterpriseConnection';
import type {
  EnterpriseConnectionTestRunInitResource,
  EnterpriseConnectionTestRunResource,
  GetEnterpriseConnectionTestRunsParams,
} from './enterpriseConnectionTestRun';
import type {
  CreateOrganizationDomainParams,
  OrganizationDomainResource,
  OrganizationDomainsBulkOwnershipVerificationResource,
  OrganizationEnrollmentMode,
} from './organizationDomain';
import type { OrganizationInvitationResource, OrganizationInvitationStatus } from './organizationInvitation';
import type { OrganizationCustomRoleKey, OrganizationMembershipResource } from './organizationMembership';
import type { OrganizationMembershipRequestResource } from './organizationMembershipRequest';
import type { ClerkPaginatedResponse, ClerkPaginationParams } from './pagination';
import type { ClerkResource } from './resource';
import type { RoleResource } from './role';
import type { OrganizationJSONSnapshot } from './snapshots';
import type { GetEnterpriseConnectionsParams } from './user';

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
  /**
   * The unique identifier for the Organization.
   */
  id: string;
  /**
   * The name of the Organization.
   */
  name: string;
  /**
   * The URL-friendly identifier of the Organization. If supplied, it must be unique for the instance.
   */
  slug: string | null;
  /**
   * Holds the Organization's logo. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/development/image-optimization).
   */
  imageUrl: string;
  /**
   * Whether the Organization has an image.
   */
  hasImage: boolean;
  /**
   * The number of members in the Organization.
   */
  membersCount: number;
  /**
   * The number of pending invitations in the Organization.
   */
  pendingInvitationsCount: number;
  /**
   * Metadata that can be read from both the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }} and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but can be set only from the Backend API. Once the user accepts the invitation and signs up, these metadata will end up in the user's public metadata.
   */
  publicMetadata: OrganizationPublicMetadata;
  /**
   * Whether the Organization allows admins to delete users.
   */
  adminDeleteEnabled: boolean;
  /**
   * The maximum number of memberships allowed in the Organization.
   */
  maxAllowedMemberships: number;
  /**
   * Whether the Organization allows self-serve SSO.
   */
  selfServeSSOEnabled: boolean;
  /**
   * Whether the Organization enforces exclusive membership, meaning members must have it set as their active Organization. Defaults to `false` for instances that have not adopted the feature.
   */
  exclusiveMembership: boolean;
  /**
   * The date when the Organization was first created.
   */
  createdAt: Date;
  /**
   * The date when the Organization was last updated.
   */
  updatedAt: Date;
  /**
   * Updates the current Organization.
   */
  update: (params: UpdateOrganizationParams) => Promise<OrganizationResource>;
  /**
   * Gets the list of Organization Memberships.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`OrganizationMembershipResource`](https://clerk.com/docs/reference/types/organization-membership) objects.
   */
  getMemberships: GetMemberships;

  /**
   * Gets the list of invitations.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`OrganizationInvitationResource`](https://clerk.com/docs/reference/types/organization-invitation) objects.
   */
  getInvitations: (params?: GetInvitationsParams) => Promise<ClerkPaginatedResponse<OrganizationInvitationResource>>;
  /**
   * Gets the list of [Roles](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) available.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`RoleResource`](https://clerk.com/docs/reference/types/role-resource) objects and a `has_role_set_migration` status.
   *
   * When `has_role_set_migration` is `true`, updating Organization membership Roles is not allowed. Learn how to [build a custom flow for managing member Roles in an Organization](/docs/guides/development/custom-flows/organizations/manage-roles).
   */
  getRoles: (params?: GetRolesParams) => Promise<GetRolesResponse>;
  /**
   * Gets the list of domains.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`OrganizationDomainResource`](https://clerk.com/docs/reference/types/organization-domain-resource) objects.
   *
   * > [!WARNING]
   * > You must have [**Verified domains**](https://clerk.com/docs/guides/organizations/add-members/verified-domains) enabled in your app's settings in the Clerk Dashboard.
   */
  getDomains: (params?: GetDomainsParams) => Promise<ClerkPaginatedResponse<OrganizationDomainResource>>;
  /**
   * Gets the list of membership requests.
   * @returns A [`ClerkPaginatedResponse`](https://clerk.com/docs/reference/types/clerk-paginated-response) of [`OrganizationMembershipRequestResource`](https://clerk.com/docs/reference/types/organization-membership-request) objects.
   *
   * > [!WARNING]
   * > You must have [**Verified domains** and **Automatic suggestion**](https://clerk.com/docs/guides/organizations/add-members/verified-domains) enabled in your app's settings in the Clerk Dashboard.
   */
  getMembershipRequests: (
    params?: GetMembershipRequestParams,
  ) => Promise<ClerkPaginatedResponse<OrganizationMembershipRequestResource>>;
  /**
   * Adds a user as a member to an organization. A user can only be added to an organization if they are not already a member of it and if they already exist in the same instance as the organization. Only administrators can add members to an organization.
   * @returns An [`OrganizationMembershipResource`](https://clerk.com/docs/reference/types/organization-membership) object.
   */
  addMember: (params: AddMemberParams) => Promise<OrganizationMembershipResource>;
  /**
   * Creates and sends an invitation to the given email address.
   * @returns An [`OrganizationInvitationResource`](https://clerk.com/docs/reference/types/organization-invitation) object.
   */
  inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
  /**
   * Creates and sends invitations to the given email addresses.
   * @returns An array of [`OrganizationInvitationResource`](https://clerk.com/docs/reference/types/organization-invitation) objects.
   */
  inviteMembers: (params: InviteMembersParams) => Promise<OrganizationInvitationResource[]>;
  /**
   * Updates a given member.
   * @returns An [`OrganizationMembershipResource`](https://clerk.com/docs/reference/types/organization-membership) object.
   */
  updateMember: (params: UpdateMembershipParams) => Promise<OrganizationMembershipResource>;
  /**
   * Removes a member.
   * @returns An [`OrganizationMembershipResource`](https://clerk.com/docs/reference/types/organization-membership) object.
   * @param userId - The unique identifier of the user to remove.
   */
  removeMember: (userId: string) => Promise<OrganizationMembershipResource>;
  /**
   * Creates a new domain.
   * @returns An [`OrganizationDomainResource`](https://clerk.com/docs/reference/types/organization-domain-resource) object.
   *
   * > [!WARNING]
   * > You must have [**Verified domains**](https://clerk.com/docs/guides/organizations/add-members/verified-domains) enabled in your app's settings in the Clerk Dashboard.
   * @param domainName - The name of the domain to create.
   * @param params - Optional parameters, including the `enrollmentMode` to assign to the new domain.
   */
  createDomain: (
    domainName: string,
    params?: Pick<CreateOrganizationDomainParams, 'enrollmentMode'>,
  ) => Promise<OrganizationDomainResource>;
  /**
   * Issues a fresh TXT challenge for each of the given domains in a single
   * request. Each resolved domain's `ownershipVerification` carries the
   * `txtRecordName` and `txtRecordValue` the org admin must publish. A single
   * bad domain does not fail the batch; it lands in `errors`.
   * @returns An [`OrganizationDomainsBulkOwnershipVerificationResource`](https://clerk.com/docs/reference/types/organization-domains-bulk-ownership-verification-resource) object.
   * @param domainIds - The unique identifiers of the domains to prepare.
   */
  prepareOwnershipVerification: (domainIds: string[]) => Promise<OrganizationDomainsBulkOwnershipVerificationResource>;
  /**
   * Resolves the published TXT record for each of the given domains in a single
   * request to complete ownership verification. A single bad domain does not
   * fail the batch; it lands in `errors`.
   * @returns An [`OrganizationDomainsBulkOwnershipVerificationResource`](https://clerk.com/docs/reference/types/organization-domains-bulk-ownership-verification-resource) object.
   * @param domainIds - The unique identifiers of the domains to attempt.
   */
  attemptOwnershipVerification: (domainIds: string[]) => Promise<OrganizationDomainsBulkOwnershipVerificationResource>;
  /**
   * Gets a domain for an Organization based on the given domain ID.
   * @returns An [`OrganizationDomainResource`](https://clerk.com/docs/reference/types/organization-domain-resource) object.
   *
   * > [!WARNING]
   * > You must have [**Verified domains**](https://clerk.com/docs/guides/organizations/add-members/verified-domains) enabled in your app's settings in the Clerk Dashboard.
   * @param domainId - The unique identifier of the domain to get.
   */
  getDomain: ({ domainId }: { domainId: string }) => Promise<OrganizationDomainResource>;
  getEnterpriseConnections: (params?: GetEnterpriseConnectionsParams) => Promise<EnterpriseConnectionResource[]>;
  createEnterpriseConnection: (
    params: CreateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource>;
  updateEnterpriseConnection: (
    enterpriseConnectionId: string,
    params: UpdateOrganizationEnterpriseConnectionParams,
  ) => Promise<EnterpriseConnectionResource>;
  deleteEnterpriseConnection: (enterpriseConnectionId: string) => Promise<DeletedObjectResource>;
  createEnterpriseConnectionTestRun: (
    enterpriseConnectionId: string,
  ) => Promise<EnterpriseConnectionTestRunInitResource>;
  getEnterpriseConnectionTestRuns: (
    enterpriseConnectionId: string,
    params?: GetEnterpriseConnectionTestRunsParams,
  ) => Promise<ClerkPaginatedResponse<EnterpriseConnectionTestRunResource>>;
  /**
   * Deletes the Organization. Only administrators can delete an Organization.
   *
   * Deleting an Organization will also delete all memberships and invitations. **This is not reversible.**
   */
  destroy: () => Promise<void>;
  /**
   * Sets or replaces an Organization's logo.
   */
  setLogo: (params: SetOrganizationLogoParams) => Promise<OrganizationResource>;
  __internal_toSnapshot: () => OrganizationJSONSnapshot;
}

/** @generateWithEmptyComment */
export type GetRolesParams = ClerkPaginationParams;

export interface GetRolesResponse extends ClerkPaginatedResponse<RoleResource> {
  has_role_set_migration?: boolean;
}

/** @generateWithEmptyComment */
export type GetMembersParams = ClerkPaginationParams<{
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) to filter the users by.
   */
  role?: OrganizationCustomRoleKey[];
  /**
   * The query to filter the users by.
   */
  query?: string;
}>;

/** @generateWithEmptyComment */
export type GetDomainsParams = ClerkPaginationParams<{
  /**
   * The [enrollment mode](https://clerk.com/docs/guides/organizations/add-members/verified-domains#enable-verified-domains) will decide how new users join an organization.
   */
  enrollmentMode?: OrganizationEnrollmentMode;
}>;

/** @generateWithEmptyComment */
export type GetInvitationsParams = ClerkPaginationParams<{
  /**
   * The status of the invitations to get.
   */
  status?: OrganizationInvitationStatus[];
}>;

/** @generateWithEmptyComment */
export type GetMembershipRequestParams = ClerkPaginationParams<{
  /**
   * The status of the membership requests to get.
   */
  status?: OrganizationInvitationStatus;
}>;

/** @generateWithEmptyComment */
export interface AddMemberParams {
  /**
   * The unique identifier of the user to add as a member.
   */
  userId: string;
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) that will be assigned to the user.
   */
  role: OrganizationCustomRoleKey;
}

/** @generateWithEmptyComment */
export interface InviteMemberParams {
  /**
   * The email address of the user to invite.
   */
  emailAddress: string;
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) that will be assigned to the user.
   */
  role: OrganizationCustomRoleKey;
}

/** @generateWithEmptyComment */
export interface InviteMembersParams {
  /**
   * The email addresses of the users to invite.
   */
  emailAddresses: string[];
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) that will be assigned to the users.
   */
  role: OrganizationCustomRoleKey;
}

/** @generateWithEmptyComment */
export interface UpdateMembershipParams {
  /**
   * The unique identifier of the user to update.
   */
  userId: string;
  /**
   * The [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) that will be assigned to the user.
   */
  role: OrganizationCustomRoleKey;
}

/** @generateWithEmptyComment */
export interface UpdateOrganizationParams {
  /**
   * The name of the Organization.
   */
  name: string;
  /**
   * The URL-friendly identifier of the Organization. If supplied, it must be unique for the instance.
   */
  slug?: string;
}

/** @generateWithEmptyComment */
export interface SetOrganizationLogoParams {
  /**
   * The file to set as the Organization's logo. The file must be an image and its size cannot exceed 10MB.
   */
  file: Blob | File | string | null;
}

/** @generateWithEmptyComment */
export type GetMemberships = (
  params?: GetMembersParams,
) => Promise<ClerkPaginatedResponse<OrganizationMembershipResource>>;
