import {
  MembershipRole,
  OrganizationInvitationJSON,
  OrganizationInvitationResource,
  OrganizationInvitationStatus,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';

import { BaseResource } from './internal';

export class OrganizationInvitation
  extends BaseResource
  implements OrganizationInvitationResource
{
  id!: string;
  emailAddress!: string;
  organizationId!: string;
  status!: OrganizationInvitationStatus;
  role!: MembershipRole;
  createdAt!: Date;
  updatedAt!: Date;

  static async create(
    organizationId: string,
    { emailAddress, role, redirectUrl }: CreateOrganizationInvitationParams,
  ): Promise<OrganizationInvitationResource> {
    const json = (
      await BaseResource._fetch<OrganizationInvitationJSON>({
        path: `/organizations/${organizationId}/invitations`,
        method: 'POST',
        body: {
          email_address: emailAddress,
          role,
          redirect_url: redirectUrl,
        } as any,
      })
    )?.response as unknown as OrganizationInvitationJSON;

    return new OrganizationInvitation(json);
  }

  constructor(data: OrganizationInvitationJSON) {
    super();
    this.fromJSON(data);
  }

  revoke = async (): Promise<OrganizationInvitation> => {
    return await this._basePost({
      path: `/organizations/${this.organizationId}/invitations/${this.id}/revoke`,
    });
  };

  protected fromJSON(data: OrganizationInvitationJSON): this {
    this.id = data.id;
    this.emailAddress = data.email_address;
    this.organizationId = data.organization_id;
    this.role = data.role;
    this.status = data.status;
    this.createdAt = unixEpochToDate(data.created_at);
    this.updatedAt = unixEpochToDate(data.updated_at);
    return this;
  }
}

export type CreateOrganizationInvitationParams = {
  emailAddress: string;
  role: MembershipRole;
  redirectUrl?: string;
};
