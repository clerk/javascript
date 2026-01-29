import type { ClerkPaginationRequest, OrganizationEnrollmentMode } from '@clerk/shared/types';

import { runtime } from '../../runtime';
import { joinPaths } from '../../util/path';
import type {
  Organization,
  OrganizationDomain,
  OrganizationInvitation,
  OrganizationInvitationStatus,
  OrganizationMembership,
} from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { OrganizationMembershipRole } from '../resources/Enums';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/organizations';

type MetadataParams<TPublic = OrganizationPublicMetadata, TPrivate = OrganizationPrivateMetadata> = {
  publicMetadata?: TPublic;
  privateMetadata?: TPrivate;
};

type GetOrganizationListParams = ClerkPaginationRequest<{
  includeMembersCount?: boolean;
  query?: string;
  orderBy?: WithSign<'name' | 'created_at' | 'members_count'>;
  organizationId?: string[];
}>;

type CreateParams = {
  name: string;
  slug?: string;
  /* The User id for the user creating the organization. The user will become an administrator for the organization. */
  createdBy?: string;
  maxAllowedMemberships?: number;
} & MetadataParams;

type GetOrganizationParams = ({ organizationId: string } | { slug: string }) & {
  includeMembersCount?: boolean;
};

type UpdateParams = {
  name?: string;
  slug?: string;
  adminDeleteEnabled?: boolean;
  maxAllowedMemberships?: number;
} & MetadataParams;

type UpdateLogoParams = {
  file: Blob | File;
  uploaderUserId?: string;
};

type UpdateMetadataParams = MetadataParams;

type GetOrganizationMembershipListParams = ClerkPaginationRequest<{
  organizationId: string;

  /**
   * Sorts Organization memberships by phone_number, email_address, created_at, first_name, last_name or username.
   * By prepending one of those values with + or -, we can choose to sort in ascending (ASC) or descending (DESC) order.
   */
  orderBy?: WithSign<'phone_number' | 'email_address' | 'created_at' | 'first_name' | 'last_name' | 'username'>;

  /**
   * Returns users with the user ids specified. For each user id, the `+` and `-` can be
   * prepended to the id, which denote whether the respective user id should be included or
   * excluded from the result set. Accepts up to 100 user ids. Any user ids not found are ignored.
   */
  userId?: string[];

  /* Returns users with the specified email addresses. Accepts up to 100 email addresses. Any email addresses not found are ignored. */
  emailAddress?: string[];

  /* Returns users with the specified phone numbers. Accepts up to 100 phone numbers. Any phone numbers not found are ignored. */
  phoneNumber?: string[];

  /* Returns users with the specified usernames. Accepts up to 100 usernames. Any usernames not found are ignored. */
  username?: string[];

  /* Returns users with the specified web3 wallet addresses. Accepts up to 100 web3 wallet addresses. Any web3 wallet addressed not found are ignored. */
  web3Wallet?: string[];

  /* Returns users with the specified Roles. Accepts up to 100 Roles. Any Roles not found are ignored. */
  role?: OrganizationMembershipRole[];

  /**
   * Returns users that match the given query.
   * For possible matches, we check the email addresses, phone numbers, usernames, web3 wallets, user ids, first and last names.
   * The query value doesn't need to match the exact value you are looking for, it is capable of partial matches as well.
   */
  query?: string;

  /**
   * Returns users with emails that match the given query, via case-insensitive partial match.
   * For example, `email_address_query=ello` will match a user with the email `HELLO@example.com`.
   */
  emailAddressQuery?: string;

  /**
   * Returns users with phone numbers that match the given query, via case-insensitive partial match.
   * For example, `phone_number_query=555` will match a user with the phone number `+1555xxxxxxx`.
   */
  phoneNumberQuery?: string;

  /**
   * Returns users with usernames that match the given query, via case-insensitive partial match.
   * For example, `username_query=CoolUser` will match a user with the username `SomeCoolUser`.
   */
  usernameQuery?: string;

  /* Returns users with names that match the given query, via case-insensitive partial match. */
  nameQuery?: string;

  /**
   * Returns users whose last session activity was before the given date (with millisecond precision).
   * Example: use 1700690400000 to retrieve users whose last session activity was before 2023-11-23.
   */
  lastActiveAtBefore?: number;
  /**
   * Returns users whose last session activity was after the given date (with millisecond precision).
   * Example: use 1700690400000 to retrieve users whose last session activity was after 2023-11-23.
   */
  lastActiveAtAfter?: number;

  /**
   * Returns users who have been created before the given date (with millisecond precision).
   * Example: use 1730160000000 to retrieve users who have been created before 2024-10-29.
   */
  createdAtBefore?: number;

  /**
   * Returns users who have been created after the given date (with millisecond precision).
   * Example: use 1730160000000 to retrieve users who have been created after 2024-10-29.
   */
  createdAtAfter?: number;
}>;

