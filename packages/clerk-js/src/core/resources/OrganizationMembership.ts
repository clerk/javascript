import {
  MembershipRole,
  OrganizationMembershipJSON,
  OrganizationMembershipResource,
  PublicUserData,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

export class OrganizationMembership implements OrganizationMembershipResource {
  id!: string;
  publicUserData!: PublicUserData;
  role!: MembershipRole;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: OrganizationMembershipJSON): this {
    this.id = data.id;
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
