import { OrganizationInvitationStatus, OrganizationMembershipRole } from './Enums';
import type { OrganizationInvitationJSON } from './JSON';

export class OrganizationInvitation {
  constructor(
    readonly id: string,
    readonly emailAddress: string,
    readonly role: OrganizationMembershipRole,
    readonly organizationId: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly status?: OrganizationInvitationStatus,
  ) {}

  static fromJSON(data: OrganizationInvitationJSON) {
    return new OrganizationInvitation(
      data.id,
      data.email_address,
      data.role,
      data.organization_id,
      data.created_at,
      data.updated_at,
      data.status,
    );
  }
}
