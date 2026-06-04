import type { ClerkResource } from './resource';

/**
 * The current status of an Organization suggestion.
 *
 * @inline
 */
export type OrganizationSuggestionStatus = 'pending' | 'accepted';

/**
 * The `OrganizationSuggestion` object is the model around a suggestion to join an Organization.
 *
 * @interface
 */
export interface OrganizationSuggestionResource extends ClerkResource {
  /**
   * The unique identifier for the suggestion.
   */
  id: string;
  /**
   * Public information about the Organization that the suggestion is for.
   */
  publicOrganizationData: {
    /**
     * Whether the Organization has an image.
     */
    hasImage: boolean;
    /**
     * Holds the Organization's logo. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/development/image-optimization).
     */
    imageUrl: string;
    /**
     * The name of the Organization.
     */
    name: string;
    /**
     * The unique identifier for the Organization.
     */
    id: string;
    /**
     * The URL-friendly identifier of the Organization, or `null` if it has none.
     */
    slug: string | null;
  };
  /**
   * The current status of the suggestion.
   */
  status: OrganizationSuggestionStatus;
  /**
   * The date when the suggestion was created.
   */
  createdAt: Date;
  /**
   * The date when the suggestion was last updated.
   */
  updatedAt: Date;

  /**
   * Accepts the suggestion, creating a request to join the Organization.
   *
   * @returns A promise that resolves to the accepted [`OrganizationSuggestion`](https://clerk.com/docs/reference/types/organization-suggestion) object.
   */
  accept: () => Promise<OrganizationSuggestionResource>;
}
