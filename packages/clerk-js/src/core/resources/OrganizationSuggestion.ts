import type {
  ClerkPaginatedResponse,
  GetUserOrganizationSuggestionsParams,
  OrganizationSuggestionJSON,
  OrganizationSuggestionResource,
  OrganizationSuggestionStatus,
  UserOrganizationInvitationResource,
} from '@clerk/shared/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

export class OrganizationSuggestion extends BaseResource implements OrganizationSuggestionResource {
  id!: string;
  publicOrganizationData!: UserOrganizationInvitationResource['publicOrganizationData'];
  status!: OrganizationSuggestionStatus;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: OrganizationSuggestionJSON) {
    super();
    this.fromJSON(data);
  }

  static async retrieve(
    params?: GetUserOrganizationSuggestionsParams,
  ): Promise<ClerkPaginatedResponse<OrganizationSuggestion>> {
    return await BaseResource._fetch({
      path: '/me/organization_suggestions',
      method: 'GET',
      search: convertPageToOffsetSearchParams(params),
    }).then(res => {
      const { data: suggestions, total_count } =
        res?.response as unknown as ClerkPaginatedResponse<OrganizationSuggestionJSON>;

      return {
        total_count,
        data: suggestions.map(suggestion => new OrganizationSuggestion(suggestion)),
      };
    });
  }

  accept = async (): Promise<OrganizationSuggestionResource> => {
    return await this._basePost({
      path: `/me/organization_suggestions/${this.id}/accept`,
    });
  };

  protected fromJSON(data: OrganizationSuggestionJSON | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.publicOrganizationData = {
        hasImage: data.public_organization_data.has_image,
        imageUrl: data.public_organization_data.image_url,
        name: data.public_organization_data.name,
        id: data.public_organization_data.id,
        slug: data.public_organization_data.slug,
      };
      this.createdAt = unixEpochToDate(data.created_at);
      this.updatedAt = unixEpochToDate(data.updated_at);
    }
    return this;
  }
}
