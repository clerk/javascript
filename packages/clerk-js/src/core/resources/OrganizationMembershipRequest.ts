import type {
  OrganizationInvitationStatus,
  OrganizationMembershipRequestJSON,
  OrganizationMembershipRequestResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';
import { PublicUserData } from './internal';

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
        this.publicUserData = new PublicUserData(data.public_user_data);
      }
    }
    return this;
  }
}
