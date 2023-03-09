import type {
  CreateBulkOrganizationInvitationParams,
  CreateOrganizationInvitationParams,
  MembershipRole,
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
  role!: MembershipRole;
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
    const newInvitation = new OrganizationInvitation(json);
    this.clerk.__unstable__invitationUpdate(newInvitation);
    return newInvitation;
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
    // const newInvitation = new OrganizationInvitation(json);
    // TODO: Figure out what this is...
    // this.clerk.__unstable__invitationUpdate(newInvitation);
    return json.map(invitationJson => new OrganizationInvitation(invitationJson));
  }

  constructor(data: OrganizationInvitationJSON) {
    super();
    this.fromJSON(data);
  }

  revoke = async (): Promise<OrganizationInvitation> => {
    const revokedInvitation = await this._basePost({
      path: `/organizations/${this.organizationId}/invitations/${this.id}/revoke`,
    });
    OrganizationInvitation.clerk.__unstable__invitationUpdate(revokedInvitation);
    return revokedInvitation;
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
