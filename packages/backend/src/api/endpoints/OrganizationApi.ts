import type { ClerkPaginationRequest, OrganizationEnrollmentMode } from '@clerk/types';

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
  maxAllowedMemberships?: number;
} & MetadataParams;

type UpdateLogoParams = {
  file: Blob | File;
  uploaderUserId?: string;
};

type UpdateMetadataParams = MetadataParams;

type GetOrganizationMembershipListParams = ClerkPaginationRequest<{
  organizationId: string;
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
  inviterUserId: string;
  emailAddress: string;
  role: OrganizationMembershipRole;
  redirectUrl?: string;
  publicMetadata?: OrganizationInvitationPublicMetadata;
};

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
  requestingUserId: string;
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
