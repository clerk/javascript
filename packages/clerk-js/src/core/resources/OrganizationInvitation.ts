import type {
  CreateBulkOrganizationInvitationParams,
  CreateOrganizationInvitationParams,
  OrganizationCustomRoleKey,
  OrganizationInvitationJSON,
  OrganizationInvitationResource,
  OrganizationInvitationStatus,
} from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

export class OrganizationInvitation extends BaseResource implements OrganizationInvitationResource {
  id!: string;
  emailAddress!: string;
  organizationId!: string;
  publicMetadata: OrganizationInvitationPublicMetadata = {};
  status!: OrganizationInvitationStatus;
  role!: OrganizationCustomRoleKey;
  roleName!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static async create(
    organizationId: string,
    { emailAddress, role }: CreateOrganizationInvitationParams,
  ): Promise<OrganizationInvitationResource> {
    const json = (
      await BaseResource._fetch<OrganizationInvitationJSON>({
        path: `/organizations/${organizationId}/invitations`,
        method: 'POST',
        body: { email_address: emailAddress, role } as any,
      })
    )?.response as unknown as OrganizationInvitationJSON;
    return new OrganizationInvitation(json);
  }

  static async createBulk(
    organizationId: string,
    params: CreateBulkOrganizationInvitationParams,
  ): Promise<OrganizationInvitationResource[]> {
    const { emailAddresses, role } = params;
    const json = (
      await BaseResource._fetch<OrganizationInvitationJSON>({
        path: `/organizations/${organizationId}/invitations/bulk`,
        method: 'POST',
        body: { email_address: emailAddresses, role } as any,
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
    Object.assign(
      this,
      parseJSON<OrganizationInvitation>(data, {
        dateFields: ['createdAt', 'updatedAt'],
        defaultValues: {
          publicMetadata: {},
        },
      }),
    );
    return this;
  }
}
