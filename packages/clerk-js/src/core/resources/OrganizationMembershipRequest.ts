import type {
  OrganizationInvitationStatus,
  OrganizationMembershipRequestJSON,
  OrganizationMembershipRequestResource,
} from '@clerk/types';

import { BaseResource, PublicUserData } from './internal';
import { parseJSON } from './parser';

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
    Object.assign(
      this,
      parseJSON<OrganizationMembershipRequest>(data, {
        dateFields: ['createdAt', 'updatedAt'],
        nestedFields: {
          publicUserData: PublicUserData,
        },
      }),
    );
    return this;
  }
}
