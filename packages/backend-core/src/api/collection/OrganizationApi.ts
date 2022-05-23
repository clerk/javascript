import type { FormDataLike } from '../../types';
import { Organization, OrganizationInvitation, OrganizationMembership } from '../resources';
import { OrganizationMembershipRole } from '../resources/Enums';
import { AbstractApi } from './AbstractApi';

const basePath = '/organizations';

type OrganizationMetadataParams = {
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
  createdBy: string;
} & OrganizationMetadataParams;

type OrganizationMetadataRequestBody = {
  publicMetadata?: string;
  privateMetadata?: string;
};

type GetOrganizationParams = { organizationId: string } | { slug: string };

type UpdateParams = {
  name?: string;
};

type UpdateLogoParams = FormDataLike;
type UpdateLogoHeaders = {
  contentType: string;
};

type UpdateMetadataParams = OrganizationMetadataParams;

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

export class OrganizationApi extends AbstractApi {
  public async getOrganizationList(params?: GetOrganizationListParams) {
    return this._restClient.makeRequest<Organization[]>({
      method: 'GET',
      path: basePath,
      queryParams: params,
    });
  }

  public async createOrganization(params: CreateParams) {
    const { publicMetadata, privateMetadata } = params;
    return this._restClient.makeRequest<Organization>({
      method: 'POST',
      path: basePath,
      bodyParams: {
        ...params,
        ...stringifyMetadataParams({
          publicMetadata,
          privateMetadata,
        }),
      },
    });
  }

  public async getOrganization(params: GetOrganizationParams) {
    const organizationIdOrSlug = 'organizationId' in params ? params.organizationId : params.slug;
    this.requireId(organizationIdOrSlug);

    return this._restClient.makeRequest<Organization>({
      method: 'GET',
      path: `${basePath}/${organizationIdOrSlug}`,
    });
  }

  public async updateOrganization(organizationId: string, params: UpdateParams) {
    this.requireId(organizationId);
    return this._restClient.makeRequest<Organization>({
      method: 'PATCH',
      path: `${basePath}/${organizationId}`,
      bodyParams: params,
    });
  }

  public async updateOrganizationLogo(
    organizationId: string,
    formData: UpdateLogoParams,
    { contentType }: UpdateLogoHeaders,
  ) {
    this.requireId(organizationId);

    return this._restClient.makeRequest<Organization>({
      method: 'PUT',
      path: `${basePath}/${organizationId}/logo`,
      contentType,
      formData,
    });
  }
  public async updateOrganizationMetadata(organizationId: string, params: UpdateMetadataParams) {
    this.requireId(organizationId);

    return this._restClient.makeRequest<Organization>({
      method: 'PATCH',
      path: `${basePath}/${organizationId}/metadata`,
      bodyParams: stringifyMetadataParams(params),
    });
  }

  public async deleteOrganization(organizationId: string) {
    return this._restClient.makeRequest<Organization>({
      method: 'DELETE',
      path: `${basePath}/${organizationId}`,
    });
  }

  public async getOrganizationMembershipList(params: GetOrganizationMembershipListParams) {
    const { organizationId, limit, offset } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationMembership[]>({
      method: 'GET',
      path: `${basePath}/${organizationId}/memberships`,
      queryParams: { limit, offset },
    });
  }

  public async createOrganizationMembership(params: CreateOrganizationMembershipParams) {
    const { organizationId, userId, role } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationMembership>({
      method: 'POST',
      path: `${basePath}/${organizationId}/memberships`,
      bodyParams: {
        userId,
        role,
      },
    });
  }

  public async updateOrganizationMembership(params: UpdateOrganizationMembershipParams) {
    const { organizationId, userId, role } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationMembership>({
      method: 'PATCH',
      path: `${basePath}/${organizationId}/memberships/${userId}`,
      bodyParams: {
        role,
      },
    });
  }

  public async deleteOrganizationMembership(params: DeleteOrganizationMembershipParams) {
    const { organizationId, userId } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationMembership>({
      method: 'DELETE',
      path: `${basePath}/${organizationId}/memberships/${userId}`,
    });
  }

  public async getPendingOrganizationInvitationList(params: GetPendingOrganizationInvitationListParams) {
    const { organizationId, limit, offset } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationInvitation[]>({
      method: 'GET',
      path: `${basePath}/${organizationId}/invitations/pending`,
      queryParams: { limit, offset },
    });
  }

  public async createOrganizationInvitation(params: CreateOrganizationInvitationParams) {
    const { organizationId, ...bodyParams } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationInvitation>({
      method: 'POST',
      path: `${basePath}/${organizationId}/invitations`,
      bodyParams,
    });
  }

  public async revokeOrganizationInvitation(params: RevokeOrganizationInvitationParams) {
    const { organizationId, invitationId, requestingUserId } = params;
    this.requireId(organizationId);

    return this._restClient.makeRequest<OrganizationInvitation>({
      method: 'POST',
      path: `${basePath}/${organizationId}/invitations/${invitationId}/revoke`,
      bodyParams: {
        requestingUserId,
      },
    });
  }
}

function stringifyMetadataParams(
  params: OrganizationMetadataParams & {
    [key: string]: Record<string, unknown> | undefined;
  },
): OrganizationMetadataRequestBody {
  return ['publicMetadata', 'privateMetadata'].reduce(
    (res: Record<string, string>, key: string): Record<string, string> => {
      if (params[key]) {
        res[key] = JSON.stringify(params[key]);
      }
      return res;
    },
    {},
  );
}
