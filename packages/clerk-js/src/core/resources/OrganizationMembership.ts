import {
  MembershipRole,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  PublicUserData,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource, Organization } from './internal';

export class OrganizationMembership extends BaseResource implements OrganizationMembershipResource {
  id!: string;
  publicMetadata: Record<string, unknown> = {};
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
    // FIXME: Revise the return type of _baseDelete
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

  protected fromJSON(data: OrganizationMembershipJSON): this {
    this.id = data.id;
    this.organization = new Organization(data.organization);
    this.publicMetadata = data.public_metadata;
    if (data.public_user_data) {
      this.publicUserData = {
        firstName: data.public_user_data.first_name,
        lastName: data.public_user_data.last_name,
        profileImageUrl: data.public_user_data.profile_image_url,
        identifier: data.public_user_data.identifier,
        userId: data.public_user_data.user_id,
      };
    }
    this.role = data.role;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};

export type RetrieveMembershipsParams = {
  limit?: number;
  offset?: number;
};
