import type {
  CreateBulkOrganizationInvitationParams,
  CreateOrganizationInvitationParams,
  OrganizationCustomRoleKey,
  OrganizationInvitationJSON,
  OrganizationInvitationResource,
  OrganizationInvitationStatus,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class OrganizationInvitation extends BaseResource implements OrganizationInvitationResource {
  id!: string;
  emailAddress!: string;
  organizationId!: string;
  publicMetadata: OrganizationInvitationPublicMetadata = {};
  status!: OrganizationInvitationStatus;
  role!: OrganizationCustomRoleKey;
  createdAt!: Date;
  updatedAt!: Date;

  static async create(
    organizationId: string,
    params: CreateOrganizationInvitationParams,
  ): Promise<OrganizationInvitationResource> {
    const body: Record<string, any> = {
      email_address: params.emailAddress,
      role: params.role,
    };

    if (params.redirectUrl) {
      body.redirect_url = params.redirectUrl;
    }

    const json = (
      await BaseResource._fetch<OrganizationInvitationJSON>({
        path: `/organizations/${organizationId}/invitations`,
        method: 'POST',
        body: body as any,
      })
    )?.response as unknown as OrganizationInvitationJSON;
    return new OrganizationInvitation(json);
  }

  static async createBulk(
    organizationId: string,
    params: CreateBulkOrganizationInvitationParams,
  ): Promise<OrganizationInvitationResource[]> {
    const body: Record<string, any> = {
      email_address: params.emailAddresses,
      role: params.role,
    };

    if (params.redirectUrl) {
      body.redirect_url = params.redirectUrl;
    }

    const json = (
      await BaseResource._fetch<OrganizationInvitationJSON>({
        path: `/organizations/${organizationId}/invitations/bulk`,
        method: 'POST',
        body: body as any,
      })
    )?.response as unknown as OrganizationInvitationJSON[];
    return json.map(invitationJson => new OrganizationInvitation(invitationJson));
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

  protected fromJSON(data: OrganizationInvitationJSON | null): this {
    if (data) {
      this.id = data.id;
      this.emailAddress = data.email_address;
      this.organizationId = data.organization_id;
      this.publicMetadata = data.public_metadata;
      this.role = data.role;
      this.status = data.status;
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
    }
    return this;
  }
}
