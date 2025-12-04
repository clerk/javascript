import type { ClerkResource } from './resource';

/**
 * @inline
 */
export type OrganizationSuggestionStatus = 'pending' | 'accepted';

/**
 * An interface representing an organization suggestion.
 *
 * @interface
 */
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
