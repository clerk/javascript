import type {
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  CustomPlanKey,
  GetUserOrganizationMembershipParams,
  OrganizationCustomRoleKey,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  OrganizationPermissionKey,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { unixEpochToDate } from '../../utils/date';
import { clerkUnsupportedReloadMethod } from '../errors';
import { BaseResource, Organization, PublicUserData } from './internal';

export class OrganizationMembership extends BaseResource implements OrganizationMembershipResource {
  id!: string;
  publicMetadata: OrganizationMembershipPublicMetadata = {};
  publicUserData!: PublicUserData;
  organization!: Organization;
  permissions: OrganizationPermissionKey[] = [];
  role!: OrganizationCustomRoleKey;
  orgPlan: CustomPlanKey | undefined;
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
      search: convertPageToOffsetSearchParams({ ...retrieveMembershipsParams, paginated: true }),
    }).then(res => {
      // TODO: Fix typing
      const { data: suggestions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<OrganizationMembershipJSON>;

      return {
        total_count,
        data: suggestions.map(suggestion => new OrganizationMembership(suggestion)),
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
    if (data.org_plan) {
      this.orgPlan = data.org_plan;
    }
    return this;
  }

  public reload(_?: ClerkResourceReloadParams): Promise<this> {
    clerkUnsupportedReloadMethod('OrganizationMembership');
  }
}

export type UpdateOrganizationMembershipParams = {
  role: OrganizationCustomRoleKey;
};

export type GetOrganizationMembershipsClass = (
  params?: GetUserOrganizationMembershipParams,
) => Promise<ClerkPaginatedResponse<OrganizationMembership>>;
