import type { OrganizationInvitationStatus, OrganizationMembershipRole } from './Enums';
import type { OrganizationInvitationJSON } from './JSON';

export class OrganizationInvitation {
  private _raw: OrganizationInvitationJSON | null = null;

  public get raw(): OrganizationInvitationJSON | null {
    return this._raw;
  }

  constructor(
    readonly id: string,
    readonly emailAddress: string,
    readonly role: OrganizationMembershipRole,
    readonly organizationId: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly status?: OrganizationInvitationStatus,
    readonly publicMetadata: OrganizationInvitationPublicMetadata = {},
    readonly privateMetadata: OrganizationInvitationPrivateMetadata = {},
  ) {}

  static fromJSON(data: OrganizationInvitationJSON) {
    const res = new OrganizationInvitation(
      data.id,
      data.email_address,
      data.role,
      data.organization_id,
      data.created_at,
      data.updated_at,
      data.status,
      data.public_metadata,
      data.private_metadata,
    );
    res._raw = data;
    return res;
  }
}
