import type {
  AddMemberParams,
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  CreateOrganizationParams,
  GetDomainsParams,
  GetInvitationsParams,
  GetMembershipRequestParams,
  GetMemberships,
  GetRolesParams,
  InviteMemberParams,
  InviteMembersParams,
  OrganizationDomainJSON,
  OrganizationDomainResource,
  OrganizationInvitationJSON,
  OrganizationInvitationResource,
  OrganizationJSON,
  OrganizationJSONSnapshot,
  OrganizationMembershipJSON,
  OrganizationMembershipRequestJSON,
  OrganizationMembershipRequestResource,
  OrganizationResource,
  RoleJSON,
  SetOrganizationLogoParams,
  UpdateMembershipParams,
  UpdateOrganizationParams,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { unixEpochToDate } from '../../utils/date';
import { addPaymentMethod, getPaymentMethods, initializePaymentMethod } from '../modules/billing';
import { BaseResource, OrganizationInvitation, OrganizationMembership } from './internal';
import { OrganizationDomain } from './OrganizationDomain';
import { OrganizationMembershipRequest } from './OrganizationMembershipRequest';
import { Role } from './Role';

export class Organization extends BaseResource implements OrganizationResource {
  pathRoot = '/organizations';

  id!: string;
  name!: string;
  slug!: string;
  imageUrl!: string;
  hasImage!: boolean;
  publicMetadata: OrganizationPublicMetadata = {};
  adminDeleteEnabled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  membersCount = 0;
  pendingInvitationsCount = 0;
  maxAllowedMemberships!: number;

  constructor(data: OrganizationJSON | OrganizationJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  static async create(params: CreateOrganizationParams): Promise<OrganizationResource> {
    const json = (
      await BaseResource._fetch<OrganizationJSON>({
        path: '/organizations',
        method: 'POST',
        body: params as any,
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

  getRoles = async (getRolesParams?: GetRolesParams) => {
    return await BaseResource._fetch(
      {
        path: `/organizations/${this.id}/roles`,
        method: 'GET',
        search: convertPageToOffsetSearchParams(getRolesParams),
      },
      {
        forceUpdateClient: true,
      },
    ).then(res => {
      const {
        data: roles,
        total_count,
        has_role_set_migration,
      } = res?.response as unknown as ClerkPaginatedResponse<RoleJSON> & {
        has_role_set_migration?: boolean;
      };

      return {
        total_count,
        data: roles.map(role => new Role(role)),
        has_role_set_migration,
      };
    });
  };

  getDomains = async (
    getDomainParams?: GetDomainsParams,
  ): Promise<ClerkPaginatedResponse<OrganizationDomainResource>> => {
    return await BaseResource._fetch(
      {
        path: `/organizations/${this.id}/domains`,
        method: 'GET',
        search: convertPageToOffsetSearchParams(getDomainParams),
      },
      {
        forceUpdateClient: true,
      },
    ).then(res => {
      const { data: invites, total_count } = res?.response as unknown as ClerkPaginatedResponse<OrganizationDomainJSON>;

      return {
        total_count,
        data: invites.map(domain => new OrganizationDomain(domain)),
      };
    });
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
      search: convertPageToOffsetSearchParams(getRequestParam),
    }).then(res => {
      const { data: requests, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<OrganizationMembershipRequestJSON>;

      return {
        total_count,
        data: requests.map(request => new OrganizationMembershipRequest(request)),
      };
    });
  };

  createDomain = async (name: string): Promise<OrganizationDomainResource> => {
    return OrganizationDomain.create(this.id, { name });
  };

  getMemberships: GetMemberships = async getMembershipsParams => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/memberships`,
      method: 'GET',
      // `paginated` is used in some legacy endpoints to support clerk paginated responses
      // The parameter will be dropped in FAPI v2
      search: convertPageToOffsetSearchParams({ ...getMembershipsParams, paginated: true }),
    }).then(res => {
      const { data: suggestions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<OrganizationMembershipJSON>;

      return {
        total_count,
        data: suggestions.map(suggestion => new OrganizationMembership(suggestion)),
      };
    });
  };

  getInvitations = async (
    getInvitationsParams?: GetInvitationsParams,
  ): Promise<ClerkPaginatedResponse<OrganizationInvitationResource>> => {
    return await BaseResource._fetch(
      {
        path: `/organizations/${this.id}/invitations`,
        method: 'GET',
        search: convertPageToOffsetSearchParams(getInvitationsParams),
      },
      {
        forceUpdateClient: true,
      },
    ).then(res => {
      const { data: requests, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<OrganizationInvitationJSON>;

      return {
        total_count,
        data: requests.map(request => new OrganizationInvitation(request)),
      };
    });
  };

  addMember = async ({ userId, role }: AddMemberParams) => {
    return await BaseResource._fetch({
      method: 'POST',
      path: `/organizations/${this.id}/memberships`,
      body: { userId, role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
  };

  inviteMember = async (params: InviteMemberParams) => {
    return OrganizationInvitation.create(this.id, params);
  };

  inviteMembers = async (params: InviteMembersParams) => {
    return OrganizationInvitation.createBulk(this.id, params);
  };

  updateMember = async ({ userId, role }: UpdateMembershipParams): Promise<OrganizationMembership> => {
    return await BaseResource._fetch({
      method: 'PATCH',
      path: `/organizations/${this.id}/memberships/${userId}`,
      body: { role } as any,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
  };

  removeMember = async (userId: string): Promise<OrganizationMembership> => {
    return await BaseResource._fetch({
      method: 'DELETE',
      path: `/organizations/${this.id}/memberships/${userId}`,
    }).then(res => new OrganizationMembership(res?.response as OrganizationMembershipJSON));
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

  initializePaymentMethod: typeof initializePaymentMethod = params => {
    return initializePaymentMethod({
      ...params,
      orgId: this.id,
    });
  };

  addPaymentMethod: typeof addPaymentMethod = params => {
    return addPaymentMethod({
      ...params,
      orgId: this.id,
    });
  };

  getPaymentMethods: typeof getPaymentMethods = params => {
    return getPaymentMethods({
      ...params,
      orgId: this.id,
    });
  };

  protected fromJSON(data: OrganizationJSON | OrganizationJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.imageUrl = data.image_url || '';
    this.hasImage = data.has_image || false;
    this.publicMetadata = data.public_metadata || {};
    this.membersCount = data.members_count || 0;
    this.pendingInvitationsCount = data.pending_invitations_count || 0;
    this.maxAllowedMemberships = data.max_allowed_memberships || 0;
    this.adminDeleteEnabled = data.admin_delete_enabled || false;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }

  public __internal_toSnapshot(): OrganizationJSONSnapshot {
    return {
      object: 'organization',
      id: this.id,
      name: this.name,
      slug: this.slug,
      image_url: this.imageUrl,
      has_image: this.hasImage,
      public_metadata: this.publicMetadata,
      members_count: this.membersCount,
      pending_invitations_count: this.pendingInvitationsCount,
      max_allowed_memberships: this.maxAllowedMemberships,
      admin_delete_enabled: this.adminDeleteEnabled,
      created_at: this.createdAt.getTime(),
      updated_at: this.updatedAt.getTime(),
    };
  }

  public async reload(params?: ClerkResourceReloadParams): Promise<this> {
    const { rotatingTokenNonce } = params || {};

    const json = (
      await BaseResource._fetch<OrganizationJSON>(
        {
          path: `/organizations/${this.id}`,
          method: 'GET',
          rotatingTokenNonce,
        },
        { forceUpdateClient: true },
      )
    )?.response as unknown as OrganizationJSON;

    return this.fromJSON(json);
  }
}
