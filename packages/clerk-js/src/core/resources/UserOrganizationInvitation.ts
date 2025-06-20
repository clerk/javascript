import type {
  ClerkPaginatedResponse,
  GetUserOrganizationInvitationsParams,
  OrganizationCustomRoleKey,
  OrganizationInvitationStatus,
  UserOrganizationInvitationJSON,
  UserOrganizationInvitationResource,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { BaseResource } from './internal';
import { parseJSON } from './parser';

export class UserOrganizationInvitation extends BaseResource implements UserOrganizationInvitationResource {
  id!: string;
  emailAddress!: string;
  publicOrganizationData!: UserOrganizationInvitationResource['publicOrganizationData'];
  publicMetadata: OrganizationInvitationPublicMetadata = {};
  status!: OrganizationInvitationStatus;
  role!: OrganizationCustomRoleKey;
  createdAt!: Date;
  updatedAt!: Date;

  static async retrieve(
    params?: GetUserOrganizationInvitationsParams,
  ): Promise<ClerkPaginatedResponse<UserOrganizationInvitation>> {
    return await BaseResource._fetch({
      path: '/me/organization_invitations',
      method: 'GET',
      search: convertPageToOffsetSearchParams(params),
    }).then(res => {
      const { data: invites, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<UserOrganizationInvitationJSON>;

      return {
        total_count,
        data: invites.map(invitation => new UserOrganizationInvitation(invitation)),
      };
    });
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
    Object.assign(
      this,
      parseJSON<UserOrganizationInvitation>(data, {
        dateFields: ['createdAt', 'updatedAt'],
        customTransforms: {
          publicOrganizationData: (value: any) => ({
            hasImage: value.has_image,
            imageUrl: value.image_url,
            name: value.name,
            id: value.id,
            slug: value.slug,
          }),
        },
        defaultValues: {
          publicMetadata: {},
        },
      }),
    );
    return this;
  }
}
