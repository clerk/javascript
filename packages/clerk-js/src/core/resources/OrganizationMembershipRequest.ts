import type { OrganizationInvitationStatus, OrganizationMembershipRequestResource, PublicUserData } from '@clerk/types';
import type { OrganizationMembershipRequestJSON } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

export class OrganizationMembershipRequest extends BaseResource implements OrganizationMembershipRequestResource {
  id!: string;
  organizationId!: string;
  status!: OrganizationInvitationStatus;
  publicUserData!: PublicUserData;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationMembershipRequestJSON) {
    super();
    this.fromJSON(data);
  }

  accept = async (): Promise<OrganizationMembershipRequestResource> => {
    return await this._basePost({
      path: `/organizations/${this.organizationId}/membership_requests/${this.id}/accept`,
    });
  };

  reject = async (): Promise<OrganizationMembershipRequestResource> => {
    return await this._basePost({
      path: `/organizations/${this.organizationId}/membership_requests/${this.id}/reject`,
    });
  };

  protected fromJSON(data: OrganizationMembershipRequestJSON | null): this {
    if (data) {
      this.id = data.id;
      this.organizationId = data.organization_id;
      this.status = data.status;
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
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
    }
    return this;
  }
}

// TODO(@dimkl): deprecate nested property
// deprecatedProperty(OrganizationMembershipRequest, 'publicUserData.profileImageUrl', 'Use `imageUrl` instead.');
