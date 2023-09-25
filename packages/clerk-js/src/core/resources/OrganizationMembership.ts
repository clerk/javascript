import { deprecated } from '@clerk/shared';
import type {
  ClerkPaginatedResponse,
  ClerkResourceReloadParams,
  GetUserOrganizationMembershipParams,
  MembershipRole,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  PublicUserData,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { convertPageToOffset } from '../../utils/pagesToOffset';
import { BaseResource, Organization } from './internal';

export class OrganizationMembership extends BaseResource implements OrganizationMembershipResource {
  id!: string;
  publicMetadata: OrganizationMembershipPublicMetadata = {};
  publicUserData!: PublicUserData;
  organization!: Organization;
  role!: MembershipRole;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipJSON) {
    super();
    this.fromJSON(data);
  }

  static retrieve: GetOrganizationMembershipsClass = async retrieveMembershipsParams => {
    const isDeprecatedParams =
      typeof retrieveMembershipsParams === 'undefined' || !retrieveMembershipsParams?.paginated;

    if (!(retrieveMembershipsParams as RetrieveMembershipsParams)?.limit) {
      deprecated(
        'limit',
        'Use `pageSize` instead in OrganizationMembership.retrieve.',
        'organization-membership:limit',
      );
    }
    if (!(retrieveMembershipsParams as RetrieveMembershipsParams)?.offset) {
      deprecated(
        'offset',
        'Use `initialPage` instead in OrganizationMembership.retrieve.',
        'organization-membership:offset',
      );
    }

    return await BaseResource._fetch({
      path: '/me/organization_memberships',
      method: 'GET',
      search: isDeprecatedParams
        ? retrieveMembershipsParams
        : (convertPageToOffset(retrieveMembershipsParams as unknown as any) as any),
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

  destroy = async (): Promise<OrganizationMembership> => {
    // TODO: Revise the return type of _baseDelete
    const deletedMembership = (await this._baseDelete({
      path: `/organizations/${this.organization.id}/memberships/${this.publicUserData.userId}`,
    })) as unknown as OrganizationMembership;
    OrganizationMembership.clerk.__unstable__membershipUpdate(deletedMembership);
    return deletedMembership;
  };

  update = async ({ role }: UpdateOrganizationMembershipParams): Promise<OrganizationMembership> => {
    const updatedMembership = await this._basePatch({
      path: `/organizations/${this.organization.id}/memberships/${this.publicUserData.userId}`,
      body: { role },
    });
    OrganizationMembership.clerk.__unstable__membershipUpdate(updatedMembership);
    return updatedMembership;
  };

  protected fromJSON(data: OrganizationMembershipJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.organization = new Organization(data.organization);
    this.publicMetadata = data.public_metadata;
    if (data.public_user_data) {
      this.publicUserData = {
        firstName: data.public_user_data.first_name,
        lastName: data.public_user_data.last_name,
        profileImageUrl: data.public_user_data.profile_image_url,
        imageUrl: data.public_user_data.image_url,
        hasImage: data.public_user_data.has_image,
        identifier: data.public_user_data.identifier,
        userId: data.public_user_data.user_id,
      };
    }
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
    const currentMembership = (json?.response as unknown as OrganizationMembershipJSON[]).find(
      orgMem => orgMem.id === this.id,
    );
    return this.fromJSON(currentMembership as OrganizationMembershipJSON);
  }
}

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};

/**
 * @deprecated
 */
export type RetrieveMembershipsParams = {
  /**
   * @deprecated Use pageSize instead
   */
  limit?: number;
  /**
   * @deprecated Use initialPage instead
   */
  offset?: number;
};

type MembershipParams = (RetrieveMembershipsParams | GetUserOrganizationMembershipParams) & {
  paginated?: boolean;
};
export type GetOrganizationMembershipsClass = <T extends MembershipParams>(
  params?: T,
) => T['paginated'] extends true
  ? Promise<ClerkPaginatedResponse<OrganizationMembership>>
  : Promise<OrganizationMembership[]>;
