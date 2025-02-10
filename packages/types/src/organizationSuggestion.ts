import type { ClerkResource } from './resource';

export type OrganizationSuggestionStatus = 'pending' | 'accepted';

export interface OrganizationSuggestionResource extends ClerkResource {
  id: string;
  publicOrganizationData: {
    hasImage: boolean;
    imageUrl: string;
    name: string;
    id: string;
    slug: string | null;
  };
  status: OrganizationSuggestionStatus;
  createdAt: Date;
  updatedAt: Date;

  accept: () => Promise<OrganizationSuggestionResource>;
}
