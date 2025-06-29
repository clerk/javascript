import type {
  ClerkPaginatedResponse,
  GetUserOrganizationSuggestionsParams,
  OrganizationSuggestionJSON,
  OrganizationSuggestionResource,
  OrganizationSuggestionStatus,
  UserOrganizationInvitationResource,
} from '@clerk/types';

import { convertPageToOffsetSearchParams } from '../../utils/convertPageToOffsetSearchParams';
import { BaseResource } from './Base';
import { parseJSON } from './parser';

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
    Object.assign(
      this,
      parseJSON<OrganizationSuggestion>(data, {
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
      }),
    );
    return this;
  }
}
