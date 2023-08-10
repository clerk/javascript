import type {
  ClerkPaginatedResponse,
  GetUserOrganizationInvitationsParams,
  MembershipRole,
  OrganizationInvitationStatus,
  UserOrganizationInvitationJSON,
  UserOrganizationInvitationResource,
} from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { convertPageToOffset } from '../../utils/pagesToOffset';
import { BaseResource } from './internal';

export class UserOrganizationInvitation extends BaseResource implements UserOrganizationInvitationResource {
  id!: string;
  emailAddress!: string;
  publicOrganizationData!: UserOrganizationInvitationResource['publicOrganizationData'];
  publicMetadata: OrganizationInvitationPublicMetadata = {};
  status!: OrganizationInvitationStatus;
  role!: MembershipRole;
  createdAt!: Date;
  updatedAt!: Date;

  static async retrieve(
    params?: GetUserOrganizationInvitationsParams,
  ): Promise<ClerkPaginatedResponse<UserOrganizationInvitation>> {
    return await BaseResource._fetch({
      path: '/me/organization_invitations',
      method: 'GET',
      search: convertPageToOffset(params) as any,
    })
      .then(res => {
        const { data: invites, total_count } =
          res?.response as unknown as ClerkPaginatedResponse<UserOrganizationInvitationJSON>;

        return {
          total_count,
          data: invites.map(invitation => new UserOrganizationInvitation(invitation)),
        };
      })
      .catch(() => ({
        total_count: 0,
        data: [],
      }));
  }

  constructor(data: UserOrganizationInvitationJSON) {
    super();
    this.fromJSON(data);
  }

  accept = async (): Promise<UserOrganizationInvitation> => {
    return await this._basePost({
      path: `/me/organization_invitations/${this.id}/accept`,
    });
  };

  protected fromJSON(data: UserOrganizationInvitationJSON | null): this {
    if (data) {
      this.id = data.id;
      this.emailAddress = data.email_address;
      this.publicOrganizationData = {
        hasImage: data.public_organization_data.has_image,
        imageUrl: data.public_organization_data.image_url,
        name: data.public_organization_data.name,
        id: data.public_organization_data.id,
        slug: data.public_organization_data.slug,
      };
      this.publicMetadata = data.public_metadata;
      this.role = data.role;
      this.status = data.status;
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
    }
    return this;
  }
}
