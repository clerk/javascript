import {
  MembershipRole,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  PublicUserData,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

import { BaseResource } from './internal';

export class OrganizationMembership
  extends BaseResource
  implements OrganizationMembershipResource
{
  id!: string;
  organizationId!: string;
  publicUserData!: PublicUserData;
  role!: MembershipRole;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipJSON) {
    super();
    this.fromJSON(data);
  }

  destroy = async (): Promise<OrganizationMembership> => {
    // FIXME: Revise the return type of _baseDelete
    return (await this._baseDelete({
      path: `/organizations/${this.organizationId}/memberships/${this.publicUserData.userId}`,
    })) as unknown as OrganizationMembership;
  };

  update = async ({
    role,
  }: UpdateOrganizationMembershipParams): Promise<OrganizationMembership> => {
    return await this._basePatch({
      path: `/organizations/${this.organizationId}/memberships/${this.publicUserData.userId}`,
      body: { role },
    });
  };

  protected fromJSON(data: OrganizationMembershipJSON): this {
    this.id = data.id;
    this.organizationId = data.organization_id;
    this.publicUserData = {
      firstName: data.public_user_data.first_name,
      lastName: data.public_user_data.last_name,
      profileImageUrl: data.public_user_data.profile_image_url,
      identifier: data.public_user_data.identifier,
      userId: data.public_user_data.user_id,
    };
    this.role = data.role;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}

export type UpdateOrganizationMembershipParams = {
  role: MembershipRole;
};
