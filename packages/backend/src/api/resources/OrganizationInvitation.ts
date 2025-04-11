import type { OrganizationInvitationStatus, OrganizationMembershipRole } from './Enums';
import type { OrganizationInvitationJSON, PublicOrganizationDataJSON } from './JSON';

export class OrganizationInvitation {
  private _raw: OrganizationInvitationJSON | null = null;

  public get raw(): OrganizationInvitationJSON | null {
    return this._raw;
  }

  constructor(
    readonly id: string,
    readonly emailAddress: string,
    readonly role: OrganizationMembershipRole,
    readonly roleName: string,
    readonly organizationId: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly expiresAt: number,
    readonly url: string | null,
    readonly status?: OrganizationInvitationStatus,
    readonly publicMetadata: OrganizationInvitationPublicMetadata = {},
    readonly privateMetadata: OrganizationInvitationPrivateMetadata = {},
    readonly publicOrganizationData?: PublicOrganizationDataJSON | null,
  ) {}

  static fromJSON(data: OrganizationInvitationJSON) {
    const res = new OrganizationInvitation(
      data.id,
      data.email_address,
      data.role,
      data.role_name,
      data.organization_id,
      data.created_at,
      data.updated_at,
      data.expires_at,
      data.url,
      data.status,
      data.public_metadata,
      data.private_metadata,
      data.public_organization_data,
    );
    res._raw = data;
    return res;
  }
}
