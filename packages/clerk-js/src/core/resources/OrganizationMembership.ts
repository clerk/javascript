import type {
  ClerkResourceReloadParams,
  MembershipRole,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  PublicUserData,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
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

  static async retrieve(retrieveMembershipsParams?: RetrieveMembershipsParams): Promise<OrganizationMembership[]> {
    return await BaseResource._fetch({
      path: '/me/organization_memberships',
      method: 'GET',
      search: retrieveMembershipsParams as any,
    })
      .then(res => {
        const organizationMembershipsJSON = res?.response as unknown as OrganizationMembershipJSON[];
        return organizationMembershipsJSON.map(orgMem => new OrganizationMembership(orgMem));
      })
      .catch(() => []);
  }

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

export type RetrieveMembershipsParams = {
  limit?: number;
  offset?: number;
};
