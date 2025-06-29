import type {
  AddMemberParams,
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  CommerceSubscriptionJSON,
  CommerceSubscriptionResource,
  CreateOrganizationParams,
  GetDomainsParams,
  GetInvitationsParams,
  GetMembershipRequestParams,
  GetMemberships,
  GetRolesParams,
  GetSubscriptionsParams,
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
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { addPaymentSource, getPaymentSources, initializePaymentSource } from '../modules/commerce';
import { BaseResource, CommerceSubscription, OrganizationInvitation, OrganizationMembership } from './internal';
import { OrganizationDomain } from './OrganizationDomain';
import { OrganizationMembershipRequest } from './OrganizationMembershipRequest';
import { parseJSON, serializeToJSON } from './parser';
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
      const { data: roles, total_count } = res?.response as unknown as ClerkPaginatedResponse<RoleJSON>;

      return {
        total_count,
        data: roles.map(role => new Role(role)),
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

  getSubscriptions = async (
    getSubscriptionsParams?: GetSubscriptionsParams,
  ): Promise<ClerkPaginatedResponse<CommerceSubscriptionResource>> => {
    return await BaseResource._fetch({
      path: `/organizations/${this.id}/commerce/subscriptions`,
      method: 'GET',
      search: convertPageToOffsetSearchParams(getSubscriptionsParams),
    }).then(res => {
      const { data: subscriptions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<CommerceSubscriptionJSON>;

      return {
        total_count,
        data: subscriptions.map(subscription => new CommerceSubscription(subscription)),
      };
    });
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

  initializePaymentSource: typeof initializePaymentSource = params => {
    return initializePaymentSource({
      ...params,
      orgId: this.id,
    });
  };

  addPaymentSource: typeof addPaymentSource = params => {
    return addPaymentSource({
      ...params,
      orgId: this.id,
    });
  };

  getPaymentSources: typeof getPaymentSources = params => {
    return getPaymentSources({
      ...params,
      orgId: this.id,
    });
  };

  protected fromJSON(data: OrganizationJSON | OrganizationJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<OrganizationResource>(data, {
        dateFields: ['createdAt', 'updatedAt'],
        defaultValues: {
          publicMetadata: {},
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): OrganizationJSONSnapshot {
    return {
      object: 'organization',
      ...serializeToJSON(this),
    } as OrganizationJSONSnapshot;
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
