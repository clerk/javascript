import runtime from '../../runtime';
import { joinPaths } from '../../util/path';
import type {
  Organization,
  OrganizationInvitation,
  OrganizationInvitationStatus,
  OrganizationMembership,
} from '../resources';
import type { OrganizationMembershipRole } from '../resources/Enums';
import { AbstractAPI } from './AbstractApi';

const basePath = '/organizations';

type MetadataParams<TPublic = OrganizationPublicMetadata, TPrivate = OrganizationPrivateMetadata> = {
  publicMetadata?: TPublic;
  privateMetadata?: TPrivate;
};

type GetOrganizationListParams = {
  limit?: number;
  offset?: number;
  includeMembersCount?: boolean;
  query?: string;
};

type CreateParams = {
  name: string;
  slug?: string;
  /* The User id for the user creating the organization. The user will become an administrator for the organization. */
  createdBy: string;
  maxAllowedMemberships?: number;
} & MetadataParams;

type GetOrganizationParams = { organizationId: string } | { slug: string };

type UpdateParams = {
  name?: string;
  slug?: string;
  maxAllowedMemberships?: number;
} & MetadataParams;

type UpdateLogoParams = {
  file: Blob | File;
  uploaderUserId: string;
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

type GetOrganizationInvitationListParams = {
  organizationId: string;
  status?: OrganizationInvitationStatus[];
  limit?: number;
  offset?: number;
};

type GetOrganizationInvitationParams = {
  organizationId: string;
  invitationId: string;
};

type RevokeOrganizationInvitationParams = {
  organizationId: string;
  invitationId: string;
  requestingUserId: string;
};

export class OrganizationAPI extends AbstractAPI {
  public async getOrganizationList(params?: GetOrganizationListParams) {
    return this.request<Organization[]>({
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
    const organizationIdOrSlug = 'organizationId' in params ? params.organizationId : params.slug;
    this.requireId(organizationIdOrSlug);

    return this.request<Organization>({
      method: 'GET',
      path: joinPaths(basePath, organizationIdOrSlug),
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
    formData.append('uploader_user_id', params?.uploaderUserId);

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
    const { organizationId, limit, offset } = params;
    this.requireId(organizationId);

    return this.request<OrganizationMembership[]>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'memberships'),
      queryParams: { limit, offset },
    });
  }

  public async createOrganizationMembership(params: CreateOrganizationMembershipParams) {
    const { organizationId, userId, role } = params;
    this.requireId(organizationId);

    return this.request<OrganizationMembership>({
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

    return this.request<OrganizationMembership>({
      method: 'PATCH',
      path: joinPaths(basePath, organizationId, 'memberships', userId),
      bodyParams: {
        role,
      },
    });
  }

  public async updateOrganizationMembershipMetadata(params: UpdateOrganizationMembershipMetadataParams) {
    const { organizationId, userId, publicMetadata, privateMetadata } = params;

    return this.request<OrganizationMembership>({
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

    return this.request<OrganizationMembership>({
      method: 'DELETE',
      path: joinPaths(basePath, organizationId, 'memberships', userId),
    });
  }

  public async getOrganizationInvitationList(params: GetOrganizationInvitationListParams) {
    const { organizationId, status, limit, offset } = params;
    this.requireId(organizationId);

    return this.request<OrganizationInvitation[]>({
      method: 'GET',
      path: joinPaths(basePath, organizationId, 'invitations'),
      queryParams: { status, limit, offset },
    });
  }

  public async createOrganizationInvitation(params: CreateOrganizationInvitationParams) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this.request<OrganizationInvitation>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations'),
      bodyParams: { ...bodyParams },
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
    const { organizationId, invitationId, requestingUserId } = params;
    this.requireId(organizationId);

    return this.request<OrganizationInvitation>({
      method: 'POST',
      path: joinPaths(basePath, organizationId, 'invitations', invitationId, 'revoke'),
      bodyParams: {
        requestingUserId,
      },
    });
  }
}
