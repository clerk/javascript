import { deprecated, deprecatedProperty } from '@clerk/shared';
import type {
  AddMemberParams,
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  CreateOrganizationParams,
  GetDomainsParams,
  GetInvitationsParams,
  GetMembershipRequestParams,
  GetMemberships,
  GetPendingInvitationsParams,
  InviteMemberParams,
  InviteMembersParams,
  OrganizationDomainJSON,
  OrganizationDomainResource,
  OrganizationInvitationJSON,
  OrganizationInvitationResource,
  OrganizationJSON,
  OrganizationMembershipJSON,
  OrganizationMembershipRequestJSON,
  OrganizationMembershipRequestResource,
  OrganizationResource,
  SetOrganizationLogoParams,
  UpdateMembershipParams,
  UpdateOrganizationParams,
} from '@clerk/types';
import type { GetMembershipsParams } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { convertPageToOffset } from '../../utils/pagesToOffset';
import { BaseResource, OrganizationInvitation, OrganizationMembership } from './internal';
import { OrganizationDomain } from './OrganizationDomain';
import { OrganizationMembershipRequest } from './OrganizationMembershipRequest';

export class Organization extends BaseResource implements OrganizationResource {
  pathRoot = '/organizations';

  id!: string;
  name!: string;
  slug!: string;
  /**
   * @deprecated  Use `imageUrl` instead.
   */
  logoUrl!: string;
  imageUrl!: string;
  hasImage!: boolean;
  publicMetadata: OrganizationPublicMetadata = {};
  adminDeleteEnabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  membersCount = 0;
  pendingInvitationsCount = 0;
  maxAllowedMemberships!: number;

  constructor(data: OrganizationJSON) {
    super();
    this.fromJSON(data);
  }

  static async create(params: CreateOrganizationParams): Promise<OrganizationResource>;
  /**
   * @deprecated Calling `create` with a string is deprecated. Use an object of type {@link CreateOrganizationParams} instead.
   */
  static async create(name: string): Promise<OrganizationResource>;
  static async create(paramsOrName: string | CreateOrganizationParams): Promise<OrganizationResource> {
    let name;
    let slug;
    if (typeof paramsOrName === 'string') {
      // DX: Deprecated v3.5.2
      name = paramsOrName;
      deprecated(
        'create',
        'Calling `create` with a string is deprecated. Use an object of type CreateOrganizationParams instead.',
        'organization:create',
      );
    } else {
      name = paramsOrName.name;
      slug = paramsOrName.slug;
    }
    const json = (
      await BaseResource._fetch<OrganizationJSON>({
        path: '/organizations',
        method: 'POST',
        body: { name, slug } as any,
      })
    )?.response as unknown as OrganizationJSON;

    return new Organization(json);
  }

  static async get(organizationId: string): Promise<OrganizationResource> {
    const json = (
      await BaseResource._fetch<OrganizationJSON>({
        path: `/organizations/${organizationId}`,
        method: 'GET',
      })
    )?.response as unknown as OrganizationJSON;

    return new Organization(json);
  }

  update = async (params: UpdateOrganizationParams): Promise<OrganizationResource> => {
    return this._basePatch({
      body: params,
    });
  };

