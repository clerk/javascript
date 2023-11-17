import { Organization } from '../resources';
import type { OrganizationMembershipRole } from './Enums';
import type { OrganizationMembershipJSON, OrganizationMembershipPublicUserDataJSON } from './JSON';

export class OrganizationMembership {
  constructor(
    readonly id: string,
    readonly role: OrganizationMembershipRole,
    readonly publicMetadata: OrganizationMembershipPublicMetadata = {},
    readonly privateMetadata: OrganizationMembershipPrivateMetadata = {},
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
    readonly imageUrl: string,
    readonly hasImage: boolean,
    readonly userId: string,
  ) {}

  static fromJSON(data: OrganizationMembershipPublicUserDataJSON) {
    return new OrganizationMembershipPublicUserData(
      data.identifier,
      data.first_name,
      data.last_name,
      data.image_url,
      data.has_image,
      data.user_id,
    );
  }
}
