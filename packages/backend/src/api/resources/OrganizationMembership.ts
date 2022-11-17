import { Organization } from '../resources';
import { OrganizationMembershipRole } from './Enums';
import type { OrganizationMembershipJSON, OrganizationMembershipPublicUserDataJSON } from './JSON';

export class OrganizationMembership {
  constructor(
    readonly id: string,
    readonly role: OrganizationMembershipRole,
    readonly publicMetadata: Record<string, unknown> = {},
    readonly privateMetadata: Record<string, unknown> = {},
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly organization: Organization,
    readonly publicUserData?: OrganizationMembershipPublicUserData | null,
  ) {}

  static fromJSON(data: OrganizationMembershipJSON) {
    return new OrganizationMembership(
      data.id,
      data.role,
      data.public_metadata,
      data.private_metadata,
      data.created_at,
      data.updated_at,
      Organization.fromJSON(data.organization),
      OrganizationMembershipPublicUserData.fromJSON(data.public_user_data),
    );
  }
}

export class OrganizationMembershipPublicUserData {
  constructor(
    readonly identifier: string,
    readonly firstName: string | null,
    readonly lastName: string | null,
    readonly profileImageUrl: string,
    readonly userId: string,
  ) {}

  static fromJSON(data: OrganizationMembershipPublicUserDataJSON) {
    return new OrganizationMembershipPublicUserData(
      data.identifier,
      data.first_name,
      data.last_name,
      data.profile_image_url,
      data.user_id,
    );
  }
}