type GetInstanceOrganizationMembershipListParams = ClerkPaginationRequest<{
  /**
   * Sorts Organization memberships by phone_number, email_address, created_at, first_name, last_name or username.
   * By prepending one of those values with + or -, we can choose to sort in ascending (ASC) or descending (DESC) order.
   */
  orderBy?: WithSign<'phone_number' | 'email_address' | 'created_at' | 'first_name' | 'last_name' | 'username'>;
}>;

type CreateOrganizationMembershipParams = {
  organizationId: string;
  userId: string;
  role: OrganizationMembershipRole;
};

type UpdateOrganizationMembershipParams = CreateOrganizationMembershipParams;

type UpdateOrganizationMembershipMetadataParams = {
  organizationId: string;
  userId: string;
} & MetadataParams<OrganizationMembershipPublicMetadata>;

type DeleteOrganizationMembershipParams = {
  organizationId: string;
  userId: string;
};

type CreateOrganizationInvitationParams = {
  organizationId: string;
  emailAddress: string;
  role: OrganizationMembershipRole;
  expiresInDays?: number;
  inviterUserId?: string;
  privateMetadata?: OrganizationInvitationPrivateMetadata;
  publicMetadata?: OrganizationInvitationPublicMetadata;
  redirectUrl?: string;
};

type CreateBulkOrganizationInvitationParams = Array<{
  emailAddress: string;
  role: OrganizationMembershipRole;
  expiresInDays?: number;
  inviterUserId?: string;
  privateMetadata?: OrganizationInvitationPrivateMetadata;
  publicMetadata?: OrganizationInvitationPublicMetadata;
  redirectUrl?: string;
}>;

type GetOrganizationInvitationListParams = ClerkPaginationRequest<{
  organizationId: string;
  status?: OrganizationInvitationStatus[];
}>;

type GetOrganizationInvitationParams = {
  organizationId: string;
  invitationId: string;
};

type RevokeOrganizationInvitationParams = {
  organizationId: string;
  invitationId: string;
  requestingUserId?: string;
};

type GetOrganizationDomainListParams = {
  organizationId: string;
  limit?: number;
  offset?: number;
};

type CreateOrganizationDomainParams = {
  organizationId: string;
  name: string;
  enrollmentMode: OrganizationEnrollmentMode;
  verified?: boolean;
};

type UpdateOrganizationDomainParams = {
  organizationId: string;
  domainId: string;
} & Partial<CreateOrganizationDomainParams>;

type DeleteOrganizationDomainParams = {
  organizationId: string;
  domainId: string;
};

