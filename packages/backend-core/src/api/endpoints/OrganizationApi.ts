import { joinPaths } from '../../util/path';
import { Organization, OrganizationInvitation, OrganizationMembership } from '../resources';
import { OrganizationMembershipRole } from '../resources/Enums';
import { AbstractAPI } from './AbstractApi';

const basePath = '/organizations';

type MetadataParams = {
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
};

type GetOrganizationListParams = {
  limit?: number;
  offset?: number;
};

type CreateParams = {
  name: string;
  slug?: string;
  /* The User id for the user creating the organization. The user will become an administrator for the organization. */
  createdBy: string;
} & MetadataParams;

type GetOrganizationParams = { organizationId: string } | { slug: string };

type UpdateParams = {
  name?: string;
};

type UpdateMetadataParams = MetadataParams;

type GetOrganizationMembershipListParams = {
  organizationId: string;
  limit?: number;
  offset?: number;
};

type CreateOrganizationMembershipParams = {
  organizationId: string;
  userId: string;
  role: OrganizationMembershipRole;
};

type UpdateOrganizationMembershipParams = CreateOrganizationMembershipParams;

type UpdateOrganizationMembershipMetadataParams = {
  organizationId: string;
  userId: string;
} & MetadataParams;

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
};

type GetPendingOrganizationInvitationListParams = {
  organizationId: string;
  limit?: number;
  offset?: number;
};

type RevokeOrganizationInvitationParams = {
  organizationId: string;
  invitationId: string;
  requestingUserId: string;
};

export class OrganizationAPI extends AbstractAPI {
  public async getOrganizationList(params?: GetOrganizationListParams) {
    return this.APIClient.request<Organization[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createOrganization(params: CreateParams) {
    return this.APIClient.request<Organization>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async getOrganization(params: GetOrganizationParams) {
    const organizationIdOrSlug = 'organizationId' in params ? params.organizationId : params.slug;
    this.requireId(organizationIdOrSlug);

    return this.APIClient.request<Organization>({
      method: 'GET',
      path: joinPaths(basePath, organizationIdOrSlug),
    });
  }

  public async updateOrganization(organizationId: string, params: UpdateParams) {
    this.requireId(organizationId);
    return this.APIClient.request<Organization>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId),
      bodyParams: params,
    });
  }

  public async updateOrganizationMetadata(organizationId: string, params: UpdateMetadataParams) {
    this.requireId(organizationId);

    return this.APIClient.request<Organization>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'metadata'),
      bodyParams: params,
    });
  }

  public async deleteOrganization(organizationId: string) {
    return this.APIClient.request<Organization>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId),
    });
  }

  public async getOrganizationMembershipList(params: GetOrganizationMembershipListParams) {
    const { organizationId, limit, offset } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationMembership[]>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'memberships'),
      queryParams: { limit, offset },
    });
  }

  public async createOrganizationMembership(params: CreateOrganizationMembershipParams) {
    const { organizationId, userId, role } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationMembership>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'memberships'),
      bodyParams: {
        userId,
        role,
      },
    });
  }

  public async updateOrganizationMembership(params: UpdateOrganizationMembershipParams) {
    const { organizationId, userId, role } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationMembership>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'memberships', userId),
      bodyParams: {
        role,
      },
    });
  }

  public async updateOrganizationMembershipMetadata(params: UpdateOrganizationMembershipMetadataParams) {
    const { organizationId, userId, publicMetadata, privateMetadata } = params;

    return this.APIClient.request<OrganizationMembership>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'memberships', userId, 'metadata'),
      bodyParams: {
        publicMetadata,
        privateMetadata,
      },
    });
  }

  public async deleteOrganizationMembership(params: DeleteOrganizationMembershipParams) {
    const { organizationId, userId } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationMembership>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId, 'memberships', userId),
    });
  }

  public async getPendingOrganizationInvitationList(params: GetPendingOrganizationInvitationListParams) {
    const { organizationId, limit, offset } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationInvitation[]>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'invitations', 'pending'),
      queryParams: { limit, offset },
    });
  }

  public async createOrganizationInvitation(params: CreateOrganizationInvitationParams) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationInvitation>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations'),
      bodyParams: { ...bodyParams },
    });
  }

  public async revokeOrganizationInvitation(params: RevokeOrganizationInvitationParams) {
    const { organizationId, invitationId, requestingUserId } = params;
    this.requireId(organizationId);

    return this.APIClient.request<OrganizationInvitation>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations', invitationId, 'revoke'),
      bodyParams: {
        requestingUserId,
      },
    });
  }
}
