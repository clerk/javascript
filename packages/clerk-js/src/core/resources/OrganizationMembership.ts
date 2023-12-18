import type {
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  GetUserOrganizationMembershipParams,
  OrganizationCustomRoleKey,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  OrganizationPermissionKey,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { convertPageToOffset } from '../../utils/pagesToOffset';
import { BaseResource, Organization, PublicUserData } from './internal';

export class OrganizationMembership extends BaseResource implements OrganizationMembershipResource {
  id!: string;
  publicMetadata: OrganizationMembershipPublicMetadata = {};
  publicUserData!: PublicUserData;
  organization!: Organization;
  permissions: OrganizationPermissionKey[] = [];
  role!: OrganizationCustomRoleKey;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipJSON) {
    super();
    this.fromJSON(data);
  }

  static retrieve: GetOrganizationMembershipsClass = async retrieveMembershipsParams => {
    return await BaseResource._fetch({
      path: '/me/organization_memberships',
      method: 'GET',
      // `paginated` is used in some legacy endpoints to support clerk paginated responses
      // The parameter will be dropped in FAPI v2
      search: convertPageToOffset({ ...retrieveMembershipsParams, paginated: true }),
    })
      .then(res => {
        if (!res?.response) {
          return {
            total_count: 0,
            data: [],
          };
        }

        // TODO: Fix typing
        const { data: suggestions, total_count } =
          res.response as unknown as ClerkPaginatedResponse<OrganizationMembershipJSON>;

        return {
          total_count,
          data: suggestions.map(suggestion => new OrganizationMembership(suggestion)),
        };
      })
      .catch(() => {
        return {
          total_count: 0,
          data: [],
        };
      });
  };

  destroy = async (): Promise<OrganizationMembership> => {
    // TODO: Revise the return type of _baseDelete
    return (await this._baseDelete({
      path: `/organizations/${this.organization.id}/memberships/${this.publicUserData.userId}`,
    })) as unknown as OrganizationMembership;
  };

  update = async ({ role }: UpdateOrganizationMembershipParams): Promise<OrganizationMembership> => {
    return await this._basePatch({
      path: `/organizations/${this.organization.id}/memberships/${this.publicUserData.userId}`,
      body: { role },
    });
  };

  protected fromJSON(data: OrganizationMembershipJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.organization = new Organization(data.organization);
    this.publicMetadata = data.public_metadata;
    if (data.public_user_data) {
      this.publicUserData = new PublicUserData(data.public_user_data);
    }
    this.permissions = Array.isArray(data.permissions) ? [...data.permissions] : [];
    this.role = data.role;
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

    if (!json?.response) {
      return this.fromJSON(null);
    }

    // TODO: Fix typing
    const currentMembership = (json.response as unknown as OrganizationMembershipJSON[]).find(
      orgMem => orgMem.id === this.id,
    );

    return this.fromJSON(currentMembership as OrganizationMembershipJSON);
  }
}

export type UpdateOrganizationMembershipParams = {
  role: OrganizationCustomRoleKey;
};

export type GetOrganizationMembershipsClass = (
  params?: GetUserOrganizationMembershipParams,
) => Promise<ClerkPaginatedResponse<OrganizationMembership>>;
