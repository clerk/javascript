import type {
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  GetUserOrganizationMembershipParams,
  OrganizationCustomRoleKey,
  OrganizationMembershipJSON,
  OrganizationMembershipJSONSnapshot,
  OrganizationMembershipResource,
  OrganizationPermissionKey,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { clerkUnsupportedReloadMethod } from '../errors';
import { BaseResource } from './internal';
import { Organization } from './Organization';
import { parseJSON, serializeToJSON } from './parser';
import { PublicUserData } from './PublicUserData';

export class OrganizationMembership extends BaseResource implements OrganizationMembershipResource {
  id!: string;
  organization!: Organization;
  publicMetadata: OrganizationMembershipPublicMetadata = {};
  publicUserData?: PublicUserData;
  permissions: OrganizationPermissionKey[] = [];
  role!: OrganizationCustomRoleKey;
  roleName!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipJSON | OrganizationMembershipJSONSnapshot) {
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
    // TODO: Handle case where publicUserData is not present
    return (await this._baseDelete({
      path: `/organizations/${this.organization.id}/memberships/${this.publicUserData?.userId}`,
    })) as unknown as OrganizationMembership;
  };

  update = async ({ role }: UpdateOrganizationMembershipParams): Promise<OrganizationMembership> => {
    // TODO: Handle case where publicUserData is not present
    return await this._basePatch({
      path: `/organizations/${this.organization.id}/memberships/${this.publicUserData?.userId}`,
      body: { role },
    });
  };

  protected fromJSON(data: OrganizationMembershipJSON | OrganizationMembershipJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<OrganizationMembershipResource>(data, {
        dateFields: ['createdAt', 'updatedAt'],
        nestedFields: {
          organization: Organization,
          publicUserData: PublicUserData,
        },
        defaultValues: {
          publicMetadata: {},
          permissions: [],
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): OrganizationMembershipJSONSnapshot {
    return {
      object: 'organization_membership',
      ...serializeToJSON(this, {
        nestedFields: ['organization', 'publicUserData'],
      }),
    } as OrganizationMembershipJSONSnapshot;
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