export class OrganizationAPI extends AbstractAPI {
  public async getOrganizationList(params?: GetOrganizationListParams) {
    return this.request<PaginatedResourceResponse<Organization[]>>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createOrganization(params: CreateParams) {
    return this.request<Organization>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async getOrganization(params: GetOrganizationParams) {
    const { includeMembersCount } = params;
    const organizationIdOrSlug = 'organizationId' in params ? params.organizationId : params.slug;
    this.requireId(organizationIdOrSlug);

    return this.request<Organization>({
      method: 'GET',
      path: joinPaths(basePath, organizationIdOrSlug),
      queryParams: {
        includeMembersCount,
      },
    });
  }

  public async updateOrganization(organizationId: string, params: UpdateParams) {
    this.requireId(organizationId);
    return this.request<Organization>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId),
      bodyParams: params,
    });
  }

  public async updateOrganizationLogo(organizationId: string, params: UpdateLogoParams) {
    this.requireId(organizationId);

    const formData = new runtime.FormData();
    formData.append('file', params?.file);
    if (params?.uploaderUserId) {
      formData.append('uploader_user_id', params?.uploaderUserId);
    }

    return this.request<Organization>({
      method: 'PUT',
      path: joinPaths(basePath, organizationId, 'logo'),
      formData,
    });
  }

  public async deleteOrganizationLogo(organizationId: string) {
    this.requireId(organizationId);

    return this.request<Organization>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId, 'logo'),
    });
  }

  public async updateOrganizationMetadata(organizationId: string, params: UpdateMetadataParams) {
    this.requireId(organizationId);

    return this.request<Organization>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'metadata'),
      bodyParams: params,
    });
  }

  public async deleteOrganization(organizationId: string) {
    return this.request<Organization>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId),
    });
  }

  public async getOrganizationMembershipList(params: GetOrganizationMembershipListParams) {
    const { organizationId, ...queryParams } = params;
    this.requireId(organizationId);

    return this.request<PaginatedResourceResponse<OrganizationMembership[]>>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'memberships'),
      queryParams,
    });
  }

  public async getInstanceOrganizationMembershipList(params: GetInstanceOrganizationMembershipListParams) {
    return this.request<PaginatedResourceResponse<OrganizationMembership[]>>({
      method: 'GET',
      path: '/organization_memberships',
      queryParams: params,
    });
  }

  public async createOrganizationMembership(params: CreateOrganizationMembershipParams) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.request<OrganizationMembership>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'memberships'),
      bodyParams,
    });
  }

  public async updateOrganizationMembership(params: UpdateOrganizationMembershipParams) {
    const { organizationId, userId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.request<OrganizationMembership>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'memberships', userId),
      bodyParams,
    });
  }

  public async updateOrganizationMembershipMetadata(params: UpdateOrganizationMembershipMetadataParams) {
    const { organizationId, userId, ...bodyParams } = params;

    return this.request<OrganizationMembership>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'memberships', userId, 'metadata'),
      bodyParams,
    });
  }

  public async deleteOrganizationMembership(params: DeleteOrganizationMembershipParams) {
    const { organizationId, userId } = params;
    this.requireId(organizationId);

    return this.request<OrganizationMembership>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId, 'memberships', userId),
    });
  }

  public async getOrganizationInvitationList(params: GetOrganizationInvitationListParams) {
    const { organizationId, ...queryParams } = params;
    this.requireId(organizationId);

    return this.request<PaginatedResourceResponse<OrganizationInvitation[]>>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'invitations'),
      queryParams,
    });
  }

  public async createOrganizationInvitation(params: CreateOrganizationInvitationParams) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.request<OrganizationInvitation>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations'),
      bodyParams,
    });
  }

  public async createOrganizationInvitationBulk(
    organizationId: string,
    params: CreateBulkOrganizationInvitationParams,
  ) {
    this.requireId(organizationId);

    return this.request<OrganizationInvitation[]>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations', 'bulk'),
      bodyParams: params,
    });
  }

  public async getOrganizationInvitation(params: GetOrganizationInvitationParams) {
    const { organizationId, invitationId } = params;
    this.requireId(organizationId);
    this.requireId(invitationId);

    return this.request<OrganizationInvitation>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'invitations', invitationId),
    });
  }

  public async revokeOrganizationInvitation(params: RevokeOrganizationInvitationParams) {
    const { organizationId, invitationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.request<OrganizationInvitation>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations', invitationId, 'revoke'),
      bodyParams,
    });
  }

  public async getOrganizationDomainList(params: GetOrganizationDomainListParams) {
    const { organizationId, ...queryParams } = params;
    this.requireId(organizationId);

    return this.request<PaginatedResourceResponse<OrganizationDomain[]>>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'domains'),
      queryParams,
    });
  }

  public async createOrganizationDomain(params: CreateOrganizationDomainParams) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.request<OrganizationDomain>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'domains'),
      bodyParams: {
        ...bodyParams,
        verified: bodyParams.verified ?? true,
      },
    });
  }

  public async updateOrganizationDomain(params: UpdateOrganizationDomainParams) {
    const { organizationId, domainId, ...bodyParams } = params;
    this.requireId(organizationId);
    this.requireId(domainId);

    return this.request<OrganizationDomain>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'domains', domainId),
      bodyParams,
    });
  }

  public async deleteOrganizationDomain(params: DeleteOrganizationDomainParams) {
    const { organizationId, domainId } = params;
    this.requireId(organizationId);
    this.requireId(domainId);

    return this.request<OrganizationDomain>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId, 'domains', domainId),
    });
  }
}