  getDomains = async (
    getDomainParams?: GetDomainsParams,
  ): Promise<ClerkPaginatedResponse<OrganizationDomainResource>> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/domains`,
      method: 'GET',
      search: convertPageToOffset(getDomainParams) as any,
    })
      .then(res => {
        const { data: invites, total_count } =
          res?.response as unknown as ClerkPaginatedResponse<OrganizationDomainJSON>;

        return {
          total_count,
          data: invites.map(domain => new OrganizationDomain(domain)),
        };
      })
      .catch(() => ({
        total_count: 0,
        data: [],
      }));
  };

  getDomain = async ({ domainId }: { domainId: string }): Promise<OrganizationDomainResource> => {
    const json = (
      await BaseResource._fetch<OrganizationDomainJSON>({
        path: `/organizations/${this.id}/domains/${domainId}`,
        method: 'GET',
      })
    )?.response as unknown as OrganizationDomainJSON;
    return new OrganizationDomain(json);
  };

  getMembershipRequests = async (
    getRequestParam?: GetMembershipRequestParams,
  ): Promise<ClerkPaginatedResponse<OrganizationMembershipRequestResource>> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/membership_requests`,
      method: 'GET',
      search: convertPageToOffset(getRequestParam) as any,
    })
      .then(res => {
        const { data: requests, total_count } =
          res?.response as unknown as ClerkPaginatedResponse<OrganizationMembershipRequestJSON>;

        return {
          total_count,
          data: requests.map(request => new OrganizationMembershipRequest(request)),
        };
      })
      .catch(() => ({
        total_count: 0,
        data: [],
      }));
  };

  createDomain = async (name: string): Promise<OrganizationDomainResource> => {
    return OrganizationDomain.create(this.id, { name });
  };

  getMemberships: GetMemberships = async getMembershipsParams => {
    const isDeprecatedParams = typeof getMembershipsParams === 'undefined' || !getMembershipsParams?.paginated;

    if (!(getMembershipsParams as GetMembershipsParams)?.limit) {
      deprecated(
        'limit',
        'Use `pageSize` instead in Organization.getMemberships.',
        'organization:getMemberships:limit',
      );
    }
    if (!(getMembershipsParams as GetMembershipsParams)?.offset) {
      deprecated('offset', 'Use `initialPage` instead in Organization.limit.', 'organization:getMemberships:offset');
    }

    return await BaseResource._fetch({
      path: `/organizations/${this.id}/memberships`,
      method: 'GET',
      search: isDeprecatedParams
        ? getMembershipsParams
        : (convertPageToOffset(getMembershipsParams as unknown as any) as any),
    })
      .then(res => {
        if (isDeprecatedParams) {
          const organizationMembershipsJSON = res?.response as unknown as OrganizationMembershipJSON[];
          return organizationMembershipsJSON.map(orgMem => new OrganizationMembership(orgMem)) as any;
        }

        const { data: suggestions, total_count } =
          res?.response as unknown as ClerkPaginatedResponse<OrganizationMembershipJSON>;

        return {
          total_count,
          data: suggestions.map(suggestion => new OrganizationMembership(suggestion)),
        } as any;
      })
      .catch(() => {
        if (isDeprecatedParams) {
          return [];
        }
        return {
          total_count: 0,
          data: [],
        };
      });
  };

  getPendingInvitations = async (
    getPendingInvitationsParams?: GetPendingInvitationsParams,
  ): Promise<OrganizationInvitation[]> => {
    deprecated('getPendingInvitations', 'Use the `getInvitations` method instead.');
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/invitations/pending`,
      method: 'GET',
      search: getPendingInvitationsParams as any,
    })
      .then(res => {
        const pendingInvitations = res?.response as unknown as OrganizationInvitationJSON[];
        return pendingInvitations.map(pendingInvitation => new OrganizationInvitation(pendingInvitation));
      })
      .catch(() => []);
  };

  getInvitations = async (
    getInvitationsParams?: GetInvitationsParams,
  ): Promise<ClerkPaginatedResponse<OrganizationInvitationResource>> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/invitations`,
      method: 'GET',
      search: convertPageToOffset(getInvitationsParams) as any,
    })
      .then(res => {
        const { data: requests, total_count } =
          res?.response as unknown as ClerkPaginatedResponse<OrganizationInvitationJSON>;

        return {
          total_count,
          data: requests.map(request => new OrganizationInvitation(request)),
        };
      })
      .catch(() => ({
        total_count: 0,
        data: [],
      }));
  };

  addMember = async ({ userId, role }: AddMemberParams) => {
    const newMember = await BaseResource._fetch({
      method: 'POST',
      path: `/organizations/${this.id}/memberships`,
      body: { userId, role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
    OrganizationMembership.clerk.__unstable__membershipUpdate(newMember);
    return newMember;
  };

  inviteMember = async (params: InviteMemberParams) => {
    return OrganizationInvitation.create(this.id, params);
  };

  inviteMembers = async (params: InviteMembersParams) => {
    return OrganizationInvitation.createBulk(this.id, params);
  };

  updateMember = async ({ userId, role }: UpdateMembershipParams): Promise<OrganizationMembership> => {
    const updatedMember = await BaseResource._fetch({
      method: 'PATCH',
      path: `/organizations/${this.id}/memberships/${userId}`,
      body: { role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
    OrganizationMembership.clerk.__unstable__membershipUpdate(updatedMember);
    return updatedMember;
  };

  removeMember = async (userId: string): Promise<OrganizationMembership> => {
    const deletedMember = await BaseResource._fetch({
      method: 'DELETE',
      path: `/organizations/${this.id}/memberships/${userId}`,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
    OrganizationMembership.clerk.__unstable__membershipUpdate(deletedMember);
    return deletedMember;
  };

  destroy = async (): Promise<void> => {
    return this._baseDelete();
  };

  setLogo = async ({ file }: SetOrganizationLogoParams): Promise<OrganizationResource> => {
    if (file === null) {
      return await BaseResource._fetch({
        path: `/organizations/${this.id}/logo`,
        method: 'DELETE',
      }).then(res => new Organization(res?.response as OrganizationJSON));
    }

    let body;
    let headers;
    if (typeof file === 'string') {
      body = file;
      headers = new Headers({
        'Content-Type': 'application/octet-stream',
      });
    } else {
      body = new FormData();
      body.append('file', file);
    }

    return await BaseResource._fetch({
      path: `/organizations/${this.id}/logo`,
      method: 'PUT',
      body,
      headers,
    }).then(res => new Organization(res?.response as OrganizationJSON));
  };

  protected fromJSON(data: OrganizationJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.logoUrl = data.logo_url;
    this.imageUrl = data.image_url;
    this.hasImage = data.has_image;
    this.publicMetadata = data.public_metadata;
    this.membersCount = data.members_count;
    this.pendingInvitationsCount = data.pending_invitations_count;
    this.maxAllowedMemberships = data.max_allowed_memberships;
    this.adminDeleteEnabled = data.admin_delete_enabled;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }

  public async reload(params?: ClerkResourceReloadParams): Promise<this> {
    const { rotatingTokenNonce } = params || {};
    const json = await BaseResource._fetch(
      {
        method: 'GET',
        path: `/me/organization_memberships`,
        rotatingTokenNonce,
      },
      { forceUpdateClient: true },
    );
    const currentOrganization = (json?.response as unknown as OrganizationMembershipJSON[]).find(
      orgMem => orgMem.organization.id === this.id,
    );
    return this.fromJSON(currentOrganization?.organization as OrganizationJSON);
  }
}

deprecatedProperty(Organization, 'logoUrl', 'Use `imageUrl` instead.');
